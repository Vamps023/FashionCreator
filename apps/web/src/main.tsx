import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fashion-studio/ui/tokens.css';
import './index.css';
import { App } from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
