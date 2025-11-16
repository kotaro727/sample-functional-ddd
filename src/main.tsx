import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@presentation/ui/App';
import { enableAuthMock } from '@presentation/ui/mocks/authMock';

// 開発環境でモックAPIを有効化
if (import.meta.env.DEV) {
  enableAuthMock();
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
