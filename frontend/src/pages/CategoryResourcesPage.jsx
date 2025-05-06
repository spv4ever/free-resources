import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { FaDownload, FaEdit, FaTrash, FaSave, FaTimes   } from 'react-icons/fa';
import AdBanner from '../components/AdBanner';


function CategoryResourcesPage() {
    const { categoryName } = useParams();
    const [resources, setResources] = useState([]);
    //const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const [newResource, setNewResource] = useState(null); // para añadir
    const [editResourceId, setEditResourceId] = useState(null); // para editar
    const [editFormData, setEditFormData] = useState({});
    const isAdmin = user?.role === 'admin';
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Puedes cambiar a 10 si prefieres
    const [zoomImage, setZoomImage] = useState(null);


//   console.log('user:', user);
//   console.log('isAdmin:', isAdmin);

    const sortedResources = [...resources]
    .filter((r) => {
        const term = searchTerm.toLowerCase();
        return (
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
        );
    })
    .sort((a, b) => {
        const { key, direction } = sortConfig;

        const valA = a[key]?.toString().toLowerCase();
        const valB = b[key]?.toString().toLowerCase();

        if (!valA || !valB) return 0;

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
        }
        );
    const paginatedResources = sortedResources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
        );
          
    const totalPages = Math.ceil(sortedResources.length / itemsPerPage);
          


    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        };


    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
  // const handleAdd = () => {
  //   setNewResource({
  //     title: '',
  //     description: '',
  //     imageUrl: '',
  //     downloadUrl: '',
  //     category: categoryName
  //   });
  // };
  
  const handleSaveNew = async () => {
    const slugifiedTitle = newResource.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const generatedImageUrl = `/images/categories/${categoryName.toLowerCase()}/${slugifiedTitle}.jpg`;
  
    const resourceToSave = {
      ...newResource,
      imageUrl: generatedImageUrl
    };
  
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/resources`, resourceToSave, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResources([res.data, ...resources]);
      setNewResource(null);
    } catch (error) {
      console.error('Error al guardar recurso nuevo:', error);
      alert('No se pudo guardar el recurso.');
    }
  };
  

  const handleCancelNew = () => {
    setNewResource(null);
  };

  const handleEdit = (resource) => {
    setEditResourceId(resource._id);
    setEditFormData({ ...resource });
  };
  const handleEditSave = async () => {
    const slugifiedTitle = editFormData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const generatedImageUrl = `/images/categories/${categoryName.toLowerCase()}/${slugifiedTitle}.jpg`;
  
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/resources/${editResourceId}`,
        {
          ...editFormData,
          imageUrl: generatedImageUrl, // fuerza la generación correcta
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      const updatedResource = res.data;
      setResources(resources.map(r => r._id === updatedResource._id ? updatedResource : r));
      setEditResourceId(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('No se pudo guardar el recurso.');
    }
  };
  
  const handleEditCancel = () => {
    setEditResourceId(null);
    setEditFormData({});
  };
  
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };  
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este recurso?')) return;
  
    try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/resources/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
      setResources(resources.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      alert('No se pudo eliminar el recurso.');
    }
  };
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/resources?category=${encodeURIComponent(categoryName)}`);
        setResources(res.data);
  
        // Si no hay recursos y el usuario es admin, mostrar automáticamente la fila de alta
        if (res.data.length === 0 && isAdmin) {
          setNewResource({
            title: '',
            description: '',
            imageUrl: '',
            downloadUrl: '',
            category: categoryName
          });
        }
      } catch (error) {
        console.error('Error al cargar recursos:', error);
      } finally {
        //setLoading(false);
      }
    };
  
    fetchResources();
  }, [categoryName, isAdmin]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryName]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setZoomImage(null);
      }
    };
  
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  
  return (
    <div className="resource-wrapper">
      <AdBanner />
      <h2 className="resource-title">Categoría: {decodeURIComponent(categoryName)}</h2>
      <div className="resource-filters">
        <input
          type="text"
          placeholder="Buscar recurso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="sort-buttons">
          <button
            onClick={() => handleSort('updatedAt')}
            className={sortConfig.key === 'updatedAt' ? 'active' : ''}
          >
            Ordenar por fecha {sortConfig.key === 'updatedAt' ? (sortConfig.direction === 'asc' ? '⬆️' : '⬇️') : ''}
          </button>
          <button
            onClick={() => handleSort('title')}
            className={sortConfig.key === 'title' ? 'active' : ''}
          >
            Ordenar por nombre {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '⬆️' : '⬇️') : ''}
          </button>
        </div>
      </div>
      

    <div className="resource-grid">
      {newResource && (
        <div className="resource-card new">
          <input type="text" placeholder="Título" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
          <input type="text" placeholder="Descripción" value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} />
          {/* <input type="text" placeholder="URL imagen" value={newResource.imageUrl} onChange={(e) => setNewResource({ ...newResource, imageUrl: e.target.value })} /> */}
          <input type="text" placeholder="URL descarga" value={newResource.downloadUrl} onChange={(e) => setNewResource({ ...newResource, downloadUrl: e.target.value })} />
          <div className="resource-actions">
            <button onClick={handleSaveNew}><FaSave /></button>
            <button onClick={handleCancelNew}><FaTimes /></button>
          </div>
        </div>
      )}
      
      {paginatedResources.map((r) =>
        editResourceId === r._id ? (
          <div key={r._id} className="resource-card edit">
            <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} />
            <input type="text" name="description" value={editFormData.description} onChange={handleEditChange} />
            <input
              type="text"
              name="imageUrl"
              value={editFormData.imageUrl}
              // disabled
              // readOnly
              title="La URL de la imagen se genera automáticamente y no se puede editar"
              onChange={handleEditChange}
            />
            <input type="text" name="downloadUrl" value={editFormData.downloadUrl} onChange={handleEditChange} />
            <div className="resource-actions">
              <button onClick={handleEditSave}><FaSave /></button>
              <button onClick={handleEditCancel}><FaTimes /></button>
            </div>
          </div>
        ) : (
          <div key={r._id} className="resource-card">
            <img
              src={r.imageUrl || '/images/default_image.png'}
              alt={r.title}
              onClick={() => r.imageUrl && setZoomImage(r.imageUrl)}
              onError={(e) => { e.target.src = '/images/default_image.png'; }}
              style={{ cursor: 'zoom-in' }}
            />
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <p className="resource-date">{formatDate(r.updatedAt)}</p>
            <div className="resource-actions">
              <a href={r.downloadUrl} target="_blank" rel="noreferrer" title="Descargar"><FaDownload /></a>
              {isAdmin && (
                <>
                  <button onClick={() => handleEdit(r)} title="Editar"><FaEdit /></button>
                  <button onClick={() => handleDelete(r._id)} title="Eliminar"><FaTrash /></button>
                </>
              )}
            </div>
          </div>
        )
      )}
      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="zoom-close" onClick={() => setZoomImage(null)}>✖</button>
            <img src={zoomImage} alt="Vista ampliada" className="zoom-full" />
          </div>
        </div>
      )}
      </div>
      {totalPages > 1 && (
  <div className="pagination">
    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
      « Primera
    </button>
    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
      ← Anterior
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={currentPage === i + 1 ? 'active' : ''}
      >
        {i + 1}
      </button>
    ))}

    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
      Siguiente →
    </button>
    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
      Última »
    </button>
  </div>
)}

    </div>
  
  );
}

export default CategoryResourcesPage;
