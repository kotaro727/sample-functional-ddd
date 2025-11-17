# 関数型DDD コードレビュー

指定されたファイルまたはディレクトリを関数型プログラミングとドメイン駆動設計の観点からレビューします。

## DDDの重要概念

レビューを行う前に、以下のDDD概念を理解してください:
- [集約（Aggregate）](../../docs/集約.md): 整合性とトランザクションの境界

## レビュー項目

### 1. プリミティブ型の濫用（Primitive Obsession）

**チェック内容:**
- `string`, `number`, `boolean` が値オブジェクト化されるべき概念として使われていないか
- 特にドメイン概念（ID、メールアドレス、金額、電話番号など）がプリミティブ型のままでないか

**良い例:**
```typescript
type User = {
  email: Email;           // 値オブジェクト
  passwordHash: PasswordHash;  // 値オブジェクト
}
```

**悪い例:**
```typescript
type User = {
  email: string;          // プリミティブ型
  passwordHash: string;   // プリミティブ型
}
```

### 2. イミュータビリティ（Immutability）

**チェック内容:**
- 全てのフィールドに `readonly` 修飾子があるか
- `Date` オブジェクトなどミュータブルな型を使用していないか
- スプレッド演算子で新しいオブジェクトを返しているか

**良い例:**
```typescript
export type User = {
  readonly email: Email;
  readonly profile: Profile | null;
};

const updateProfile = (user: User, profile: Profile): User => {
  return { ...user, profile };  // 新しいオブジェクトを返す
};
```

**悪い例:**
```typescript
export type User = {
  email: Email;  // readonly がない
  createdAt: Date;  // Date はミュータブル
};
```

### 3. 純粋関数（Pure Functions）

**チェック内容:**
- 関数が副作用を持っていないか
- 同じ入力に対して常に同じ出力を返すか（決定論性）
- `console.log`, `Date.now()`, `Math.random()` などの非決定的操作がないか

**良い例:**
```typescript
const createUser = (email: Email, passwordHash: PasswordHash): User => {
  return { email, passwordHash, profile: null };
};
```

**悪い例:**
```typescript
const createUser = (email: Email, passwordHash: PasswordHash): User => {
  console.log('Creating user...');  // 副作用
  return {
    email,
    passwordHash,
    createdAt: new Date(),  // 非決定的
  };
};
```

### 4. ドメイン/インフラの分離

**チェック内容:**
- ドメインモデルに永続化に関する情報（`id`, `createdAt`, `updatedAt`）が含まれていないか
- ドメイン層がインフラ層に依存していないか
- 依存性逆転の原則が守られているか

**良い例:**
```typescript
// ドメイン層
export type User = {
  readonly email: Email;
  readonly passwordHash: PasswordHash;
  readonly profile: ValidatedUserProfile | null;
};

// インフラ層
export type UserEntity = User & {
  readonly id: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
```

**悪い例:**
```typescript
// ドメイン層に永続化の関心事が混入
export type User = {
  readonly id: number;  // 永続化の関心事
  readonly email: Email;
  readonly createdAt: Date;  // 永続化の関心事
};
```

### 4.5. 集約の設計（Aggregate Design）

**チェック内容:**
- 集約ルートが明確に定義されているか
- 集約の境界が適切に設定されているか
- 集約内のオブジェクトへの変更が集約ルートを経由しているか
- 集約が整合性の境界として機能しているか
- 集約が適切なサイズ（小さすぎず大きすぎず）か
- 集約間の参照がIDで行われているか

詳細は [集約の説明](../../docs/集約.md) を参照してください。

**良い例:**
```typescript
// 集約ルート: Order
export type Order = {
  readonly _tag: 'Order';
  readonly customerId: CustomerId;  // IDで他の集約を参照
  readonly items: readonly OrderItem[];
  readonly status: OrderStatus;
};

// 集約ルートを通じてアイテムを追加（純粋関数）
export const addOrderItem = (
  order: Order,
  item: OrderItem
): Result<Order, DomainError> => {
  // 整合性チェック: 注文済みの場合は追加不可
  if (order.status === 'Confirmed') {
    return err({
      type: 'ORDER_ALREADY_CONFIRMED',
      message: '確定済みの注文には追加できません',
    });
  }
  // 新しい集約を返す（イミュータブル）
  return ok({ ...order, items: [...order.items, item] });
};
```

**悪い例:**
```typescript
// 集約ルートを経由せず直接変更
export const addItemDirectly = (
  items: OrderItem[],
  item: OrderItem
): OrderItem[] => {
  items.push(item);  // ミュータブル + 整合性チェックなし
  return items;
};

// 集約が大きすぎる
export type Order = {
  readonly customer: Customer;  // 集約全体を含める（IDのみにすべき）
  readonly items: readonly {
    product: Product;  // 集約全体を含める（IDのみにすべき）
    quantity: number;
  }[];
};
```

### 5. 型安全性（Type Safety）

**チェック内容:**
- 判別可能な共用体型（ADT）を使用しているか
- `null` や `undefined` ではなく `Option` 型を使用しているか
- エラーハンドリングに `Result` 型を使用しているか
- 値オブジェクトに `_tag` フィールドがあるか

**良い例:**
```typescript
export type PersonName = {
  readonly _tag: 'PersonName';  // 判別可能
  readonly value: string;
};

export const createPersonName = (name: string): Result<PersonName, ValidationError> => {
  // ...
};
```

**悪い例:**
```typescript
export const createPersonName = (name: string): PersonName | null => {
  // null を使用（Result型を使うべき）
};
```

### 6. エラーハンドリング

**チェック内容:**
- 例外（`throw`）を使わず `Result` または `Either` 型を返しているか
- エラー型が判別可能な共用体型になっているか
- エラーメッセージが適切か

**良い例:**
```typescript
export type ValidationError =
  | { type: 'EMPTY_NAME'; message: string }
  | { type: 'NAME_TOO_LONG'; message: string };

export const createPersonName = (name: string): Result<PersonName, ValidationError> => {
  if (name.trim().length === 0) {
    return err({ type: 'EMPTY_NAME', message: '名前は空にできません' });
  }
  return ok({ _tag: 'PersonName', value: name.trim() });
};
```

**悪い例:**
```typescript
export const createPersonName = (name: string): PersonName => {
  if (name.trim().length === 0) {
    throw new Error('名前は空にできません');  // 例外を投げる
  }
  return { _tag: 'PersonName', value: name.trim() };
};
```

### 7. 関数合成（Function Composition）

**チェック内容:**
- 複雑な処理を小さな関数に分割しているか
- `pipe` や関数合成ユーティリティを使用しているか
- 関数が単一責任の原則に従っているか

**良い例:**
```typescript
export const validateUserProfile = (
  unvalidated: UnvalidatedUserProfile
): Result<ValidatedUserProfile, ValidationError> => {
  const nameResult = createPersonName(unvalidated.name);
  if (isErr(nameResult)) return nameResult;

  const addressResult = createAddress(unvalidated.address);
  if (isErr(addressResult)) return addressResult;

  // ...
};
```

### 8. テスト

**チェック内容:**
- TDDのサイクル（Red → Green → Refactor）に従っているか
- 純粋関数のテストにモックを使用していないか
- テストの説明が日本語で記述されているか
- 境界値テストが含まれているか

## レビュー実行方法

1. レビュー対象のファイルまたはディレクトリを指定してください
2. 上記の全ての観点から詳細にチェックします
3. 問題点と改善提案を具体的なコード例とともに提示します
4. 優先度（高・中・低）を付けて報告します

## 出力形式

```markdown
## レビュー結果: [ファイル名]

### ✅ 良い点
- [良い点のリスト]

### ⚠️ 改善が必要な点

#### 【優先度: 高】項目名
**問題:**
[問題の説明]

**現在のコード:**
```typescript
[問題のあるコード]
```

**推奨する改善:**
```typescript
[改善後のコード]
```

**理由:**
[なぜこの改善が必要か]

---

#### 【優先度: 中】項目名
...

### 📊 総合評価
- 関数型プログラミング適合度: X/10
- DDD適合度: X/10
- 総合スコア: X/10
```
