import React, { useState } from 'react';
import axios from 'axios';

function NasaFetchMonthPage() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!year || !month) return;

    setLoading(true);
    setResultado(null);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/fetch-nasa-month`, {
        year: parseInt(year),
        month: parseInt(month)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setResultado(res.data);
    } catch (err) {
      console.error('Error al buscar imágenes:', err);
      alert('❌ Error al ejecutar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h2>Buscar Imágenes Faltantes por Mes</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <label>
          Año:{' '}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ marginRight: '1rem' }}
          />
        </label>
        <label>
          Mes:{' '}
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min="1"
            max="12"
            style={{ marginRight: '1rem' }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {resultado && (
        <div style={{ background: '#222', padding: '1rem', borderRadius: '8px' }}>
          <p>Total días del mes: <strong>{resultado.total}</strong></p>
          <p>Ya existentes: <strong>{resultado.existentes}</strong></p>
          <p>Nuevas insertadas: <strong>{resultado.nuevos}</strong></p>
          {resultado.fechasInsertadas.length > 0 && (
            <>
              <p>Fechas insertadas:</p>
              <ul>
                {resultado.fechasInsertadas.map((fecha, i) => (
                  <li key={i}>{fecha}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NasaFetchMonthPage;
