import { describe, test, expect } from 'bun:test';
import { InMemoryEventBus } from './inMemoryEventBus';

describe('InMemoryEventBus', () => {
  describe('publish', () => {
    test('イベントを発行すると登録されたハンドラーが実行される', async () => {
      // Arrange
      const eventBus = new InMemoryEventBus();
      let handlerCalled = false;
      const handler = async (event: { type: string; payload: string }) => {
        handlerCalled = true;
        expect(event.type).toBe('TEST_EVENT');
        expect(event.payload).toBe('test data');
      };

      eventBus.subscribe('TEST_EVENT', handler);

      // Act
      await eventBus.publish({ type: 'TEST_EVENT', payload: 'test data' });

      // Assert
      expect(handlerCalled).toBe(true);
    });

    test('複数のハンドラーを登録すると全て実行される', async () => {
      // Arrange
      const eventBus = new InMemoryEventBus();
      const callOrder: number[] = [];

      const handler1 = async () => {
        callOrder.push(1);
      };
      const handler2 = async () => {
        callOrder.push(2);
      };

      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);

      // Act
      await eventBus.publish({ type: 'TEST_EVENT', payload: 'data' });

      // Assert
      expect(callOrder).toContain(1);
      expect(callOrder).toContain(2);
      expect(callOrder.length).toBe(2);
    });

    test('登録されていないイベントタイプを発行してもエラーにならない', async () => {
      // Arrange
      const eventBus = new InMemoryEventBus();

      // Act & Assert - エラーが発生しないことを確認
      await expect(
        eventBus.publish({ type: 'UNKNOWN_EVENT', payload: 'data' })
      ).resolves.toBeUndefined();
    });

    test('異なるイベントタイプのハンドラーは実行されない', async () => {
      // Arrange
      const eventBus = new InMemoryEventBus();
      let handler1Called = false;
      let handler2Called = false;

      eventBus.subscribe('EVENT_A', async () => {
        handler1Called = true;
      });
      eventBus.subscribe('EVENT_B', async () => {
        handler2Called = true;
      });

      // Act
      await eventBus.publish({ type: 'EVENT_A', payload: 'data' });

      // Assert
      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(false);
    });
  });

  describe('subscribe', () => {
    test('同じイベントタイプに複数のハンドラーを登録できる', async () => {
      // Arrange
      const eventBus = new InMemoryEventBus();
      const results: string[] = [];

      eventBus.subscribe('TEST_EVENT', async () => {
        results.push('handler1');
      });
      eventBus.subscribe('TEST_EVENT', async () => {
        results.push('handler2');
      });
      eventBus.subscribe('TEST_EVENT', async () => {
        results.push('handler3');
      });

      // Act
      await eventBus.publish({ type: 'TEST_EVENT', payload: 'data' });

      // Assert
      expect(results).toEqual(['handler1', 'handler2', 'handler3']);
    });
  });
});
