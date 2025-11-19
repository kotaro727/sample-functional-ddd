import { EmailService, EmailMessage, SendEmailError } from '@application/ports/emailService';
import { Result, ok } from '@shared/functional/result';

/**
 * コンソールにメールを出力するダミー実装（開発用）
 *
 * 実際のメール送信は行わず、コンソールにメッセージ内容を出力します。
 * 本番環境では、実際のメール送信サービス（SendGrid、AWS SESなど）に
 * 置き換えてください。
 */
export class ConsoleEmailService implements EmailService {
  /**
   * メールメッセージをコンソールに出力する
   *
   * @param message - 送信するメールメッセージ
   * @returns 常に成功を返す
   */
  async send(message: EmailMessage): Promise<Result<void, SendEmailError>> {
    console.log('=== メール送信 ===');
    console.log(`To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Body:\n${message.body}`);
    console.log('==================');

    return ok(undefined);
  }
}
