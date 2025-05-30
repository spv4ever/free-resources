import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserLinkDetail.css';

const UserLinkDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pro/link-analysis/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el análisis.');
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (error) return <div className="user-link-detail-container"><p>{error}</p></div>;
  if (!data) return <div className="user-link-detail-container"><p>Cargando...</p></div>;

  return (
    <div className="user-link-detail-container">
      <h2>🔍 Detalle del análisis</h2>
      <p><strong>Enlace original:</strong> <span className="url-raw">{data.urlOriginal}</span></p>
      <p><strong>Resultado general:</strong> {data.resultado}</p>
      <p><strong>Fecha:</strong> {new Date(data.fecha).toLocaleString()}</p>

      {data.detalles?.tecnicos && (
        <div className="detalles-tecnicos">
          <h4>🔧 Detalles técnicos</h4>
          <ul>
            <li><strong>Dominio:</strong> {data.detalles.tecnicos.dominio}</li>
            <li><strong>SSL:</strong> {data.detalles.tecnicos.ssl}</li>
            <li><strong>WHOIS:</strong> <a href={data.detalles.tecnicos.whois} target="_blank" rel="noreferrer">Ver</a></li>
            <li><strong>Reputación:</strong> <a href={data.detalles.tecnicos.reputacion} target="_blank" rel="noreferrer">Consultar</a></li>
          </ul>
        </div>
      )}

      {data.aiAnalysis && (
        <div className="detalles-ia">
          <h4>🧠 Análisis con IA</h4>
          <ul>
            <li><strong>Riesgo:</strong> {data.aiAnalysis.riskLevel}</li>
            <li><strong>Tipo de amenaza:</strong> {data.aiAnalysis.threatType}</li>
            <li><strong>Modelo:</strong> {data.aiAnalysis.model}</li>
            <li><strong>Resumen:</strong> <p>{data.aiAnalysis.summary}</p></li>
          </ul>

          <div className="recomendaciones">
            <h5>🔐 Recomendaciones:</h5>
            <ul>
              {data.aiAnalysis.riskLevel === 'alto' && (
                <>
                  <li>Evita interactuar con el sitio.</li>
                  <li>Usa protección en tiempo real (antivirus, firewall).</li>
                  <li><a href="https://www.amazon.es/dp/B0897G5JSC?tag=tuaffiliado" target="_blank" rel="noreferrer">Usa una VPN confiable (Amazon)</a></li>
                </>
              )}
              {data.aiAnalysis.riskLevel === 'medio' && (
                <>
                  <li>No compartas datos personales.</li>
                  <li><a href="https://www.amazon.es/dp/B0897G5JSC?tag=tuaffiliado" target="_blank" rel="noreferrer">Navega con VPN para más seguridad</a></li>
                </>
              )}
              {data.aiAnalysis.riskLevel === 'bajo' && (
                <li>El riesgo es bajo, pero sigue buenas prácticas como 2FA y navegación segura.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <Link to="/panel/pro/historial" className="volver">← Volver al historial</Link>
    </div>
  );
};

export default UserLinkDetail;
