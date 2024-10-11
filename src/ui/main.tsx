import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './useWorker';
import { App } from './app';
import React from 'react';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App></App>
  </StrictMode>
);
