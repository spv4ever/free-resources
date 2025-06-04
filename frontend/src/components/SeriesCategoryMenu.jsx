import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SeriesCategoryMenu.css';

const SeriesCategoryMenu = ({ categories }) => {
  const scrollRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const hasOverflow = scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
    setShowScroll(hasOverflow);
  }, [categories]);

  const scroll = (dir) => {
    scrollRef.current.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  return (
    <div className="series-category-menu">
      <h2>Categorías de Series</h2>
      <div className="category-scroll-container">
        {showScroll && (
          <button className="scroll-btn left" onClick={() => scroll(-1)}>◀</button>
        )}
        <div className="category-chip-row" ref={scrollRef}>
          {categories.map(cat => (
            <Link
              to={`/series/categoria/${cat.slug}`}
              key={cat._id}
              className="category-chip"
            >
              {cat.nombre} ({cat.count})
            </Link>
          ))}
        </div>
        {showScroll && (
          <button className="scroll-btn right" onClick={() => scroll(1)}>▶</button>
        )}
      </div>
    </div>
  );
};

export default SeriesCategoryMenu;
