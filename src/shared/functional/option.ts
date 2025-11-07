/**
 * Option型: 値があるかないかを表現する型
 * nullやundefinedの代わりに使用
 */

export type Option<T> = Some<T> | None;

export interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

export interface None {
  readonly _tag: 'None';
}

/**
 * 値を持つOptionを作成
 */
export const some = <T>(value: T): Some<T> => ({
  _tag: 'Some',
  value,
});

/**
 * 値を持たないOptionを作成
 */
export const none: None = {
  _tag: 'None',
};

/**
 * nullやundefinedからOptionを作成
 */
export const fromNullable = <T>(value: T | null | undefined): Option<T> => {
  return value !== null && value !== undefined ? some(value) : none;
};

/**
 * Optionが値を持つかどうかを判定
 */
export const isSome = <T>(option: Option<T>): option is Some<T> => {
  return option._tag === 'Some';
};

/**
 * Optionが値を持たないかどうかを判定
 */
export const isNone = <T>(option: Option<T>): option is None => {
  return option._tag === 'None';
};

/**
 * Optionの値を変換
 */
export const map = <T, U>(
  fn: (value: T) => U
) => (option: Option<T>): Option<U> => {
  return isSome(option) ? some(fn(option.value)) : none;
};

/**
 * Optionの値を別のOptionに変換
 */
export const flatMap = <T, U>(
  fn: (value: T) => Option<U>
) => (option: Option<T>): Option<U> => {
  return isSome(option) ? fn(option.value) : none;
};

/**
 * Optionから値を取り出す（デフォルト値付き）
 */
export const getOrElse = <T>(defaultValue: T) => (option: Option<T>): T => {
  return isSome(option) ? option.value : defaultValue;
};
