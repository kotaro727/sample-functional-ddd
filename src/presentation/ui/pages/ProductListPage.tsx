import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { components } from '@generated/api-schema';

type ProductDto = components['schemas']['ProductDto'];

interface ProductListResponse {
  products: ProductDto[];
}

/**
 * 商品一覧ページ
 */
export const ProductListPage = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/products');

        if (!response.ok) {
          throw new Error('商品の取得に失敗しました');
        }

        const data: ProductListResponse = await response.json();
        setProducts(data.products);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (products.length === 0) {
    return <div>商品がありません</div>;
  }

  return (
    <div>
      <h1>商品一覧</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map((product) => (
          <li
            key={product.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#fff'
            }}
          >
            <Link
              to={`/products/${product.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0', cursor: 'pointer' }}>
                {product.title}
              </h2>
            </Link>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c5aa0', margin: '0.5rem 0' }}>
              価格: ${product.price}
            </p>
            {product.description && <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>{product.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};
