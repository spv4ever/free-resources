import { mejorasDisponibles } from '../utils/upgrades';
import API from '../utils/api';

export default function UpgradePanel({ estado, setEstado }) {
  const handleUpgrade = async (id) => {
    try {
      const res = await API.post('/api/generador/upgrade', { upgradeName: id });
      setEstado(res.data.generador);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al aplicar mejora');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Mejoras disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mejorasDisponibles.map((mejora) => {
          const yaAplicada = estado.upgrades.includes(mejora.id);
          const bloqueado = estado.ciclos < mejora.coste;

          return (
            <div
              key={mejora.id}
              className={`border rounded p-4 text-left ${yaAplicada ? 'opacity-50' : ''}`}
            >
              <h3 className="font-bold">{mejora.nombre}</h3>
              <p className="text-sm text-gray-400">{mejora.descripcion}</p>
              <p className="text-sm mt-1">Coste: {mejora.coste} ciclos</p>

              <button
                disabled={bloqueado || yaAplicada}
                onClick={() => handleUpgrade(mejora.id)}
                className={`mt-2 px-4 py-1 rounded text-white text-sm ${
                  bloqueado || yaAplicada
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {yaAplicada ? 'Aplicada' : 'Comprar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
