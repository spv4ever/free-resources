import React from 'react';

import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
  PinterestIcon
} from 'react-share';

import '../styles/ShareButtons.css';

const ShareFloatingBar = ({ title, description, imageUrl, tmdbId }) => {
  const url = tmdbId
    ? `https://keikodev.es/share/series/${tmdbId}`
    : window.location.href;

  const handleCopy = () => {
  navigator.clipboard.writeText(url);
};

  return (
    <div className="share-floating-bar">
      <FacebookShareButton url={url} quote={title}><FacebookIcon size={32} round /></FacebookShareButton>
      <TwitterShareButton url={url} title={title}><TwitterIcon size={32} round /></TwitterShareButton>
      <WhatsappShareButton url={url} title={title}><WhatsappIcon size={32} round /></WhatsappShareButton>
      <TelegramShareButton url={url} title={title}><TelegramIcon size={32} round /></TelegramShareButton>
      <LinkedinShareButton url={url}><LinkedinIcon size={32} round /></LinkedinShareButton>
      {imageUrl && (
        <PinterestShareButton url={url} media={imageUrl} description={description}>
          <PinterestIcon size={32} round />
        </PinterestShareButton>
      )}
      <button className="copy-link-btn" onClick={handleCopy}>
        📋
      </button>
    </div>
  );
};

export default ShareFloatingBar;
