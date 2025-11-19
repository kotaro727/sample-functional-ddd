import { describe, test, expect } from 'bun:test';
import { sendOrderConfirmationEmail } from './sendOrderConfirmationEmail';
import type { OrderCreatedEvent } from '@domain/order/events';
import type { EmailService, EmailMessage } from '@application/ports/emailService';
import { ok, err } from '@shared/functional/result';
import { createMoney } from '@domain/shared/valueObjects/money';

describe('sendOrderConfirmationEmail', () => {
  describe('注文確認メール送信', () => {
    test('OrderCreatedEventを受け取ってメールを送信する', async () => {
      // Arrange
      let sentMessage: EmailMessage | null = null;
      const mockEmailService: EmailService = {
        send: async (message) => {
          sentMessage = message;
          return ok(undefined);
        },
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '山田太郎',
            email: 'yamada@example.com',
            phone: '090-1234-5678',
          },
          totalAmount: createMoney(3000).value,
          orderItems: [
            {
              productId: 101,
              quantity: 2,
              unitPrice: createMoney(1000).value,
            },
            {
              productId: 102,
              quantity: 1,
              unitPrice: createMoney(1000).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = sendOrderConfirmationEmail(mockEmailService);

      // Act
      await handler(event);

      // Assert
      expect(sentMessage).not.toBeNull();
      expect(sentMessage?.to).toBe('yamada@example.com');
      expect(sentMessage?.subject).toContain('注文確認');
      expect(sentMessage?.body).toContain('山田太郎');
      expect(sentMessage?.body).toContain('¥3000');
    });

    test('メール本文に注文明細が含まれる', async () => {
      // Arrange
      let sentMessage: EmailMessage | null = null;
      const mockEmailService: EmailService = {
        send: async (message) => {
          sentMessage = message;
          return ok(undefined);
        },
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '佐藤花子',
            email: 'sato@example.com',
            phone: '090-9876-5432',
          },
          totalAmount: createMoney(5500).value,
          orderItems: [
            {
              productId: 201,
              quantity: 3,
              unitPrice: createMoney(1500).value,
            },
            {
              productId: 202,
              quantity: 2,
              unitPrice: createMoney(500).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = sendOrderConfirmationEmail(mockEmailService);

      // Act
      await handler(event);

      // Assert
      expect(sentMessage?.body).toContain('商品ID: 201');
      expect(sentMessage?.body).toContain('数量: 3');
      expect(sentMessage?.body).toContain('¥1500');
      expect(sentMessage?.body).toContain('商品ID: 202');
      expect(sentMessage?.body).toContain('数量: 2');
      expect(sentMessage?.body).toContain('¥500');
    });

    test('メール送信に失敗してもエラーをスローしない', async () => {
      // Arrange
      const mockEmailService: EmailService = {
        send: async () => {
          return err({
            type: 'EMAIL_SEND_ERROR',
            message: 'メールサーバーに接続できません',
          });
        },
      };

      const event: OrderCreatedEvent = {
        type: 'ORDER_CREATED',
        payload: {
          orderId: 1,
          customerInfo: {
            name: '田中一郎',
            email: 'tanaka@example.com',
            phone: '090-1111-2222',
          },
          totalAmount: createMoney(1000).value,
          orderItems: [
            {
              productId: 301,
              quantity: 1,
              unitPrice: createMoney(1000).value,
            },
          ],
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      };

      const handler = sendOrderConfirmationEmail(mockEmailService);

      // Act & Assert - エラーがスローされないことを確認
      await expect(handler(event)).resolves.toBeUndefined();
    });
  });
});
