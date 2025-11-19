import { EventBus } from '@application/ports/eventBus';

/**
 * インメモリイベントバスの実装
 *
 * イベントをメモリ内で管理し、同期的にハンドラーを実行します。
 * 本番環境では、より堅牢なメッセージキュー（RabbitMQ、Redisなど）への
 * 置き換えを検討してください。
 */
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  /**
   * イベントを発行し、登録されたすべてのハンドラーを並列実行する
   *
   * @param event - 発行するイベント（typeプロパティを持つ必要がある）
   */
  async publish<T extends { type: string }>(event: T): Promise<void> {
    const eventHandlers = this.handlers.get(event.type) || [];

    // すべてのハンドラーを並列実行
    await Promise.all(eventHandlers.map(handler => handler(event)));
  }

  /**
   * イベントタイプに対してハンドラーを登録する
   *
   * @param eventType - 購読するイベントタイプ
   * @param handler - イベントを処理する関数
   */
  subscribe<T>(eventType: string, handler: (event: T) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }
}
