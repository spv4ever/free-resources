import React, { useState } from 'react';

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

const ShareFloatingBar = ({ title, description, imageUrl, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const url = shareUrl || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-floating-bar" role="region" aria-label="Opciones para compartir">
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <LinkedinShareButton url={url}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      {imageUrl && (
        <PinterestShareButton url={url} media={imageUrl} description={description}>
          <PinterestIcon size={32} round />
        </PinterestShareButton>
      )}
      <button
        className="copy-link-btn"
        onClick={handleCopy}
        title={copied ? "¡Enlace copiado!" : "Copiar enlace"}
        aria-live="polite"
        aria-atomic="true"
      >
        {copied ? "✅" : "📋"}
      </button>
    </div>
  );
};

export default ShareFloatingBar;
