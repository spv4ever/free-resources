import React from 'react';
import '../styles/TokenInfoPage.css';

const TokenInfoPage = () => {
  return (
    <div className="token-info-container">
      <h1>💰 Sistema de Tokens Keiko</h1>

      <section>
        <h2>¿Qué son los tokens?</h2>
        <p>
          Los tokens son créditos que puedes usar en Keiko para acceder a funcionalidades como la generación de imágenes mediante inteligencia artificial.
        </p>
      </section>

      <section>
        <h2>🎨 Generación de Imágenes</h2>
        <p>
          Cada imagen que generas consume 1 token. Puedes seleccionar estilos, proporciones y resolución, sin costes ocultos.
        </p>
        <ul>
          <li>✅ 1 token = 1 imagen</li>
          <li>🎯 Sin límite de creatividad, mientras tengas saldo</li>
        </ul>
      </section>

      <section>
        <h2>🌞 Tokens diarios gratis</h2>
        <p>
          Cada día que accedes a Keiko obtienes <strong>5 tokens gratis</strong> automáticamente por iniciar sesión.
        </p>
        <ul>
          <li>🔥 Recompensa diaria automática</li>
          <li>🔁 No acumulables: se reinician cada día</li>
        </ul>
      </section>

      <section>
        <h2>📈 Planes y crecimiento</h2>
        <p>
          Muy pronto podrás usar tus tokens también para:
        </p>
        <ul>
          <li>⬆️ Escalar imágenes</li>
          <li>🧼 Quitar fondos</li>
          <li>💎 Estilos premium</li>
          <li>🚀 Generación acelerada</li>
        </ul>
        <p>
          Además, ofreceremos planes de suscripción y recarga para usuarios avanzados.
        </p>
      </section>

      <section className="token-call">
        <h2>¿Te has quedado sin tokens?</h2>
        <p>
          Puedes ganar más tokens completando acciones especiales (¡muy pronto!), o suscribiéndote a un plan.
        </p>
        <button className="token-cta-button">Ver opciones de recarga</button>
      </section>
    </div>
  );
};

export default TokenInfoPage;
