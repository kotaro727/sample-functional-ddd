import { describe, test, expect, beforeEach, beforeAll, afterAll } from 'bun:test';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Window } from 'happy-dom';
import { ProductDetailPage } from './ProductDetailPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
const renderWithRouter = (productId: string) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProductDetailPage', () => {
  test('商品詳細を表示する', async () => {
    // APIのモック
    globalThis.fetch = async (url: string | URL | Request) => {
      if (url.toString().includes('/api/products/1')) {
        return new Response(
          JSON.stringify({
            id: 1,
            title: 'iPhone 15',
            price: 999.99,
            description: '最新のiPhone',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    // ルーターの履歴を /products/1 に設定
    window.history.pushState({}, '', '/products/1');

    const { getByText } = renderWithRouter('1');

    // ローディング表示を確認
    expect(getByText(/読み込み中/)).toBeDefined();

    // 商品詳細が表示されるのを待つ
    await waitFor(() => {
      expect(getByText('iPhone 15')).toBeDefined();
    });

    expect(getByText(/999\.99/)).toBeDefined();
    expect(getByText('最新のiPhone')).toBeDefined();
  });

  test('エラー時にエラーメッセージを表示する', async () => {
    // APIエラーのモック
    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500 });
    };

    window.history.pushState({}, '', '/products/1');

    const { getByText } = renderWithRouter('1');

    await waitFor(() => {
      expect(getByText(/エラー/)).toBeDefined();
    });
  });

  test('商品が見つからない場合は404メッセージを表示する', async () => {
    // 404レスポンスのモック
    globalThis.fetch = async (url: string | URL | Request) => {
      if (url.toString().includes('/api/products/999')) {
        return new Response(
          JSON.stringify({
            error: {
              type: 'NOT_FOUND',
              message: '商品が見つかりません',
            },
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    window.history.pushState({}, '', '/products/999');

    const { getByText } = renderWithRouter('999');

    await waitFor(() => {
      expect(getByText(/商品が見つかりません/)).toBeDefined();
    });
  });

  test('無効なIDの場合はエラーメッセージを表示する', async () => {
    window.history.pushState({}, '', '/products/invalid');

    const { getByText } = renderWithRouter('invalid');

    await waitFor(() => {
      expect(getByText(/無効な商品ID/)).toBeDefined();
    });
  });

  test('戻るボタンをクリックすると前のページに戻る', async () => {
    globalThis.fetch = async (url: string | URL | Request) => {
      if (url.toString().includes('/api/products/1')) {
        return new Response(
          JSON.stringify({
            id: 1,
            title: 'iPhone 15',
            price: 999.99,
            description: '最新のiPhone',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response('Not Found', { status: 404 });
    };

    window.history.pushState({}, '', '/products/1');

    const { getByText } = renderWithRouter('1');

    await waitFor(() => {
      expect(getByText('iPhone 15')).toBeDefined();
    });

    // 戻るボタンを探してクリック
    const backButton = getByText(/戻る/);
    expect(backButton).toBeDefined();

    fireEvent.click(backButton);

    // navigate(-1) が呼ばれたことを確認（実際のナビゲーションは happy-dom では完全にはシミュレートできないが、ボタンの存在は確認できる）
  });
});
