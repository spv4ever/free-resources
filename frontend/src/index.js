// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/index.css'; // nuestro css general

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <HelmetProvider> */}
      <App />
    {/* </HelmetProvider> */}
  </React.StrictMode>
);
