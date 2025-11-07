/**
 * 関数合成のためのユーティリティ
 * 複数の関数を左から右へ（引数から結果へ）合成する
 */

/**
 * パイプライン関数: 値を複数の関数に順番に適用
 */
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): D;
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E
): E;
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F
): F;
export function pipe(value: any, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * 関数を合成する（右から左へ）
 */
export const compose = <A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): ((a: A) => C) => {
  return (a: A) => f(g(a));
};

/**
 * 関数を合成する（左から右へ）
 */
export const flow = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): ((a: A) => C) => {
  return (a: A) => g(f(a));
};
