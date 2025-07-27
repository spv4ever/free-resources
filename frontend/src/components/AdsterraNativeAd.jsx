import { useEffect } from 'react';

export default function AdsterraNativeAd() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//cockpiteconomicspayroll.com/10acbcae853f01f6cbf5737892b5e137/invoke.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);

    return () => {
      // Opcional: eliminar el script si cambias de vista
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="container-10acbcae853f01f6cbf5737892b5e137" style={{ margin: '20px 0' }} />
  );
}
