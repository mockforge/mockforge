import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './useWorker';

import React from 'react';
import { App } from './app';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App></App>
  </StrictMode>
);
