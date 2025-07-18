import TenorSearch from '../components/TenorSearch';

export default function GifsPage() {
  return (
    <div style={{
      maxWidth: '1200px',
      width: '80%',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Zona de GIFs con Tenor</h1>
      <TenorSearch />
    </div>
  );
}
