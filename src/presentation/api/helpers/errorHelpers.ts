import type { Context } from 'hono';
import { Result, ok, err } from '@shared/functional/result';

/**
 * エラーレスポンス型
 */
export type ErrorResponse = {
  type: string;
  message: string;
};

/**
 * エラータイプからHTTPステータスコードへのマッピング
 *
 * @param errorType - エラータイプ
 * @returns HTTPステータスコード
 */
export const errorTypeToHttpStatus = (errorType: string): number => {
  const statusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    PRODUCT_NOT_FOUND: 400,
    INVALID_PARAMETER: 400,
    INVALID_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
  };
  return statusMap[errorType] ?? 500;
};

/**
 * 予期しないエラーをハンドリングしてJSONレスポンスを生成
 *
 * @param c - Honoコンテキスト
 * @param error - エラーオブジェクト
 * @returns JSONレスポンス
 */
export const handleUnknownError = (c: Context, error: unknown) => {
  return c.json(
    {
      error: {
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
      },
    },
    500
  );
};

/**
 * エラーレスポンスを生成
 *
 * @param c - Honoコンテキスト
 * @param error - エラー情報
 * @returns JSONレスポンス
 */
export const createErrorResponse = (c: Context, error: ErrorResponse) => {
  const status = errorTypeToHttpStatus(error.type) as 400 | 404 | 409 | 500;
  return c.json({ error }, status);
};

/**
 * パスパラメータから注文IDをパースして検証
 *
 * @param idStr - パスパラメータの文字列
 * @returns パース結果（成功時は数値、失敗時はエラー）
 */
export const parseOrderId = (idStr: string): Result<number, ErrorResponse> => {
  const id = Number(idStr);

  // 整数チェック: NaNまたは整数でない場合はエラー
  if (isNaN(id) || !Number.isInteger(id) || id < 1) {
    return err({
      type: 'INVALID_PARAMETER',
      message: '無効な注文IDです',
    });
  }

  return ok(id);
};
