import { useEffect, useRef } from 'react';

function AdBannerExtra() {
  const adRef = useRef(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
      const script = document.createElement('script');
      script.src = '//sunkendifferextreme.com/fb/e2/c5/fbe2c57e9d3dc84cbba35b5713c188ef.js';
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

export default AdBannerExtra;
