import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { CartProvider, useCartContext } from './contexts/CartContext';

/**
 * ヘッダーコンポーネント（ハンバーガーメニュー付き）
 */
const Header: React.FC = () => {
  const { getTotalItems } = useCartContext();
  const totalItems = getTotalItems();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* ハンバーガーメニューボタン */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
            aria-label="メニュー"
          >
            ☰
          </button>

          <div>
            <h1 style={{ margin: 0 }}>関数型DDD受発注システム</h1>
            <p style={{ margin: 0, color: '#666' }}>Hexagonal Architecture + Functional Programming + DDD</p>
          </div>
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

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <nav
          style={{
            position: 'absolute',
            top: '5rem',
            left: '1rem',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '1rem',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #eee'
            }}
          >
            📦 商品一覧
          </Link>
          <Link
            to="/orders"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '1rem',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #eee'
            }}
          >
            📋 注文済み商品
          </Link>
          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '1rem',
              textDecoration: 'none',
              color: '#333'
            }}
          >
            🛒 カート
          </Link>
        </nav>
      )}
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
              <Route path="/orders" element={<OrderHistoryPage />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
};
