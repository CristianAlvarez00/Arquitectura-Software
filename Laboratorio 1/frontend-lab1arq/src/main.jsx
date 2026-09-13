//Este archivo inicia la aplicación de React dentro del elemento root del HTML.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

//Renderizamos toda la aplicación una sola vez.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
