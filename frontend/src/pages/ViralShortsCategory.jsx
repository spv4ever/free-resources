import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ViralShortsCategory.css';

const ViralShortsCategory = () => {
    const { categoryId } = useParams();
    const [videos, setVideos] = useState([]);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        if (categoryId) {
          // Obtener los videos
          fetch(`${process.env.REACT_APP_API_URL}/api/viral-shorts/category/${categoryId}`)
            .then(res => res.json())
            .then(setVideos);

          // Obtener el nombre de la categoría
          fetch(`${process.env.REACT_APP_API_URL}/api/short-categories/${categoryId}`)
            .then(res => res.json())
            .then(data => setCategoryName(data.nombre))
            .catch(err => {
              console.error('Error al obtener nombre de la categoría', err);
              setCategoryName('Categoría desconocida');
            });
        }
      }, [categoryId]);

  return (
    <div className="viral-category-container">
      <h2 className="viral-category-title">Videos en: {categoryName}</h2>
      <div className="viral-category-grid">
      {Array.isArray(videos) && videos.length > 0 ? (
        videos.map(video => (
            <div key={video._id} className="viral-category-card">
            <div className="viral-video-embed">
                <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ></iframe>
            </div>
            <h4>{video.title}</h4>
            <p><strong>Canal:</strong> {video.channelTitle}</p>
            <p><strong>Visualizaciones:</strong> {video.views.toLocaleString('es-ES')}</p>

            <div className="viral-video-buttons">
                <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="viral-video-btn"
                >
                🔗 Ver en YouTube
                </a>
                <button className="viral-video-btn">👍 Me gusta</button>
                <button className="viral-video-btn dislike">👎 No me gusta</button>
            </div>
            </div>
        ))
        ) : (
        <p>No hay videos en esta categoría.</p>
        )}
      </div>
    </div>
  );
};

export default ViralShortsCategory;
