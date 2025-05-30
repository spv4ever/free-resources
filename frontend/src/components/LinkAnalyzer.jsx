import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LinkAnalyzer.css';
import { useUser } from '../context/UserContext';
import AnalysisUpgradeBanner from './AnalysisUpgradeBanner';

const LinkAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const { user } = useUser();

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!isValidUrl(url)) {
      setError('Por favor introduce un enlace válido (https://...)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/analyze-link`,
        { url },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      console.log('✅ Resultado recibido:', res.data); // Depuración
      
      setResult(res.data);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="link-analyzer-card">
      <h2>🔎 Analizador de enlaces sospechosos</h2>

      <input
        type="text"
        placeholder="Pega aquí un enlace sospechoso..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error && isValidUrl(e.target.value)) setError('');
        }}
        className={!isValidUrl(url) && url ? 'input-error' : ''}
      />

      <button onClick={handleAnalyze} disabled={loading || !url.trim()}>
        {loading ? 'Analizando...' : 'Analizar'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className={`resultado ${result.resultado}`}>
          <p>
            <strong>Resultado:</strong>{' '}
            {result.resultado === 'seguro' && '✅ Seguro'}
            {result.resultado === 'sospechoso' && '⚠️ Sospechoso'}
            {result.resultado === 'peligroso' && '❌ Peligroso'}
          </p>
          <p>{result.resumen}</p>

          {/* ✅ Detalles técnicos para usuarios free */}
          {result?.detalles?.tecnicos && (
            <div className="detalles-tecnicos">
              <h4>🔧 Detalles técnicos (nivel FREE)</h4>
              <ul>
                <li><strong>Dominio:</strong> {result.detalles.tecnicos.dominio}</li>
                <li><strong>SSL:</strong> {result.detalles.tecnicos.ssl}</li>
                <li>
                  <strong>WHOIS:</strong>{' '}
                  <a href={result.detalles.tecnicos.whois} target="_blank" rel="noreferrer">
                    Ver información
                  </a>
                </li>
                <li>
                  <strong>Reputación externa:</strong>{' '}
                  <a href={result.detalles.tecnicos.reputacion} target="_blank" rel="noreferrer">
                    Consultar en urlscan.io
                  </a>
                </li>
              </ul>
            </div>
          )}
          {user?.role === 'pro' && result?.aiAnalysis && (
            <div className="analisis-ia">
              <h4>🧠 Análisis con IA (nivel PRO)</h4>
              <ul>
                <li>
                  <strong>Riesgo estimado:</strong>{' '}
                  {result.aiAnalysis.riskLevel === 'alto' && '❌ Alto'}
                  {result.aiAnalysis.riskLevel === 'medio' && '⚠️ Medio'}
                  {result.aiAnalysis.riskLevel === 'bajo' && '✅ Bajo'}
                </li>
                <li>
                  <strong>Tipo de amenaza:</strong>{' '}
                  {result.aiAnalysis.threatType || 'No detectada'}
                </li>
                <li>
                  <strong>Resumen generado:</strong>
                  <p>{result.aiAnalysis.summary}</p>
                </li>
                <li>
                  <strong>Modelo usado:</strong> {result.aiAnalysis.model}
                </li>
              </ul>

              {/* 🔐 Recomendaciones adicionales */}
              <div className="recomendaciones">
                <h5>🔒 Recomendaciones de protección:</h5>
                <ul>
                  {result.aiAnalysis.riskLevel === 'alto' && (
                    <>
                      <li>Evita abrir este enlace o descargar contenido del sitio.</li>
                      <li>Activa la protección en tiempo real de tu antivirus.</li>
                      <li>
                        Usa una VPN segura para navegar: <a href="https://amzn.to/43E2c62" target="_blank" rel="noreferrer">Ver opciones de VPN recomendadas</a>
                      </li>
                    </>
                  )}
                  {result.aiAnalysis.riskLevel === 'medio' && (
                    <>
                      <li>No compartas información personal en el sitio.</li>
                      <li>
                        Considera usar una VPN para proteger tu conexión: <a href="https://amzn.to/3HjuAmz" target="_blank" rel="noreferrer">Ver en Amazon</a>
                      </li>
                    </>
                  )}
                  {result.aiAnalysis.riskLevel === 'bajo' && (
                    <li>El sitio parece seguro, pero mantén buenas prácticas como navegación privada y autenticación en dos pasos.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* 🔒 Mostrar banner según estado del usuario */}
          {!user && <AnalysisUpgradeBanner />}
          {user?.role === 'free' && <AnalysisUpgradeBanner user={user} />}
        </div>
      )}
    </div>
  );
};

export default LinkAnalyzer;
