import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { components } from '@generated/api-schema';
import { useCartContext } from '../contexts/CartContext';

type ProductDto = components['schemas']['ProductDto'];
type ErrorResponse = components['schemas']['ErrorResponse'];

/**
 * 商品詳細ページ
 */
export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartContext();

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      // IDのバリデーション
      if (!id || isNaN(parseInt(id, 10))) {
        setError('無効な商品IDです');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/products/${id}`);

        if (response.status === 404) {
          setNotFound(true);
          setError('商品が見つかりません');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.error?.message || '商品の取得に失敗しました');
        }

        const data: ProductDto = await response.json();
        setProduct(data);
        setError(null);
        setNotFound(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(
        {
          productId: product.id,
          title: product.title,
          price: product.price,
        },
        quantity
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return (
      <div>
        <div>エラー: {error}</div>
        <button onClick={handleBack} style={{ marginTop: '1rem' }}>
          戻る
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <div>商品情報がありません</div>
        <button onClick={handleBack} style={{ marginTop: '1rem' }}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={handleBack}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        戻る
      </button>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: '#fff'
        }}
      >
        <h1 style={{ margin: '0 0 1rem 0' }}>{product.title}</h1>

        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#2c5aa0',
          margin: '1rem 0'
        }}>
          価格: ${product.price}
        </div>

        {product.description && (
          <div style={{
            color: '#666',
            lineHeight: '1.6',
            margin: '1rem 0'
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>商品説明</h2>
            <p>{product.description}</p>
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #eee'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>カートに追加</h3>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <label htmlFor="quantity">数量:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                style={{
                  padding: '0.5rem',
                  width: '2rem',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                style={{
                  width: '4rem',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                style={{
                  padding: '0.5rem',
                  width: '2rem',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              padding: '1rem 2rem',
              backgroundColor: addedToCart ? '#28a745' : '#2c5aa0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
          >
            {addedToCart ? '✓ カートに追加しました' : 'カートに追加'}
          </button>
        </div>
      </div>
    </div>
  );
};
