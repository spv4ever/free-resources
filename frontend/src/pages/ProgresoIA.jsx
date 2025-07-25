export default function ProgresoIA({ nivel, ciclos }) {
  const niveles = [
    { nivel: 1, ciclos: 0, label: 'Básica' },
    { nivel: 2, ciclos: 500, label: 'Sencilla' },
    { nivel: 5, ciclos: 3000, label: 'Compleja' },
    { nivel: 10, ciclos: 15000, label: 'Avanzada' },
    { nivel: 20, ciclos: 50000, label: 'Suprema' }
  ];

  const siguiente = niveles.find(n => n.nivel > nivel);
  const actual = niveles.findLast(n => n.nivel <= nivel) || niveles[0];

  const progreso =
    siguiente
      ? Math.min(100, ((ciclos - actual.ciclos) / (siguiente.ciclos - actual.ciclos)) * 100)
      : 100;

  return (
    <div className="my-6">
      <h3 className="font-semibold">Progreso de evolución: {actual.label}</h3>
      {siguiente && <p>Próximo nivel: {siguiente.label} ({siguiente.ciclos} ciclos)</p>}
      <div className="w-full h-4 bg-gray-800 rounded mt-2">
        <div
          className="h-full bg-green-500 rounded"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}
