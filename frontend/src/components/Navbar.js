import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assets/new_logo2.png';
import { useToken } from '../context/TokenContext';



function Navbar() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuContentOpen, setSubmenuContentOpen] = useState(false);
  const [submenuEmailOpen, setSubmenuEmailOpen] = useState(false);
  const [submenuAnimeOpen, setSubmenuAnimeOpen] = useState(false);
  const [submenuSeriesOpen, setSubmenuSeriesOpen] = useState(false);
  const [submenuAffiliateOpen, setSubmenuAffiliateOpen] = useState(false);
  const [submenuSpacexOpen, setSubmenuSpacexOpen] = useState(false);
  const [enrichCount, setEnrichCount] = useState(0);
  const [submenuKeikoOpen, setSubmenuKeikoOpen] = useState(false);
  const { balance } = useToken();
  const [submenuBlogOpen, setSubmenuBlogOpen] = useState(false);
  const [submenuEventsOpen, setSubmenuEventsOpen] = useState(false);



  useEffect(() => {
    const fetchPendingEnrich = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/spacex/pending-enrich`);
        const data = await res.json();
        setEnrichCount(data.count || 0);
      } catch (err) {
        console.error('Error al contar pendientes de enriquecer:', err);
      }
    };
    fetchPendingEnrich();
  }, []);

  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Error al parsear user en Navbar:', err);
      setUser(null);
    }
  }

    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.admin-btn')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  // const decodeJwt = (token) => {
  //   const base64Url = token.split('.')[1];
  //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //   const jsonPayload = decodeURIComponent(
  //     atob(base64)
  //       .split('')
  //       .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //       .join('')
  //   );
  //   return JSON.parse(jsonPayload);
  // };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const handleTriggerNasa = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/trigger-nasa`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      alert(data.message || 'Imagen forzada correctamente');
    } catch (err) {
      console.error('Error al forzar imagen NASA:', err);
      alert('❌ Error al forzar la imagen de la NASA');
    }
  };

  const handleEnrich = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/enrich-one-launch`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.message || 'Enriquecimiento ejecutado');
    } catch (err) {
      console.error('Error al enriquecer:', err);
      alert('❌ Error al enriquecer el lanzamiento');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Logo KeikoDev" className="logo-img" />
          <span className="logo-text">KEIKODEV</span>
        </Link>
      </div>
      

      <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user ? (
            <div className="navbar-actions">
              <span className="navbar-user">
                Bienvenido, {user.nickname || user.email} ({user.role})
              </span>
              <span className="token-balance">💰 {balance} tokens</span> {/* <- AÑADIDO */}
              {user.role === 'admin' && (
                <Link to="#" onClick={toggleSidebar} className="admin-btn">Admin</Link>
              )}
              <Link to="/perfil" className="admin-btn">Mi Perfil</Link>
              <Link to="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-btn">Desconectar</Link>
            </div>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {user ? (
            <>
              <span className="navbar-user">Bienvenido, {user.nickname || user.email} ({user.role})</span>
              {user.role === 'admin' && (
                <button className="admin-btn" onClick={() => { toggleSidebar(); setMobileMenuOpen(false); }}>Admin</button>
              )}
              <button className="logout-btn" onClick={handleLogout}>Desconectar</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Iniciar sesión</Link>
          )}
        </div>
      )}

      {sidebarOpen && user?.role === 'admin' && (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
  <div className="sidebar-columns">
    {/* 📁 Columna 1: Contenido */}
    <ul className="sidebar-col">
      <li>
        <button onClick={() => setSubmenuContentOpen(!submenuContentOpen)}>
          📁 Gestión de contenido {submenuContentOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuContentOpen && (
        <>
          <li><Link to="/admin/categories" onClick={toggleSidebar}>📂 Gestionar Categorías</Link></li>
          <li><Link to="/admin/ai-tools" onClick={toggleSidebar}>🤖 Gestionar IA Links</Link></li>
          <li><Link to="/admin/training" onClick={toggleSidebar}>📘 Recursos de Formación</Link></li>
          <li><Link to="/admin/short-categories" onClick={toggleSidebar}>🎬 Categorías de Shorts</Link></li>
          <li><Link to="/admin/sync-shorts" onClick={toggleSidebar}>🔁 Sincronizar Shorts Virales</Link></li>
          <li><Link to="/admin/social-posts" onClick={toggleSidebar}>📢 Social Posts</Link></li>
        </>
      )}

      <li>
        <button onClick={() => setSubmenuBlogOpen(!submenuBlogOpen)}>
          📝 Blog {submenuBlogOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuBlogOpen && (
        <>
          <li><Link to="/admin/blog" onClick={toggleSidebar}>📄 Entradas del blog</Link></li>
          <li><Link to="/admin/blog/create" onClick={toggleSidebar}>🆕 Nueva entrada</Link></li>
        </>
      )}

      <li>
        <button onClick={() => setSubmenuKeikoOpen(!submenuKeikoOpen)}>
          🧠 KeikoPrompts {submenuKeikoOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuKeikoOpen && (
        <>
          <li><Link to="/admin/keiko-packs" onClick={toggleSidebar}>🧩 Packs KeikoPrompts</Link></li>
          <li><Link to="/admin/keiko-prompts" onClick={toggleSidebar}>📋 Prompts KeikoPrompts</Link></li>
          <li><Link to="/admin/imports" onClick={toggleSidebar}>📥 Import KeikoPrompts</Link></li>
          <li><Link to="/admin/DuplicateCleanup" onClick={toggleSidebar}>🧹 DuplicateCleanup</Link></li>
        </>
      )}

      <li>
        <button onClick={() => setSubmenuAnimeOpen(!submenuAnimeOpen)}>
          🎨 Anime Prompts {submenuAnimeOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuAnimeOpen && (
        <li><Link to="/admin/anime-options" onClick={toggleSidebar}>🎨 Opciones Anime Prompts</Link></li>
      )}

      <li>
        <button onClick={() => setSubmenuEventsOpen(!submenuEventsOpen)}>
          📅 Eventos Deportivos {submenuEventsOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuEventsOpen && (
        <li><Link to="/admin/sports-events" onClick={toggleSidebar}>🏁 Gestionar Eventos</Link></li>
      )}
    
    <li>
      <button onClick={() => setSubmenuEmailOpen(!submenuEmailOpen)}>
        📬 Correos y Artículos {submenuEmailOpen ? '▲' : '▼'}
      </button>
    </li>
    {submenuEmailOpen && (
      <>
        <li><Link to="/admin/email-contexts" onClick={toggleSidebar}>📩 Email Contexts</Link></li>
        <li><Link to="/admin/email-review" onClick={toggleSidebar}>📥 Revisar Emails</Link></li>
        <li><Link to="/admin/email-articles" onClick={toggleSidebar}>📰 Revisar Artículos</Link></li>
      </>
    )}
    </ul>

    {/* 📦 Columna 2: Herramientas / Administración */}
    <ul className="sidebar-col">
      <li>
        <button onClick={() => setSubmenuSeriesOpen(!submenuSeriesOpen)}>
          📺 Series {submenuSeriesOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuSeriesOpen && (
        <>
          <li><Link to="/admin/top-series-sync" onClick={toggleSidebar}>🔄 Sincronizar Top Series</Link></li>
          <li><Link to="/admin/top-series-history" onClick={toggleSidebar}>📅 Historial Top Series</Link></li>
        </>
      )}

      <li>
        <button onClick={() => setSubmenuSpacexOpen(!submenuSpacexOpen)}>
          🚀 SpaceX {submenuSpacexOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuSpacexOpen && (
        <>
          <li>
            <button onClick={handleEnrich} className="admin-link-button">
              📥 Enriquecer 1 Lanzamiento {enrichCount > 0 && <span style={{ color: '#00bfff' }}>({enrichCount})</span>}
            </button>
          </li>
          <li><Link to="/admin/spacex" onClick={toggleSidebar}>🧩 Gestión de Lanzamientos</Link></li>
        </>
      )}

      <li>
        <button onClick={() => setSubmenuAffiliateOpen(!submenuAffiliateOpen)}>
          💰 Afiliados y Chollos {submenuAffiliateOpen ? '▲' : '▼'}
        </button>
      </li>
      {submenuAffiliateOpen && (
        <>
          <li><Link to="/admin/affiliate-links" onClick={toggleSidebar}>🔗 Enlaces de Afiliados</Link></li>
          <li><Link to="/admin/affiliate-clicks" onClick={toggleSidebar}>📊 Clics Afiliados</Link></li>
          <li><Link to="/admin/igraal-deals" onClick={toggleSidebar}>🛒 Chollos iGraal</Link></li>
          <li><Link to="/admin/igraal-coupons" onClick={toggleSidebar}>🧾 Cupones Igraal</Link></li>
        </>
      )}

      <li><strong>🛰 NASA</strong></li>
      <li>
        <button onClick={handleTriggerNasa} className="admin-link-button">📸 Forzar imagen NASA</button>
      </li>
      <li><Link to="/admin/nasa-fechas" onClick={toggleSidebar}>📅 Buscar imágenes faltantes</Link></li>

      <li><strong>🔐 Seguridad</strong></li>
      <li><Link to="/admin/suspicious-access" onClick={toggleSidebar}>🚨 Accesos sospechosos</Link></li>
      <li><Link to="/admin/link-analysis" onClick={toggleSidebar}>🔗 Análisis de enlaces</Link></li>

      <li><strong>👥 Usuarios</strong></li>
      <li><Link to="/admin/users" onClick={toggleSidebar}>👤 Gestionar usuarios</Link></li>
      <li><Link to="/admin/register-logs" onClick={toggleSidebar}>👤 Intentos de registro</Link></li>
      <li><strong>🧼 Limpieza</strong></li>
        <li><Link to="/admin/temp-files" onClick={toggleSidebar}>🗑️ Archivos Temporales</Link></li>
      <li><button className="sidebar-close-btn" onClick={toggleSidebar}>❌ Cerrar</button></li>
    </ul>
  </div>
</div>

      )}
      <a href="https://www.buymeacoffee.com/keikodev"><img src="https://img.buymeacoffee.com/button-api/?text=Apoyar el proyecto&emoji=🔔&slug=keikodev&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" alt="Apoya la web"/></a>
    </nav>
  );
}

export default Navbar;
