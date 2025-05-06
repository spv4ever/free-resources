import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ResourcesPage.css';
import AdBanner from '../components/AdBanner';

const RecursosPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);
        if (!response.ok) throw new Error('Error al cargar las categorías');
        const data = await response.json();
        if (isMounted) {
          setCategories(data.categories);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setError('Error al cargar las categorías');
          setLoading(false);
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  
  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
       <AdBanner />
      <h1>Categorías de Recursos</h1>
      
      <div className="categories-container">
        {categories.map((category) => (
          <Link
            to={`/category/${encodeURIComponent(category.name)}`}
            key={category._id}
            className="category-card"
            title="Ver recursos"
          >
            {category.imageUrl && (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="category-image"
              />
            )}
            <h3 className="card-title">{category.name}</h3>
            <p className="card-description">{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecursosPage;
