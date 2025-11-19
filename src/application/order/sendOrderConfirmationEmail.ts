import { EmailService } from '@application/ports/emailService';
import { OrderCreatedEvent } from '@domain/order/events';
import { isErr } from '@shared/functional/result';

/**
 * 注文確認メールを送信するイベントハンドラー
 *
 * OrderCreatedEventを受け取り、顧客に注文確認メールを送信します。
 * メール送信に失敗した場合はエラーログを出力しますが、
 * 注文処理自体は成功として扱います。
 *
 * @param emailService - メール送信サービス
 * @returns イベントハンドラー関数
 */
export const sendOrderConfirmationEmail =
  (emailService: EmailService) =>
  async (event: OrderCreatedEvent): Promise<void> => {
    const { customerInfo, totalAmount, orderItems } = event.payload;

    // 注文明細のテキストを構築
    const itemsText = orderItems
      .map(
        item =>
          `  - 商品ID: ${item.productId}, 数量: ${item.quantity}, 単価: ¥${item.unitPrice.value}`
      )
      .join('\n');

    // メール本文を構築
    const body = `
${customerInfo.name} 様

ご注文ありがとうございます。
以下の内容で注文を承りました。

【注文内容】
${itemsText}

【合計金額】
¥${totalAmount.value}

ご不明な点がございましたら、お問い合わせください。
    `.trim();

    // メールを送信
    const result = await emailService.send({
      to: customerInfo.email,
      subject: '【注文確認】ご注文ありがとうございます',
      body,
    });

    // メール送信失敗はログに記録するが、注文処理は成功とする
    if (isErr(result)) {
      console.error('メール送信に失敗しました:', result.error.message);
    }
  };
