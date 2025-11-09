import { describe, test, expect, beforeEach } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductListPage } from './ProductListPage';

// happy-domをセットアップ
beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = undefined;
});

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

    render(<ProductListPage />);

    // ローディング表示を確認
    expect(screen.getByText(/読み込み中/)).toBeDefined();

    // 商品が表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeDefined();
    });

    expect(screen.getByText('MacBook Pro')).toBeDefined();
    expect(screen.getByText(/999\.99/)).toBeDefined();
    expect(screen.getByText(/2499\.99/)).toBeDefined();
  });

  test('エラー時にエラーメッセージを表示する', async () => {
    // APIエラーのモック
    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500 });
    };

    render(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText(/エラー/)).toBeDefined();
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

    render(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText(/商品がありません/)).toBeDefined();
    });
  });
});
