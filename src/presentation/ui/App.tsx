import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CartProvider, useCartContext } from './contexts/CartContext';

/**
 * ヘッダーコンポーネント（カート数表示付き）
 */
const Header: React.FC = () => {
  const { getTotalItems } = useCartContext();
  const totalItems = getTotalItems();

  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>関数型DDD受発注システム</h1>
          <p style={{ margin: 0, color: '#666' }}>Hexagonal Architecture + Functional Programming + DDD</p>
        </div>
        <Link
          to="/cart"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2c5aa0',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🛒 カート {totalItems > 0 && `(${totalItems})`}
        </Link>
      </div>
    </header>
  );
};

/**
 * アプリケーションのルートコンポーネント
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <div>
          <Header />
          <main style={{ padding: '1rem' }}>
            <Routes>
              <Route path="/" element={<ProductListPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
};
