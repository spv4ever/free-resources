import { useEffect, useRef } from 'react';

function AdBanner() {
  const adRef = useRef(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
      window.atOptions = {
        key: '7b41f8ab4abf2107bbab81fb2739b873',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {}
      };

      const script = document.createElement('script');
      script.src = '//sunkendifferextreme.com/7b41f8ab4abf2107bbab81fb2739b873/invoke.js';
      script.type = 'text/javascript';
      script.async = true;

      requestAnimationFrame(() => {
        if (adRef.current) {
          adRef.current.innerHTML = '';
          adRef.current.appendChild(script);
        }
      });
    }
  }, []);

  return (
    <div ref={adRef} style={{ textAlign: 'center', margin: '2rem auto' }} />
  );
}

export default AdBanner;
