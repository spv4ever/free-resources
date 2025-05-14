import { useEffect } from 'react';

const AnalyticsLoader = () => {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
      if (!window.gaLoaded) {
        window.gaLoaded = true;

        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SMVVY1YF0J';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          window.dataLayer = window.dataLayer || [];
          function gtag() { window.dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-SMVVY1YF0J');
        };
      }
    }
  }, []);

  return null;
};

export default AnalyticsLoader;
