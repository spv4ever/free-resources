import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Mantenemos el CSS que ya tienes

function Navbar() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Para abrir y cerrar el sidebar

//  const [location, setLocation] = useState(null);

// useEffect(() => {
//   navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords;
//           setLocation({ lat: latitude, lon: longitude });
//         },
//         (err) => {
//           console.error('Geolocalización denegada o fallida');
//         }
//       );
//     }, []);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decodificar el token (aquí usaremos una librería como jwt-decode)
      const decodedToken = decodeJwt(token);
      setUser({
        name: decodedToken.name, // O el campo que esté en el token
        role: decodedToken.role, // free, pro, admin
      });
    }

    // Cerrar el sidebar si se hace clic fuera
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.admin-btn')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token
    localStorage.removeItem('user'); // Eliminar el token

    setUser(null); // Limpiar el estado de usuario
    window.location.href = '/'; // Redirigir a home
  };

  const handleTriggerNasa = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/trigger-nasa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      const data = await res.json();
      alert(data.message || 'Imagen forzada correctamente');
    } catch (err) {
      console.error('Error al forzar la imagen NASA:', err);
      alert('❌ Error al forzar la imagen de la NASA');
    }
  };
  

  const decodeJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload); // Devuelve el contenido decodificado
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">KEIKODEV</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span className="navbar-user">
              Bienvenido, {user.name} ({user.role})
            </span>
            {user.role === 'admin' && (
              <button className="admin-btn" onClick={toggleSidebar}>Admin</button>
            )}
            <button className="logout-btn" onClick={handleLogout}>Desconectar</button>
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>

      {sidebarOpen && (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/admin/categories" onClick={toggleSidebar}>Gestionar Categorías</Link></li>
            {/* Puedes agregar más enlaces de administración aquí */}
            <li><Link to="/admin/ai-tools" onClick={toggleSidebar}>Gestionar IA Links</Link></li>
            <li>
              <button
                onClick={handleTriggerNasa}
                className="admin-link-button"
                title="Descargar la imagen de la NASA manualmente"
              >
                Forzar imagen NASA
              </button>
            </li>
            <li>
              <Link to="/admin/nasa-fechas" onClick={toggleSidebar}>
                Buscar imágenes faltantes
              </Link>
            </li>
            <li><Link to="/admin/training" onClick={toggleSidebar}>Recursos de Formación</Link></li>
            <li><Link to="/admin/short-categories">Categorías de Shorts</Link></li>
            <li><Link to="/admin/sync-shorts">Sincronizar Shorts Virales</Link></li>
            <li>
              <Link to="/admin/email-contexts">📩 Email Contexts</Link>
            </li>

            {/* <li><Link to="/admin/users" onClick={toggleSidebar}>Gestionar Usuarios</Link></li>
            <li><Link to="/admin/orders" onClick={toggleSidebar}>Gestionar Pedidos</Link></li> */}
            <button className="sidebar-close-btn" onClick={toggleSidebar}>Cerrar</button>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
