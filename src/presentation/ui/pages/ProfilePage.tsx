import React, { useState } from 'react';
import { useAuth } from '@presentation/ui/contexts/AuthContext';
import type { components } from '@/generated/api-schema';

type UpdateProfileRequest = components['schemas']['UpdateProfileRequest'];
type UserDto = components['schemas']['UserDto'];

export const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // フォームの状態
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: user?.profile?.name || '',
    address: {
      postalCode: user?.profile?.address?.postalCode || '',
      prefecture: user?.profile?.address?.prefecture || '',
      city: user?.profile?.address?.city || '',
      addressLine: user?.profile?.address?.addressLine || '',
    },
    phone: user?.profile?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: formData }),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const updatedUser: UserDto = await response.json();
      updateUser(updatedUser);
      setSuccess('プロフィールを更新しました');
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'プロフィールの更新に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // 元の値に戻す
    setFormData({
      name: user?.profile?.name || '',
      address: {
        postalCode: user?.profile?.address?.postalCode || '',
        prefecture: user?.profile?.address?.prefecture || '',
        city: user?.profile?.address?.city || '',
        addressLine: user?.profile?.address?.addressLine || '',
      },
      phone: user?.profile?.phone || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <p>ユーザー情報が見つかりません</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>プロフィール</h1>

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            color: '#3c3',
          }}
        >
          {success}
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p style={{ marginBottom: '5px' }}>
          <strong>メールアドレス:</strong> {user.email}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          ※メールアドレスは変更できません
        </p>
      </div>

      {!isEditing ? (
        // 表示モード
        <div>
          {user.profile ? (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <strong>名前:</strong> {user.profile.name}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>郵便番号:</strong> {user.profile.address.postalCode}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>都道府県:</strong> {user.profile.address.prefecture}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>市区町村:</strong> {user.profile.address.city}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>番地・建物名:</strong> {user.profile.address.addressLine}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>電話番号:</strong> {user.profile.phone}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '20px' }}>
              <p>プロフィールが登録されていません。編集ボタンから登録してください。</p>
            </div>
          )}

          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            編集
          </button>
        </div>
      ) : (
        // 編集モード
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
              名前 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '5px' }}>
              郵便番号 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              value={formData.address.postalCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, postalCode: e.target.value },
                })
              }
              required
              placeholder="123-4567"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="prefecture" style={{ display: 'block', marginBottom: '5px' }}>
              都道府県 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="prefecture"
              value={formData.address.prefecture}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, prefecture: e.target.value },
                })
              }
              required
              placeholder="東京都"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>
              市区町村 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="city"
              value={formData.address.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value },
                })
              }
              required
              placeholder="千代田区"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="addressLine" style={{ display: 'block', marginBottom: '5px' }}>
              番地・建物名 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="addressLine"
              value={formData.address.addressLine}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, addressLine: e.target.value },
                })
              }
              required
              placeholder="1-1-1"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>
              電話番号 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              placeholder="090-1234-5678"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '14px',
                backgroundColor: isLoading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
