import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { refreshRuntimeConfig } from './services/runtimeConfig';
import './index.css';
import 'leaflet/dist/leaflet.css';

await refreshRuntimeConfig(true);
setInterval(() => refreshRuntimeConfig(), 15000);
window.addEventListener('focus', () => refreshRuntimeConfig(true));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
