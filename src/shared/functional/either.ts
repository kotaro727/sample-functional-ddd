/**
 * Either型: 左(Left)または右(Right)のどちらかの値を持つ型
 * 慣例的にLeftはエラー、Rightは成功値を表す
 */

export type Either<L, R> = Left<L> | Right<R>;

export interface Left<L> {
  readonly _tag: 'Left';
  readonly left: L;
}

export interface Right<R> {
  readonly _tag: 'Right';
  readonly right: R;
}

/**
 * Left値を作成
 */
export const left = <L>(value: L): Left<L> => ({
  _tag: 'Left',
  left: value,
});

/**
 * Right値を作成
 */
export const right = <R>(value: R): Right<R> => ({
  _tag: 'Right',
  right: value,
});

/**
 * Eitherが左かどうかを判定
 */
export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => {
  return either._tag === 'Left';
};

/**
 * Eitherが右かどうかを判定
 */
export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => {
  return either._tag === 'Right';
};

/**
 * Right値を変換
 */
export const map = <L, R, R2>(
  fn: (value: R) => R2
) => (either: Either<L, R>): Either<L, R2> => {
  return isRight(either) ? right(fn(either.right)) : either;
};

/**
 * Right値を別のEitherに変換
 */
export const flatMap = <L, R, R2>(
  fn: (value: R) => Either<L, R2>
) => (either: Either<L, R>): Either<L, R2> => {
  return isRight(either) ? fn(either.right) : either;
};

/**
 * Left値を変換
 */
export const mapLeft = <L, L2, R>(
  fn: (value: L) => L2
) => (either: Either<L, R>): Either<L2, R> => {
  return isLeft(either) ? left(fn(either.left)) : either;
};
