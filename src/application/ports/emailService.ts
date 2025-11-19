import { Result } from '@shared/functional/result';

/**
 * メール送信エラー
 */
export type SendEmailError = {
  readonly type: 'EMAIL_SEND_ERROR';
  readonly message: string;
};

/**
 * メールメッセージ
 */
export type EmailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
};

/**
 * メール送信サービスのポート
 */
export type EmailService = {
  /**
   * メールを送信する
   *
   * @param message - 送信するメールメッセージ
   * @returns 成功または送信エラー
   */
  send(message: EmailMessage): Promise<Result<void, SendEmailError>>;
};
