import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';

/**
 * カートページ
 */
export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCartContext();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: number) => {
    if (confirm('この商品をカートから削除しますか？')) {
      removeFromCart(productId);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handlePlaceOrder = async () => {
    setIsOrdering(true);
    setOrderError(null);

    try {
      // 注文データを作成
      const orderData = {
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          postalCode: '123-4567',
          prefecture: '東京都',
          city: '渋谷区',
          addressLine: '神南1-2-3',
        },
        customerInfo: {
          name: 'テストユーザー',
          email: 'test@example.com',
          phone: '09012345678',
        },
      };

      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '注文の作成に失敗しました');
      }

      const order = await response.json();
      console.log('注文成功:', order);

      // カートをクリア
      clearCart();
      setOrderSuccess(true);

      // 3秒後に商品一覧ページに遷移
      setTimeout(() => {
        navigate('/products');
      }, 3000);
    } catch (error) {
      console.error('注文エラー:', error);
      setOrderError(error instanceof Error ? error.message : '注文に失敗しました');
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{
          padding: '2rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724'
        }}>
          <h2>✓ 注文が完了しました</h2>
          <p>ご注文ありがとうございました。</p>
          <p>まもなく商品一覧ページに戻ります...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>カートは空です</h2>
        <p style={{ color: '#666', margin: '1rem 0' }}>商品を追加してください</p>
        <button
          onClick={handleContinueShopping}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          商品一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>ショッピングカート</h1>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {cart.map((item) => (
          <div
            key={item.productId}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#666' }}>単価: ${item.price}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                style={{
                  padding: '0.25rem',
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
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                style={{
                  width: '3rem',
                  padding: '0.25rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                style={{
                  padding: '0.25rem',
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

            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c5aa0' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>

            <button
              onClick={() => handleRemoveItem(item.productId)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ margin: 0 }}>合計金額:</h2>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
            ${getTotalPrice().toFixed(2)}
          </div>
        </div>

        {orderError && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24'
          }}>
            エラー: {orderError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleContinueShopping}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            買い物を続ける
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={isOrdering}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isOrdering ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isOrdering ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isOrdering ? '注文中...' : '注文する'}
          </button>
        </div>
      </div>
    </div>
  );
};
