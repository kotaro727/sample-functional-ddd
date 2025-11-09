# Result型について

## 概要

**Result型**は、成功または失敗を表現する型です。関数型プログラミングにおいて、例外をスローする代わりに、エラーを値として扱うための基本的な型です。

このプロジェクトでは、失敗する可能性がある全ての操作にResult型を使用しています。

## Result型の定義

`src/shared/functional/result.ts`での定義:

```typescript
export type Result<T, E> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly _tag: 'Ok';
  readonly value: T;
}

export interface Err<E> {
  readonly _tag: 'Err';
  readonly error: E;
}
```

### 型パラメータ

- **`T`**: 成功時の値の型
- **`E`**: エラーの型

### 2つの状態

```typescript
// 成功の場合
Ok<T>: {
  _tag: 'Ok',
  value: T  // 成功時の値
}

// 失敗の場合
Err<E>: {
  _tag: 'Err',
  error: E  // エラー情報
}
```

## 基本的な使い方

### Result型の作成

```typescript
import { ok, err, Result } from '@shared/functional/result';

// 成功を表すResult
const success: Result<number, string> = ok(42);
// { _tag: 'Ok', value: 42 }

// 失敗を表すResult
const failure: Result<number, string> = err('エラーが発生しました');
// { _tag: 'Err', error: 'エラーが発生しました' }
```

### Result型を返す関数

```typescript
// バリデーション関数の例
const divide = (a: number, b: number): Result<number, string> => {
  if (b === 0) {
    return err('0で割ることはできません');
  }
  return ok(a / b);
};

// 使用
const result1 = divide(10, 2);  // ok(5)
const result2 = divide(10, 0);  // err('0で割ることはできません')
```

## 従来のエラーハンドリングとの比較

### 例外ベースのアプローチ（従来の方法）

```typescript
// 問題点が多いアプローチ
function parseAge(input: string): number {
  const age = parseInt(input);

  if (isNaN(age)) {
    throw new Error('無効な数値です');  // 例外をスロー
  }

  if (age < 0 || age > 150) {
    throw new Error('年齢は0-150の範囲である必要があります');
  }

  return age;
}

// 使用側
try {
  const age = parseAge('abc');
  console.log(`年齢: ${age}`);
} catch (error) {
  // エラーハンドリング
  console.error(error);
}
```

**問題点:**
1. **型安全性の欠如**: 関数の型シグネチャから例外が投げられることがわからない
2. **例外の型が不明**: `catch (error)` の `error` の型は `unknown`
3. **エラーハンドリングの強制不可**: try-catchを忘れるとアプリがクラッシュ
4. **関数合成が困難**: 例外が途中で発生すると処理が中断される

### Result型ベースのアプローチ（推奨）

```typescript
type AgeError =
  | { type: 'INVALID_NUMBER'; message: '無効な数値です' }
  | { type: 'OUT_OF_RANGE'; message: '年齢は0-150の範囲である必要があります' };

function parseAge(input: string): Result<number, AgeError> {
  const age = parseInt(input);

  if (isNaN(age)) {
    return err({ type: 'INVALID_NUMBER', message: '無効な数値です' });
  }

  if (age < 0 || age > 150) {
    return err({ type: 'OUT_OF_RANGE', message: '年齢は0-150の範囲である必要があります' });
  }

  return ok(age);
}

// 使用側
const ageResult = parseAge('25');

if (isOk(ageResult)) {
  console.log(`年齢: ${ageResult.value}`);
} else {
  console.error(`エラー: ${ageResult.error.message}`);
}
```

**メリット:**
1. **型安全**: エラーの型が明確（`AgeError`）
2. **エラーハンドリングの強制**: Result型を使う限り、エラー処理を忘れられない
3. **関数合成が容易**: `map`や`flatMap`でエラーを伝播できる
4. **予測可能**: 例外は発生しない

## Result型のメリット

### 1. 型安全性

```typescript
// エラーの型が明確
type UserNotFoundError = { type: 'USER_NOT_FOUND'; userId: string };
type DatabaseError = { type: 'DATABASE_ERROR'; message: string };

type FindUserError = UserNotFoundError | DatabaseError;

const findUser = (id: string): Result<User, FindUserError> => {
  // ...
};

// 使用側: エラーの型がわかる
const result = findUser('123');
if (isErr(result)) {
  // result.error は FindUserError 型
  switch (result.error.type) {
    case 'USER_NOT_FOUND':
      console.log(`ユーザーID ${result.error.userId} が見つかりません`);
      break;
    case 'DATABASE_ERROR':
      console.log(`DBエラー: ${result.error.message}`);
      break;
  }
}
```

### 2. エラーハンドリングの強制

```typescript
// Resultを返す関数は、必ずエラー処理を考慮させる
const result = divide(10, 0);

// エラーチェックせずに値を取り出そうとするとコンパイルエラー
// const value = result.value;  // エラー！

// 正しい使い方
if (isOk(result)) {
  const value = result.value;  // OK
}
```

### 3. 関数合成が容易

```typescript
// エラーを自動的に伝播できる
const processUser = (userId: string): Result<string, Error> =>
  pipe(
    userId,
    findUser,              // Result<User, FindUserError>
    map(extractName),      // エラーならスキップ
    map(toUpperCase),      // エラーならスキップ
    flatMap(validateName)  // エラーならスキップ
  );

// いずれかのステップでエラーが発生すると、自動的に伝播される
```

### 4. 予測可能性

```typescript
// 例外ベース: いつエラーが発生するかわからない
function riskyOperation(): string {
  // 突然例外が投げられるかも？
}

// Resultベース: 必ずResultが返る
function safeOperation(): Result<string, Error> {
  // 必ず Result<string, Error> が返る
}
```

## このプロジェクトでの使用例

### 例1: 値オブジェクトのバリデーション

`src/domain/product/valueObjects/productId.ts`:

```typescript
export type ProductIdError = {
  type: 'INVALID_ID';
  message: 'ProductIdは正の整数である必要があります';
};

export const createProductId = (value: number): Result<ProductId, ProductIdError> => {
  // 正の整数チェック
  if (value <= 0 || !Number.isInteger(value)) {
    return err({
      type: 'INVALID_ID',
      message: 'ProductIdは正の整数である必要があります',
    });
  }

  return ok({ _brand: 'ProductId', value } as ProductId);
};
```

### 例2: 複数のバリデーションエラー

`src/domain/shared/valueObjects/email.ts`:

```typescript
export type EmailError =
  | { type: 'EMPTY'; message: 'メールアドレスが空です' }
  | { type: 'INVALID_FORMAT'; message: 'メールアドレスの形式が不正です' };

export const createEmail = (value: string): Result<Email, EmailError> => {
  // 空文字チェック
  if (value.trim() === '') {
    return err({ type: 'EMPTY', message: 'メールアドレスが空です' });
  }

  // フォーマットチェック
  if (!EMAIL_PATTERN.test(value)) {
    return err({ type: 'INVALID_FORMAT', message: 'メールアドレスの形式が不正です' });
  }

  return ok({ _brand: 'Email', value } as Email);
};
```

### 例3: 複数のResultの合成

`src/domain/product/product.ts`:

```typescript
export type ProductError =
  | ProductIdError
  | PriceError
  | { type: 'EMPTY_TITLE'; message: 'タイトルは必須です' };

export const createProduct = (input: ProductInput): Result<Product, ProductError> => {
  // タイトルのバリデーション
  if (input.title.trim() === '') {
    return err({ type: 'EMPTY_TITLE', message: 'タイトルは必須です' });
  }

  // 値オブジェクトの作成
  const productIdResult = createProductId(input.id);
  const priceResult = createPrice(input.price);

  // Result型の合成
  return pipe(
    productIdResult,           // Result<ProductId, ProductIdError>
    flatMap((id) =>            // 成功時のみ実行
      pipe(
        priceResult,           // Result<Price, PriceError>
        map((price) => ({      // 成功時のみ実行
          id,
          title: input.title,
          price,
          description: input.description,
        }))
      )
    )
  );
};
```

## Result型の操作関数

### map: 成功時の値を変換

```typescript
export const map = <T, U, E>(
  fn: (value: T) => U
) => (result: Result<T, E>): Result<U, E> => {
  return isOk(result) ? ok(fn(result.value)) : result;
};
```

**使用例:**

```typescript
const result = ok(5);

const doubled = map((n: number) => n * 2)(result);
// ok(10)

const failed = err('エラー');
const attempted = map((n: number) => n * 2)(failed);
// err('エラー') - エラーはそのまま
```

**pipeでの使用:**

```typescript
pipe(
  ok(100),
  map((n) => n * 1.1),      // 税込価格
  map((n) => Math.round(n)), // 四捨五入
  map((n) => `${n}円`)       // 文字列化
);
// ok("110円")
```

### flatMap: 成功時にResultを返す関数を適用

```typescript
export const flatMap = <T, U, E>(
  fn: (value: T) => Result<U, E>
) => (result: Result<T, E>): Result<U, E> => {
  return isOk(result) ? fn(result.value) : result;
};
```

**使用例:**

```typescript
const validatePositive = (n: number): Result<number, string> =>
  n > 0 ? ok(n) : err('正の数である必要があります');

const result = ok(5);
const validated = flatMap(validatePositive)(result);
// ok(5)

const negative = ok(-5);
const failed = flatMap(validatePositive)(negative);
// err('正の数である必要があります')
```

**pipeでの使用:**

```typescript
pipe(
  ok(10),
  flatMap(validatePositive),    // Result<number, string>
  flatMap(validateLessThan100), // Result<number, string>
  map((n) => n * 2)              // Result<number, string>
);
```

### mapとflatMapの違い

```typescript
// map: 普通の値を返す関数
map((n: number) => n * 2)
// (n: number) => number

// flatMap: Resultを返す関数
flatMap((n: number) => validatePositive(n))
// (n: number) => Result<number, string>
```

### mapError: エラーを変換

```typescript
export const mapError = <T, E, F>(
  fn: (error: E) => F
) => (result: Result<T, E>): Result<T, F> => {
  return isErr(result) ? err(fn(result.error)) : result;
};
```

**使用例:**

```typescript
type ValidationError = { code: number; message: string };
type UserError = { type: 'USER_ERROR'; details: string };

const convertError = (e: ValidationError): UserError => ({
  type: 'USER_ERROR',
  details: `[${e.code}] ${e.message}`
});

const result = err({ code: 400, message: '不正な入力' });
const converted = mapError(convertError)(result);
// err({ type: 'USER_ERROR', details: '[400] 不正な入力' })
```

### getOrElse: デフォルト値で取り出す

```typescript
export const getOrElse = <T>(defaultValue: T) => <E>(result: Result<T, E>): T => {
  return isOk(result) ? result.value : defaultValue;
};
```

**使用例:**

```typescript
const result1 = ok(42);
const value1 = getOrElse(0)(result1);
// 42

const result2 = err('エラー');
const value2 = getOrElse(0)(result2);
// 0 (デフォルト値)
```

### isOk / isErr: 型ガード

```typescript
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => {
  return result._tag === 'Ok';
};

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => {
  return result._tag === 'Err';
};
```

**使用例:**

```typescript
const result = divide(10, 2);

if (isOk(result)) {
  // この中では result.value にアクセス可能
  console.log(result.value);
} else {
  // この中では result.error にアクセス可能
  console.error(result.error);
}
```

## 実践的なパターン

### パターン1: 複数の検証を順次実行

```typescript
const validateUser = (input: UserInput): Result<User, ValidationError> =>
  pipe(
    input.email,
    createEmail,              // Result<Email, EmailError>
    flatMap((email) =>        // emailが有効な場合のみ続行
      pipe(
        input.age,
        validateAge,          // Result<number, AgeError>
        map((age) => ({       // ageが有効な場合のみ続行
          email,
          age,
          name: input.name
        }))
      )
    )
  );
```

### パターン2: エラーを統一型に変換

```typescript
type AppError =
  | { type: 'VALIDATION_ERROR'; details: string }
  | { type: 'DATABASE_ERROR'; details: string }
  | { type: 'NETWORK_ERROR'; details: string };

const toAppError = (error: EmailError): AppError => ({
  type: 'VALIDATION_ERROR',
  details: error.message
});

pipe(
  input.email,
  createEmail,              // Result<Email, EmailError>
  mapError(toAppError)      // Result<Email, AppError>
);
```

### パターン3: 複数のResultをまとめる

```typescript
// すべて成功した場合のみ続行
const createUser = (
  emailResult: Result<Email, EmailError>,
  ageResult: Result<number, AgeError>
): Result<User, EmailError | AgeError> =>
  pipe(
    emailResult,
    flatMap((email) =>
      pipe(
        ageResult,
        map((age) => ({ email, age }))
      )
    )
  );
```

### パターン4: エラー処理の分岐

```typescript
const result = findUser('123');

if (isErr(result)) {
  switch (result.error.type) {
    case 'USER_NOT_FOUND':
      // 新規ユーザーとして作成
      return createUser(input);
    case 'DATABASE_ERROR':
      // リトライ
      return retryFindUser('123');
    default:
      return result;
  }
}

return ok(result.value);
```

### パターン5: UIでの使用

```typescript
// React コンポーネントでの使用例
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [userResult, setUserResult] = useState<Result<User, Error>>();

  useEffect(() => {
    fetchUser(userId).then(setUserResult);
  }, [userId]);

  if (!userResult) return <div>読み込み中...</div>;

  if (isErr(userResult)) {
    return <div>エラー: {userResult.error.message}</div>;
  }

  const user = userResult.value;
  return <div>{user.name}さんのプロフィール</div>;
};
```

## ベストプラクティス

### 1. 具体的なエラー型を定義

```typescript
// Good: 具体的なエラー型
type ProductError =
  | { type: 'INVALID_PRICE'; price: number; message: string }
  | { type: 'OUT_OF_STOCK'; productId: string }
  | { type: 'DISCONTINUED'; productId: string };

// Bad: 汎用的すぎる
type ProductError = string;
type ProductError = Error;
```

### 2. エラーにコンテキスト情報を含める

```typescript
// Good: エラーに必要な情報を含める
type ValidationError = {
  type: 'VALIDATION_ERROR';
  field: string;      // どのフィールドでエラーか
  value: unknown;     // 入力された値
  message: string;    // エラーメッセージ
};

// Bad: 情報が不足
type ValidationError = {
  message: string;
};
```

### 3. 早期リターンを活用

```typescript
// Good: 早期リターンで読みやすく
const createProduct = (input: ProductInput): Result<Product, ProductError> => {
  if (input.title.trim() === '') {
    return err({ type: 'EMPTY_TITLE', message: 'タイトルは必須です' });
  }

  if (input.price < 0) {
    return err({ type: 'NEGATIVE_PRICE', message: '価格は0以上である必要があります' });
  }

  return ok({ ...input });
};

// Bad: ネストが深くなる
const createProduct = (input: ProductInput): Result<Product, ProductError> => {
  if (input.title.trim() !== '') {
    if (input.price >= 0) {
      return ok({ ...input });
    } else {
      return err({ type: 'NEGATIVE_PRICE', message: '価格は0以上である必要があります' });
    }
  } else {
    return err({ type: 'EMPTY_TITLE', message: 'タイトルは必須です' });
  }
};
```

### 4. pipeで関数を合成

```typescript
// Good: pipeで処理の流れが明確
const processOrder = (input: OrderInput): Result<Order, OrderError> =>
  pipe(
    input,
    validateOrder,
    flatMap(calculateTotal),
    flatMap(applyDiscount),
    flatMap(saveOrder)
  );

// Bad: 手続き的な記述
const processOrder = (input: OrderInput): Result<Order, OrderError> => {
  const validated = validateOrder(input);
  if (isErr(validated)) return validated;

  const withTotal = calculateTotal(validated.value);
  if (isErr(withTotal)) return withTotal;

  const withDiscount = applyDiscount(withTotal.value);
  if (isErr(withDiscount)) return withDiscount;

  return saveOrder(withDiscount.value);
};
```

### 5. 型の絞り込みを活用

```typescript
// TypeScriptの型ガードを活用
const handleResult = (result: Result<User, UserError>) => {
  if (isOk(result)) {
    // ここでは result は Ok<User> 型
    console.log(result.value.name);
  } else {
    // ここでは result は Err<UserError> 型
    console.error(result.error.message);
  }
};
```

## よくある質問

### Q1: 例外を完全に使わないべきですか？

A: いいえ。Result型は**ビジネスロジックのエラー**に使用します。プログラミングエラー（nullポインタ、型エラーなど）は例外で扱っても構いません。

```typescript
// Result型が適している: ビジネスルールの違反
const validateAge = (age: number): Result<number, ValidationError> => {
  if (age < 0 || age > 150) {
    return err({ type: 'OUT_OF_RANGE', message: '年齢が範囲外です' });
  }
  return ok(age);
};

// 例外が適している: プログラミングエラー
const getUser = (users: User[], index: number): User => {
  if (index < 0 || index >= users.length) {
    throw new Error('Index out of bounds');  // これは開発者のミス
  }
  return users[index];
};
```

### Q2: Result型のネストが深くなった場合は？

A: `flatMap`を使ってネストを解消できます。

```typescript
// ネストしている
const result: Result<Result<User, Error>, Error> = ok(ok(user));

// flatMapでフラット化
const flattened: Result<User, Error> = flatMap((innerResult) => innerResult)(result);
```

### Q3: 複数のエラー型をまとめる方法は？

A: Union型を使います。

```typescript
type AppError = EmailError | AgeError | DatabaseError;

const processUser = (input: UserInput): Result<User, AppError> => {
  // ...
};
```

## まとめ

Result型を使うことで:

1. **型安全性**: エラーの型が明確で、コンパイル時にチェックされる
2. **エラーハンドリングの強制**: エラー処理を忘れることがない
3. **関数合成**: `map`、`flatMap`で簡潔に処理を繋げられる
4. **予測可能性**: 例外が発生しないため、プログラムの動作が予測しやすい
5. **テスタビリティ**: 例外を使わないため、テストが書きやすい

このプロジェクトでは、**失敗する可能性がある全ての操作**にResult型を使用することで、堅牢で保守性の高いコードを実現しています。

## 関連項目

- [Pipe関数について.md](./Pipe関数について.md) - pipeとの組み合わせ
- [カリー化について.md](./カリー化について.md) - map/flatMapの仕組み
- `src/shared/functional/result.ts` - Result型の実装
- `CLAUDE.md` - プロジェクト全体の関数型プログラミング方針
