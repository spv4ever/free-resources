import React from 'react';
import '../styles/Card.css';

function Card({ title, description, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <h2 className="card-title">{title}</h2>
      <p className="card-description">{description}</p>
    </div>
  );
}

export default Card;
