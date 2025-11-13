import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 注文履歴の型定義
 */
type OrderDto = {
  id: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: {
    _tag: string;
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
  };
  customerInfo: {
    _tag: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  totalAmount: number;
  createdAt: string;
};

/**
 * 配送ステータスの日本語表示
 */
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '準備中';
    case 'SHIPPED':
      return '配送中';
    case 'DELIVERED':
      return '配送済み';
    default:
      return status;
  }
};

/**
 * 配送ステータスの色
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '#ffc107';
    case 'SHIPPED':
      return '#17a2b8';
    case 'DELIVERED':
      return '#28a745';
    default:
      return '#6c757d';
  }
};

/**
 * 注文履歴ページ
 */
export const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/orders');

        if (!response.ok) {
          throw new Error('注文履歴の取得に失敗しました');
        }

        const data = await response.json();
        setOrders(data.orders || []);
        setError(null);
      } catch (err) {
        console.error('注文履歴取得エラー:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackToProducts = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '1rem'
        }}>
          エラー: {error}
        </div>
        <button
          onClick={handleBackToProducts}
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

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>注文履歴</h2>
        <p style={{ color: '#666', margin: '2rem 0' }}>まだ注文がありません</p>
        <button
          onClick={handleBackToProducts}
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
          商品を探す
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>注文履歴</h1>
        <button
          onClick={handleBackToProducts}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          商品一覧に戻る
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #eee'
            }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>注文番号: #{order.id}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  注文日時: {formatDate(order.createdAt)}
                </p>
              </div>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: getStatusColor(order.shippingStatus),
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                {getStatusLabel(order.shippingStatus)}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>注文内容</h4>
              <div style={{ color: '#666' }}>
                {order.orderItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                    商品ID: {item.productId} × {item.quantity}個
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>配送先</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                〒{order.shippingAddress.postalCode}<br />
                {order.shippingAddress.prefecture}
                {order.shippingAddress.city}
                {order.shippingAddress.addressLine}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>合計金額</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
