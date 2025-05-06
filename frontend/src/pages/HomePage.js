import React from 'react';
import '../styles/HomePage.css';
import { useEffect, useRef } from 'react';
import SpacexLaunches from '../components/SpacexLaunches';

function HomePage() {
  const adRef1 = useRef(null); // para invoke.js con atOptions
  const adRef2 = useRef(null); // para el contenedor de profitableratecpm

  useEffect(() => {
    // Primer anuncio con atOptions
    window.atOptions = {
      key: '7b41f8ab4abf2107bbab81fb2739b873',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {}
    };

    const script1 = document.createElement('script');
    script1.src = '//sunkendifferextreme.com/7b41f8ab4abf2107bbab81fb2739b873/invoke.js';
    script1.type = 'text/javascript';
    script1.async = true;

    if (adRef1.current) {
      adRef1.current.innerHTML = '';
      adRef1.current.appendChild(script1);
    }

    // Segundo anuncio (profitableratecpm)
    const script2 = document.createElement('script');
    script2.src = '//pl26532855.profitableratecpm.com/3119807f99626201d0d4d511e11bba8b/invoke.js';
    script2.type = 'text/javascript';
    script2.async = true;

    if (adRef2.current) {
      adRef2.current.innerHTML = '<div id="container-3119807f99626201d0d4d511e11bba8b"></div>';
      adRef2.current.appendChild(script2);
    }
  }, []);


  return (
    <div className="homepage-content">
      <h1 className="homepage-title">Bienvenido a KeikoDev Recursos Gratis</h1>
      <SpacexLaunches />
      <div ref={adRef1} style={{ textAlign: 'center', margin: '2rem auto' }} />

{/* Segundo anuncio */}
      <div ref={adRef2} style={{ textAlign: 'center', margin: '2rem auto' }} />
    </div>
  );
}

export default HomePage;
