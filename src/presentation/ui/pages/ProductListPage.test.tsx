import { describe, test, expect, beforeEach, beforeAll, afterAll } from 'bun:test';
import { render, waitFor } from '@testing-library/react';
import { Window } from 'happy-dom';
import { MemoryRouter } from 'react-router-dom';
import { ProductListPage } from './ProductListPage';

// happy-dom のセットアップ
const window = new Window();
const document = window.document;

beforeAll(() => {
  // @ts-ignore
  global.window = window;
  // @ts-ignore
  global.document = document;
  // @ts-ignore
  globalThis.document = document;
});

afterAll(() => {
  // @ts-ignore
  global.window = undefined;
  // @ts-ignore
  global.document = undefined;
  // @ts-ignore
  globalThis.document = undefined;
});

// 各テスト前にfetchをリセット
beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = undefined;
});

// テスト用のラッパーコンポーネント（ルーター付き）
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('ProductListPage', () => {
  test('商品一覧を表示する', async () => {
    // APIのモック
    globalThis.fetch = async (url: string | URL | Request) => {
      if (url.toString().includes('/api/products')) {
        return new Response(
          JSON.stringify({
            products: [
              {
                id: 1,
                title: 'iPhone 15',
                price: 999.99,
                description: '最新のiPhone',
              },
              {
                id: 2,
                title: 'MacBook Pro',
                price: 2499.99,
                description: '高性能ノートPC',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    const { getByText } = renderWithRouter(<ProductListPage />);

    // ローディング表示を確認
    expect(getByText(/読み込み中/)).toBeDefined();

    // 商品が表示されるのを待つ
    await waitFor(() => {
      expect(getByText('iPhone 15')).toBeDefined();
    });

    expect(getByText('MacBook Pro')).toBeDefined();
    expect(getByText(/999\.99/)).toBeDefined();
    expect(getByText(/2499\.99/)).toBeDefined();
  });

  test('エラー時にエラーメッセージを表示する', async () => {
    // APIエラーのモック
    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500 });
    };

    const { getByText } = renderWithRouter(<ProductListPage />);

    await waitFor(() => {
      expect(getByText(/エラー/)).toBeDefined();
    });
  });

  test('商品が0件の場合はメッセージを表示する', async () => {
    globalThis.fetch = async (url: string | URL | Request) => {
      if (url.toString().includes('/api/products')) {
        return new Response(
          JSON.stringify({ products: [] }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    const { getByText } = renderWithRouter(<ProductListPage />);

    await waitFor(() => {
      expect(getByText(/商品がありません/)).toBeDefined();
    });
  });
});
