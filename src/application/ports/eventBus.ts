/**
 * イベントバスのポート
 *
 * ドメインイベントを発行し、イベントハンドラーを登録するためのインターフェース
 */
export type EventBus = {
  /**
   * イベントを発行する
   *
   * @param event - 発行するイベント
   */
  publish<T>(event: T): Promise<void>;

  /**
   * イベントハンドラーを登録する
   *
   * @param eventType - イベントタイプ（例: 'ORDER_CREATED'）
   * @param handler - イベントを処理する関数
   */
  subscribe<T>(eventType: string, handler: (event: T) => Promise<void>): void;
};
