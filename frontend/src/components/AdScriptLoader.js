import { useEffect } from 'react';

const AdScriptLoader = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//sunkendifferextreme.com/7b41f8ab4abf2107bbab81fb2739b873/invoke.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default AdScriptLoader;