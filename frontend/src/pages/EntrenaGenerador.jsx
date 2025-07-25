import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import UpgradePanel from './UpgradePanel.jsx';
import ProgresoIA from './ProgresoIA.jsx';
import API from '../utils/api';

export default function EntrenaGenerador() {
  const [estado, setEstado] = useState(null);

  // Fetch inicial
  useEffect(() => {
    API.get('/api/generador').then(res => setEstado(res.data));
  }, []);

  // Ciclos automáticos
  useEffect(() => {
    if (!estado?.cicloPorSegundo) return;
    const interval = setInterval(() => {
      setEstado(prev => ({ ...prev, ciclos: prev.ciclos + prev.cicloPorSegundo }));
    }, 1000);
    return () => clearInterval(interval);
  }, [estado?.cicloPorSegundo]);

  const handleClick = async () => {
    const res = await API.post('/api/generador/click');
    setEstado(prev => ({ ...prev, ciclos: res.data.ciclos }));
  };

  if (!estado) return <div>Cargando...</div>;

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold mb-4">Entrena al Generador IA</h1>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg"
        onClick={handleClick}
      >
        Entrenar IA (+{estado.clicMultiplier} ciclo)
      </motion.button>

      <div className="my-4">
        <p>Ciclos: {estado.ciclos}</p>
        <p>Nivel: {estado.nivel}</p>
      </div>

      <ProgresoIA nivel={estado.nivel} ciclos={estado.ciclos} />
      <UpgradePanel estado={estado} setEstado={setEstado} />
    </div>
  );
}
