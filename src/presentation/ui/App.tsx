import React from 'react';
import { ProductListPage } from './pages/ProductListPage';

/**
 * アプリケーションのルートコンポーネント
 */
export const App: React.FC = () => {
  return (
    <div>
      <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <h1>関数型DDD受発注システム</h1>
        <p style={{ margin: 0, color: '#666' }}>Hexagonal Architecture + Functional Programming + DDD</p>
      </header>
      <main style={{ padding: '1rem' }}>
        <ProductListPage />
      </main>
    </div>
  );
};
