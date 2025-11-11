/**
 * ValidatedOrder - 検証済み注文（仮の型定義）
 * TODO: 後でドメインモデルとして完全実装
 */
export type ValidatedOrder = {
  id: number;
  orderItems: Array<{ productId: number; quantity: number }>;
  shippingAddress: { // ValidatedShippingAddressのIdを持つべき
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
  };
  customerInfo: { // ValidatedCustomerInfoのIdを持つべき
    name: string;
    email: string;
    phone: string;
  };
  shippingStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED'; // 個別で定義すべき
  totalAmount: number;
  createdAt: Date; // DBの知識
};
