import type { components } from '@/generated/api-schema';

type AuthResponse = components['schemas']['AuthResponse'];
type UserDto = components['schemas']['UserDto'];

// モックのユーザーデータ
const mockUser: UserDto = {
  id: 1,
  email: 'test@example.com',
  profile: {
    name: 'テストユーザー',
    address: {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      addressLine: '1-1-1',
    },
    phone: '090-1234-5678',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// fetchをモック
export const enableAuthMock = () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    const urlString = url.toString();

    // POST /api/auth/login
    if (urlString.includes('/api/auth/login') && options?.method === 'POST') {
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token-12345',
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/auth/register
    if (
      urlString.includes('/api/auth/register') &&
      options?.method === 'POST'
    ) {
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token-12345',
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/users/me
    if (urlString.includes('/api/users/me') && options?.method === 'GET') {
      return new Response(JSON.stringify(mockUser), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/users/me
    if (urlString.includes('/api/users/me') && options?.method === 'PUT') {
      const body = options?.body
        ? JSON.parse(options.body as string)
        : undefined;
      const updatedUser: UserDto = {
        ...mockUser,
        profile: body?.profile || mockUser.profile,
        updatedAt: new Date().toISOString(),
      };
      return new Response(JSON.stringify(updatedUser), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 他のリクエストは元のfetchを使用
    return originalFetch(url, options);
  };

  console.log('🎭 Auth API モック有効化');
};
