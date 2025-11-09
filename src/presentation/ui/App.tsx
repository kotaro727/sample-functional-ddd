import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

/**
 * アプリケーションのルートコンポーネント
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <h1>関数型DDD受発注システム</h1>
          <p style={{ margin: 0, color: '#666' }}>Hexagonal Architecture + Functional Programming + DDD</p>
        </header>
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
