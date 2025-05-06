import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ChannelVideos.css';

function ChannelVideosPage() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState('');

  

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube-channels/${id}/videos`);
        setChannelName(res.data.channelName);
        setChannelId(res.data.channelId);
        setVideos(res.data.videos);
      } catch (err) {
        console.error('Error al cargar videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [id]);

  useEffect(() => {
    if (window.gapi && window.gapi.ytsubscribe) {
      window.gapi.ytsubscribe.go();
    }
  }, [channelId]);

  return (
    <div className="channel-videos-page">
      <div className="channel-header">
        <h2 className="channel-title">{channelName}</h2>

        {channelId && (
            <div className="channel-actions">
            <div
                className="g-ytsubscribe"
                data-channelid={channelId}
                data-layout="default"
                data-count="default"
            ></div>

            <a
                href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
                target="_blank"
                rel="noreferrer"
                className="youtube-subscribe-button"
            >
                Visitar canal
            </a>
            </div>
        )}
        </div>
        

      {loading ? (
        <p>Cargando videos...</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.videoId} className="video-card">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
              <h3>{video.title}</h3>
              <p>{new Date(video.publishedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChannelVideosPage;
