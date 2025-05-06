import React, { useState, useEffect } from 'react';
import CategoryTable from '../../components/CategoryTable';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);

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

  return (
    <div className="categories-page">
      <h1>Categorías</h1>

      <CategoryTable
        categories={categories}
      />
    </div>
  );
}

export default CategoriesPage;
