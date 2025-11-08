# Pipe関数について

## 概要

`pipe`関数は、関数型プログラミングにおける**関数合成のための重要なユーティリティ**です。複数の関数を順番に適用していく処理を、読みやすく記述できるようにします。

## 基本的な考え方

通常、複数の関数を順番に適用する場合、以下のようにネストした呼び出しになります:

```typescript
// ネストした呼び出し(読みにくい)
const result = functionC(functionB(functionA(value)));
```

これを`pipe`を使うと、**データの流れに沿って左から右へ**記述できます:

```typescript
// pipeを使った記述(読みやすい)
const result = pipe(
  value,
  functionA,
  functionB,
  functionC
);
```

## 実装

このプロジェクトでは`src/shared/functional/pipe.ts`に実装されています。

### 型安全なオーバーロード

5つまでの関数は完全に型安全です:

```typescript
// 関数なし(値をそのまま返す)
export function pipe<A>(value: A): A;

// 1つの関数
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;

// 2つの関数
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;

// 3つの関数
export function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): D;

// 4つの関数
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E
): E;

// 5つの関数
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F
): F;

// 実装(6つ以上の関数でも動作するが型推論はanyになる)
export function pipe(value: any, ...fns: Array<(arg: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}
```

この実装により:
- **5つまでの関数は完全に型安全**
- **6つ以上の関数でも動作する**（ただし型推論は`any`になる）
- 実用的なバランスの良い実装になっています

## 実際の使用例

### 例1: Product集約での使用

`src/domain/product/product.ts`での使用例:

```typescript
export const createProduct = (params: {
  readonly id: ProductId;
  readonly name: ProductName;
  readonly price: Price;
}): Result<Product, ValidationError> =>
  pipe(
    validateProduct(params),  // 1. バリデーション実行
    Result.map((p) => ({       // 2. 成功時にProductオブジェクトを作成
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
```

#### 処理の流れ

1. **`validateProduct(params)`** を実行
   - 成功 → `Result.Ok(validatedParams)`
   - 失敗 → `Result.Err(validationError)`

2. **`Result.map(...)`** で変換
   - Okの場合のみ中身を変換(タイムスタンプを追加)
   - Errの場合はそのまま素通り

#### pipeなしで書いた場合の比較

```typescript
// pipeなしの場合(読みにくい)
export const createProduct = (params: {
  readonly id: ProductId;
  readonly name: ProductName;
  readonly price: Price;
}): Result<Product, ValidationError> =>
  Result.map(
    (p) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  )(validateProduct(params));
```

### 例2: より複雑なワークフロー

```typescript
const processOrder = (orderId: OrderId) =>
  pipe(
    orderId,
    findOrder,                      // 1. 注文を検索
    Result.map(validateOrder),      // 2. バリデーション
    Result.flatMap(calculateTotal), // 3. 合計金額計算
    Result.flatMap(applyDiscount),  // 4. 割引適用
    Result.map(saveOrder)           // 5. 保存
  );
```

各ステップが失敗する可能性がある場合、`Result`型と組み合わせることで**エラーハンドリングを自然に表現**できます。

## pipeの利点

1. **可読性**: データが上から下、左から右へ流れるので処理の流れが理解しやすい
2. **拡張性**: 途中にステップを追加しやすい
3. **デバッグ**: 各ステップを独立してテストできる
4. **型安全性**: TypeScriptが各ステップの型をチェック
5. **関数合成**: 小さな関数を組み合わせて複雑な処理を構築できる

## 型の説明

### 残余引数の型定義

```typescript
...fns: Array<(arg: any) => any>
```

この記法は3つの要素の組み合わせです:

#### 1. スプレッド構文 (`...`)

`...fns` の `...` は**残余引数(rest parameters)**を表します。

```typescript
// 通常の引数
function example(a: number, b: number) { }
example(1, 2);  // 2つの引数が必要

// 残余引数
function example2(...args: number[]) { }
example2(1, 2, 3, 4, 5);  // いくつでもOK
```

#### 2. 配列型 (`Array<...>`)

`Array<(arg: any) => any>` は配列の型定義です。

```typescript
// これらは同じ意味
Array<number>
number[]

// 関数の配列の場合
Array<(arg: any) => any>
((arg: any) => any)[]
```

#### 3. 関数型 (`(arg: any) => any`)

`(arg: any) => any` は**何かを受け取って何かを返す関数**の型です。

```typescript
// (引数の型) => 戻り値の型
(arg: any) => any

// 具体例
(num: number) => string  // 数値を受け取って文字列を返す
(user: User) => boolean  // Userを受け取ってbooleanを返す
```

### 全体の意味

```typescript
...fns: Array<(arg: any) => any>
```

**意味**: 「何かを受け取って何かを返す関数」を、いくつでも受け取れる

### なぜ `any` を使っているのか?

各関数の入出力の型が異なるためです:

```typescript
// 実際の使用例
pipe(
  "123",           // string
  parseInt,        // (s: string) => number
  (n) => n * 2,    // (n: number) => number
  (n) => `${n}円`  // (n: number) => string
);
// 最終結果: "246円" (string)
```

各ステップで型が変わっていくため、完全に型安全にするには**オーバーロード**が必要になります。

## 型安全性の恩恵

このオーバーロードの実装により、TypeScriptが各ステップの型を正確に推論します:

```typescript
// 型が正確に推論される例
const result = pipe(
  "123",           // string
  parseInt,        // (s: string) => number
  (n) => n * 2,    // (n: number) => number
  (n) => `${n}円`  // (n: number) => string
);
// resultの型: string (正確に推論される！)

// 型エラーが検出される例
const error = pipe(
  "123",
  parseInt,
  (n: number) => n * 2,
  (s: string) => s.toUpperCase()  // 型エラー！numberをstringとして扱えない
);
```

6つ以上の関数を使う場合は、中間関数を作ることで型安全性を保てます:

```typescript
// Bad: 6つ以上で型推論が効かない
const result = pipe(value, fn1, fn2, fn3, fn4, fn5, fn6, fn7);

// Good: 中間関数を作る
const step1 = (value) => pipe(value, fn1, fn2, fn3, fn4);
const step2 = (value) => pipe(value, fn5, fn6, fn7);
const result = pipe(value, step1, step2);
```

## Result型との組み合わせ

`pipe`は`Result`型と組み合わせることで、エラーハンドリングを含むワークフローを簡潔に記述できます:

```typescript
import { Result } from '../shared/functional/result';

const processUser = (userId: string) =>
  pipe(
    userId,
    validateUserId,              // Result<UserId, ValidationError>
    Result.flatMap(findUser),    // Result<User, NotFoundError>
    Result.map(enrichUserData),  // Result<EnrichedUser, NotFoundError>
    Result.map(formatResponse)   // Result<UserResponse, NotFoundError>
  );
```

- `Result.map`: 成功時のみ値を変換
- `Result.flatMap`: 成功時に別のResult返す関数を適用
- エラーは自動的に伝播される

## ベストプラクティス

### 1. 小さな関数に分割する

```typescript
// Good: 各ステップが独立した関数
const validateInput = (input: string) => ...;
const transform = (data: Data) => ...;
const save = (entity: Entity) => ...;

pipe(input, validateInput, transform, save);

// Bad: 無名関数を多用
pipe(
  input,
  (x) => { /* 複雑な処理 */ },
  (x) => { /* 複雑な処理 */ },
  (x) => { /* 複雑な処理 */ }
);
```

### 2. 型を明示する

```typescript
// Good: 各関数の型が明確
const validateInput = (input: string): Result<Data, ValidationError> => ...;
const transform = (data: Data): TransformedData => ...;

// Bad: 型が不明瞭
const validateInput = (input: any): any => ...;
```

### 3. ステップ数を適切に保つ

```typescript
// Good: 5-7ステップ程度
pipe(
  value,
  step1,
  step2,
  step3,
  step4,
  step5
);

// Bad: 多すぎる場合は中間関数を作る
const processFirst = (value) => pipe(value, step1, step2, step3);
const processSecond = (value) => pipe(value, step4, step5, step6);

pipe(value, processFirst, processSecond);
```

## 関連項目

- `src/shared/functional/result.ts` - Result型
- `src/shared/functional/either.ts` - Either型
- `src/shared/functional/option.ts` - Option型
- `CLAUDE.md` - プロジェクト全体の関数型プログラミング方針
