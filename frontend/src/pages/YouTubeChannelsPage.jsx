import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/YouTubeChannels.css';
import AdBanner from '../components/AdBanner';

function YouTubeChannelsPage() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/youtube-channels`);
        setChannels(res.data);
      } catch (err) {
        console.error('Error al cargar canales:', err);
      }
    };

    fetchChannels();
  }, []);

  return (
    <div className="youtube-channels-page">
      <AdBanner />
      <h2 className="category-title">Canales de YouTube</h2>
      <div className="channels-grid">
        {channels.map((channel) => (
            <Link key={channel._id} to={`/youtube-channels/${channel._id}`} className="channel-card">
            <img src={channel.thumbnail} alt={channel.name} className="channel-logo" />
            <div className="channel-name">{channel.name}</div>
            {channel.description && <p className="channel-description">{channel.description}</p>}
            </Link>
        ))}
      </div>
    </div>
  );
}

export default YouTubeChannelsPage;
