// import { useEffect, useRef } from 'react';

// function AdBanner() {
//   const adRef = useRef(null);

//   useEffect(() => {
//     const consent = localStorage.getItem('cookieConsent');

//     if (consent === 'accepted') {
//       window.atOptions = {
//         key: '7b41f8ab4abf2107bbab81fb2739b873',
//         format: 'iframe',
//         height: 90,
//         width: 728,
//         params: {}
//       };

//       const script = document.createElement('script');
//       script.src = '//sunkendifferextreme.com/7b41f8ab4abf2107bbab81fb2739b873/invoke.js';
//       script.type = 'text/javascript';
//       script.async = true;

//       requestAnimationFrame(() => {
//         if (adRef.current) {
//           adRef.current.innerHTML = '';
//           adRef.current.appendChild(script);
//         }
//       });
//     }
//   }, []);

//   return (
//     <div ref={adRef} style={{ textAlign: 'center', margin: '0rem auto' }} />
//   );
// }

// export default AdBanner;


import { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-7920736444321179"
      data-ad-slot="1234567890" // cambia este número por el tuyo real
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  );
}
