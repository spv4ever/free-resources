import { useEffect } from 'react';

export default function AdsterraSocialBar() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//cockpiteconomicspayroll.com/fb/e2/c5/fbe2c57e9d3dc84cbba35b5713c188ef.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Limpia el script si el componente se desmonta
      document.body.removeChild(script);
    };
  }, []);

  return null; // No renderiza ningún HTML directamente
}
