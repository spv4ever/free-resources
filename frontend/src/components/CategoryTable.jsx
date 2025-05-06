import React, { useEffect, useState } from 'react';
import '../styles/CategoryTable.css'; // Asegúrate de tener el CSS correcto para la tabla

const CategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null); // Estado para manejar la categoría en edición
  const [updatedCategory, setUpdatedCategory] = useState({ name: '', description: '', imageUrl: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', imageUrl: '' }); // Estado para agregar una nueva categoría
  const [showAddForm, setShowAddForm] = useState(false); // Estado para mostrar/ocultar el formulario de agregar

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id); // Activar el modo de edición para esta categoría
    setUpdatedCategory({ 
      name: category.name, 
      description: category.description, 
      imageUrl: category.imageUrl 
    });
  };

  const handleSave = async (id) => {
    // Enviar los datos actualizados al backend
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });
      if (response.ok) {
        fetchCategories(); // Refrescar la lista de categorías
        setEditingCategory(null); // Desactivar el modo de edición
      } else {
        alert('Hubo un error al actualizar la categoría');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const confirmation = window.confirm('¿Estás seguro de que quieres eliminar esta categoría?');
    if (confirmation) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          fetchCategories(); // Refrescar la lista de categorías
        } else {
          alert('Hubo un error al eliminar la categoría');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        fetchCategories(); // Refrescar la lista de categorías
        setShowAddForm(false); // Cerrar el formulario
        setNewCategory({ name: '', description: '', imageUrl: '' }); // Limpiar formulario
      } else {
        alert('Hubo un error al agregar la categoría');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="table-container">
      <button className="add-button" onClick={() => setShowAddForm(!showAddForm)}>
        <i className="fa fa-plus" /> Agregar Categoría
      </button>

      {/* Formulario para agregar una nueva categoría */}
      {showAddForm && (
        <div className="add-form">
          <input
            type="text"
            name="name"
            value={newCategory.name}
            onChange={handleAddChange}
            placeholder="Nombre de la categoría"
          />
          <input
            type="text"
            name="description"
            value={newCategory.description}
            onChange={handleAddChange}
            placeholder="Descripción"
          />
          <input
            type="text"
            name="imageUrl"
            value={newCategory.imageUrl}
            onChange={handleAddChange}
            placeholder="URL de la imagen"
          />
          <button onClick={handleAddCategory} className="btn-add">
            Agregar
          </button>
          <button onClick={() => setShowAddForm(false)} className="btn-cancel">
            Cancelar
          </button>
        </div>
      )}

      <table className="category-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>URL</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>
                <img 
                  src={category.imageUrl ? category.imageUrl : '/images/default.jpg'} 
                  alt={category.name} 
                  className="category-image" 
                />
              </td>
              <td>
                {editingCategory === category._id ? (
                  <input 
                    type="text" 
                    name="name" 
                    value={updatedCategory.name} 
                    onChange={handleChange} 
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editingCategory === category._id ? (
                  <input 
                    type="text" 
                    name="description" 
                    value={updatedCategory.description} 
                    onChange={handleChange} 
                  />
                ) : (
                  category.description
                )}
              </td>
              <td>
                {editingCategory === category._id ? (
                  <input 
                    type="text" 
                    name="imageUrl" 
                    value={updatedCategory.imageUrl} 
                    onChange={handleChange} 
                  />
                ) : (
                  category.imageUrl
                )}
              </td>
              
              <td>
                {editingCategory === category._id ? (
                  <button onClick={() => handleSave(category._id)} className="btn-save">
                    Guardar
                  </button>
                ) : (
                  <button onClick={() => handleEdit(category)} className="btn-edit">
                    <i className="fa fa-edit" /> Editar
                  </button>
                )}
                <button onClick={() => handleDelete(category._id)} className="btn-delete">
                  <i className="fa fa-trash" /> Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
