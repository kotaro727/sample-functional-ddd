/**
 * Result型: 成功(Ok)または失敗(Err)を表現する型
 * エラーハンドリングを関数型の方法で行うための基本的な型
 */

export type Result<T, E> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly _tag: 'Ok';
  readonly value: T;
}

export interface Err<E> {
  readonly _tag: 'Err';
  readonly error: E;
}

/**
 * 成功値を持つResultを作成
 */
export const ok = <T>(value: T): Ok<T> => ({
  _tag: 'Ok',
  value,
});

/**
 * エラー値を持つResultを作成
 */
export const err = <E>(error: E): Err<E> => ({
  _tag: 'Err',
  error,
});

/**
 * Resultが成功かどうかを判定
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => {
  return result._tag === 'Ok';
};

/**
 * Resultが失敗かどうかを判定
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => {
  return result._tag === 'Err';
};

/**
 * Resultの値を変換（map）
 */
export const map = <T, U, E>(
  fn: (value: T) => U
) => (result: Result<T, E>): Result<U, E> => {
  return isOk(result) ? ok(fn(result.value)) : result;
};

/**
 * Resultの値を別のResultに変換（flatMap/chain）
 */
export const flatMap = <T, U, E>(
  fn: (value: T) => Result<U, E>
) => (result: Result<T, E>): Result<U, E> => {
  return isOk(result) ? fn(result.value) : result;
};

/**
 * Resultのエラーを変換
 */
export const mapError = <T, E, F>(
  fn: (error: E) => F
) => (result: Result<T, E>): Result<T, F> => {
  return isErr(result) ? err(fn(result.error)) : result;
};

/**
 * Resultから値を取り出す（デフォルト値付き）
 */
export const getOrElse = <T>(defaultValue: T) => <E>(result: Result<T, E>): T => {
  return isOk(result) ? result.value : defaultValue;
};
