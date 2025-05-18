import React from 'react';
import '../styles/IgraalInfoSection.css';

const IgraalInfoSection = () => {
  return (
    <section className="igraal-landing-section">
      <div className="igraal-hero-box">
        <h2>💰 ¿Te gustaría ganar dinero mientras haces tus compras online?</h2>
        <p>
          Así de simple. No vendes nada. No pagas nada. Solo compras como siempre y recuperas parte del dinero. 
          Todo gracias a iGraal, una plataforma de cashback 100% fiable y con miles de usuarios en España.
        </p>
      </div>

      <div className="igraal-steps">
        <div className="igraal-step">
          <div className="step-number">①</div>
          <h4>Regístrate gratis</h4>
          <p>Solo necesitas un correo electrónico y tendrás acceso a cientos de tiendas con cashback.</p>
        </div>
        <div className="igraal-step">
          <div className="step-number">②</div>
          <h4>Compra como siempre</h4>
          <p>Accede a Amazon, AliExpress, Booking y más desde iGraal y haz tu compra habitual.</p>
        </div>
        <div className="igraal-step">
          <div className="step-number">③</div>
          <h4>Recibe tu cashback</h4>
          <p>En unos días verás tu saldo disponible y podrás retirarlo por PayPal o transferencia.</p>
        </div>
      </div>

      <div className="igraal-proofs">
        <h3>📲 Ejemplos reales de cobros</h3>
        <div className="proof-gallery">
          <img src="/assets/fake-paypal-notification.png" alt="Pago en PayPal" />
          <img src="/assets/fake-bank-transfer.png" alt="Transferencia bancaria" />
          {/* <img src="/assets/fake-balance.png" alt="Saldo acumulado" /> */}
        </div>
        <p className="proof-note">Estas imágenes son simuladas, pero reflejan lo que los usuarios reciben cada mes.</p>
      </div>

      <div className="igraal-cta-box">
        <h3>🎉 Empieza hoy mismo a ganar dinero con tus compras</h3>
        <a
          href="https://es.igraal.com/padrinazgo?padrino=AG_67ae2774a44af"
          className="cta-button big"
          target="_blank"
          rel="noopener noreferrer"
        >
          ÚNETE GRATIS AHORA
        </a>
      </div>
    </section>
  );
};

export default IgraalInfoSection;
