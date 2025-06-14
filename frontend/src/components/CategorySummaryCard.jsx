// src/components/CategorySummaryCard.jsx
import React from 'react';
import '../styles/CategorySummaryCard.css';

const CategorySummaryCard = ({ category, count }) => {
  return (
    <div className="category-card">
      <h3 className="category-name">{category}</h3>
      <p className="category-count">{count} prompts</p>
    </div>
  );
};

export default CategorySummaryCard;
