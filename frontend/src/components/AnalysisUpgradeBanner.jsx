import React from 'react';
import '../styles/AnalysisUpgradeBanner.css';

const AnalysisUpgradeBanner = ({ user }) => {
  // 🟥 No registrado
  if (!user) {
    return (
      <div className="link-analysis-banner-unificado">
        <h3>⚠️ Este análisis es básico</h3>
        <p>
          No se detectaron amenazas en Google Safe Browsing, pero esta revisión es limitada.
          Algunos enlaces nuevos o sofisticados podrían no ser detectados aún.
        </p>

        <p>
          🔍 Como usuario registrado, podrías acceder a:
        </p>
        <ul>
          <li>🛡️ Ver detalles técnicos del enlace</li>
          <li>🕓 Guardar y revisar tu historial de análisis</li>
          <li>🔔 Recibir alertas si cambia el estado del enlace</li>
          <li>📌 Clasificar enlaces como favoritos o bloqueados</li>
        </ul>

        <p>
          Para un análisis más completo (reputación IP, redirecciones, WHOIS...), te recomendamos usar nuestro sistema avanzado.
        </p>

        <div className="banner-buttons">
          <a className="btn primary" href="/registro">Crear cuenta gratuita</a>
          <a className="btn secondary" href="/login">Iniciar sesión</a>
        </div>
      </div>
    );
  }

  // 🟨 Registrado nivel FREE
  if (user.role === 'free') {
    return (
      <div className="link-analysis-banner-unificado">
        <h3>🔓 ¿Quieres acceso completo?</h3>
        <p>
          Estás usando la versión gratuita del análisis. Esto cubre lo más básico, pero para una protección total puedes desbloquear:
        </p>
        <ul>
          <li>⚡ Escaneo profundo de scripts embebidos</li>
          <li>🛰️ Resolución de redirecciones y análisis WHOIS</li>
          <li>🔒 Evaluación cruzada con múltiples listas negras en tiempo real</li>
        </ul>

        <div className="banner-buttons">
          <a className="btn primary" href="/mejorar-plan">Mejorar a PRO</a>
        </div>
      </div>
    );
  }

  // 🟢 Usuario PRO o ADMIN → No mostrar nada
  return null;
};

export default AnalysisUpgradeBanner;
