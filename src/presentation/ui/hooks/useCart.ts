import { useState, useEffect } from 'react';

/**
 * カートアイテムの型
 */
export type CartItem = {
  productId: number;
  title: string;
  price: number;
  quantity: number;
};

/**
 * カート状態管理のカスタムフック
 * localStorageを使用して永続化
 */
export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 初期化: localStorageからカートデータを読み込み
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('カートデータの読み込みに失敗しました:', error);
        setCart([]);
      }
    }
  }, []);

  // カートが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  /**
   * カートに商品を追加
   */
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.productId === item.productId);

      if (existingItem) {
        // 既存のアイテムの数量を更新
        return prevCart.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        // 新しいアイテムを追加
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  /**
   * カートから商品を削除
   */
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  /**
   * カート内の商品数量を更新
   */
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  /**
   * カートをクリア
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * カート内の合計金額を計算
   */
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /**
   * カート内の合計商品数を計算
   */
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};
