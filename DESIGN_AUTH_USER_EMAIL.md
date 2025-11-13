# 認証・ユーザー管理・メール機能 設計書

## 概要
ユーザー認証、プロフィール管理、注文時のメール通知機能を実装する。

## 機能要件

### 1. ユーザー認証
- ✅ メールアドレスとパスワードでログイン
- ✅ ログアウト機能
- ✅ セッション管理（JWT）
- ✅ パスワードのハッシュ化（bcrypt）

### 2. ユーザープロフィール管理
- ✅ プロフィール登録（名前、住所、電話番号）
- ✅ プロフィール編集
- ✅ プロフィール表示

### 3. 注文との統合
- ✅ 注文時にログインユーザーの情報を使用
- ✅ 注文履歴でユーザーの住所を表示
- ✅ ユーザー別の注文フィルタリング

### 4. メール通知
- ✅ 注文確認メール
- ✅ 請求書メール

---

## バックエンド実装タスク

### Phase 1: ドメイン層 - User

#### Task 1-1: User値オブジェクトの実装
**ファイル**: `src/domain/user/email.ts`
```typescript
// Email値オブジェクト
// - バリデーション: 正規表現でメール形式チェック
// - ブランド型: { _brand: 'Email', value: string }
```

**ファイル**: `src/domain/user/password.ts`
```typescript
// Password値オブジェクト
// - ハッシュ化関数: hashPassword(plainPassword: string)
// - 検証関数: verifyPassword(plainPassword: string, hashedPassword: string)
// - 最小8文字のバリデーション
```

**ファイル**: `src/domain/user/userProfile.ts`
```typescript
// UserProfile値オブジェクト
// - name, address, phone の検証
// - ShippingAddressと同じ構造を再利用
```

#### Task 1-2: Userエンティティの実装
**ファイル**: `src/domain/user/user.ts`
```typescript
// User型定義
export type User = {
  id: number;
  email: Email;
  passwordHash: string;
  profile: UserProfile | null;
  createdAt: Date;
  updatedAt: Date;
};

// ユーザー作成関数
export const createUser = (email: Email, passwordHash: string): User

// プロフィール更新関数
export const updateProfile = (user: User, profile: UserProfile): User
```

**テストファイル**: `src/domain/user/*.test.ts`
- TDD方式でテストを先に書く（日本語）

---

### Phase 2: アプリケーション層 - ユースケース

#### Task 2-1: 認証ユースケース
**ファイル**: `src/application/auth/register.ts`
```typescript
// ユーザー登録
// Input: { email: string, password: string }
// Output: Result<{ user: User, token: string }, RegisterError>
```

**ファイル**: `src/application/auth/login.ts`
```typescript
// ログイン
// Input: { email: string, password: string }
// Output: Result<{ user: User, token: string }, LoginError>
```

**ファイル**: `src/application/auth/verifyToken.ts`
```typescript
// JWTトークン検証
// Input: token: string
// Output: Result<{ userId: number }, TokenError>
```

#### Task 2-2: プロフィール管理ユースケース
**ファイル**: `src/application/user/updateProfile.ts`
```typescript
// プロフィール更新
// Input: { userId: number, profile: UserProfileInput }
// Output: Result<User, UpdateProfileError>
```

**ファイル**: `src/application/user/getProfile.ts`
```typescript
// プロフィール取得
// Input: userId: number
// Output: Result<User, GetProfileError>
```

#### Task 2-3: 注文ユースケースの修正
**ファイル**: `src/application/order/createOrder.ts`（修正）
```typescript
// 修正点:
// - userIdパラメータを追加
// - ユーザープロフィールから住所・顧客情報を取得
// - 注文作成後にメール送信
```

**テストファイル**: `src/application/auth/*.test.ts`, `src/application/user/*.test.ts`

---

### Phase 3: インフラ層 - リポジトリ

#### Task 3-1: UserRepositoryポート定義
**ファイル**: `src/application/ports/userRepository.ts`
```typescript
export interface UserRepository {
  create: (user: User) => Promise<Result<User, UserRepositoryError>>;
  findByEmail: (email: Email) => Promise<Result<User, UserRepositoryError>>;
  findById: (id: number) => Promise<Result<User, UserRepositoryError>>;
  update: (user: User) => Promise<Result<User, UserRepositoryError>>;
}
```

#### Task 3-2: InMemoryUserRepository実装
**ファイル**: `src/infrastructure/memory/inMemoryUserRepository.ts`
```typescript
// メモリ内でユーザーを管理
// Map<number, User>を使用
```

#### Task 3-3: OrderRepositoryの修正
**ファイル**: `src/application/ports/orderRepository.ts`（修正）
```typescript
// 修正点:
// - findByUserId メソッドを追加
// - Order型にuserIdフィールドを追加
```

#### Task 3-4: メールサービスポート定義
**ファイル**: `src/application/ports/emailService.ts`
```typescript
export interface EmailService {
  sendOrderConfirmation: (order: Order, user: User) => Promise<Result<void, EmailError>>;
  sendInvoice: (order: Order, user: User) => Promise<Result<void, EmailError>>;
}
```

#### Task 3-5: コンソールメールサービス実装
**ファイル**: `src/infrastructure/email/consoleEmailService.ts`
```typescript
// 開発用: console.logでメール内容を出力
// 本番では実際のメールサービス（SendGrid等）に差し替え可能
```

---

### Phase 4: プレゼンテーション層 - API

#### Task 4-1: 認証API
**ファイル**: `src/presentation/api/routes/authRoutes.ts`
```typescript
// OpenAPIスキーマ定義:
// POST /auth/register - ユーザー登録
// POST /auth/login - ログイン
// POST /auth/logout - ログアウト（オプション）
```

**ファイル**: `src/presentation/api/controllers/authController.ts`
```typescript
// 認証コントローラー
// - register: ユーザー登録 → JWT発行
// - login: ログイン → JWT発行
```

#### Task 4-2: ユーザーAPI
**ファイル**: `src/presentation/api/routes/userRoutes.ts`
```typescript
// OpenAPIスキーマ定義:
// GET /users/me - 自分のプロフィール取得
// PUT /users/me - プロフィール更新
```

**ファイル**: `src/presentation/api/controllers/userController.ts`
```typescript
// ユーザーコントローラー
// - getProfile: プロフィール取得（要認証）
// - updateProfile: プロフィール更新（要認証）
```

#### Task 4-3: 認証ミドルウェア
**ファイル**: `src/presentation/api/middleware/auth.ts`
```typescript
// JWT検証ミドルウェア
// - Authorizationヘッダーからトークン取得
// - トークン検証
// - c.set('userId', userId) でユーザーIDを保存
```

#### Task 4-4: OrderAPIの修正
**ファイル**: `src/presentation/api/routes/orderRoutes.ts`（修正）
```typescript
// 修正点:
// - POST /orders に認証ミドルウェアを適用
// - GET /orders に認証ミドルウェアを適用（ユーザー自身の注文のみ表示）
```

**ファイル**: `src/presentation/api/controllers/orderController.ts`（修正）
```typescript
// 修正点:
// - createOrder: c.get('userId') からユーザーIDを取得
// - getOrders: ユーザーIDでフィルタリング
```

#### Task 4-5: server.tsの更新
**ファイル**: `src/server.ts`（修正）
```typescript
// 修正点:
// - authRoutes, userRoutes を追加
// - UserRepository, EmailService を依存性注入
```

---

## フロントエンド実装タスク

### Phase 5: 認証状態管理

#### Task 5-1: 認証コンテキスト
**ファイル**: `src/presentation/ui/contexts/AuthContext.tsx`
```typescript
// AuthContext:
// - user: User | null
// - token: string | null
// - login: (email, password) => Promise<void>
// - register: (email, password) => Promise<void>
// - logout: () => void
// - isAuthenticated: boolean

// localStorageでトークン永続化
```

**ファイル**: `src/presentation/ui/hooks/useAuth.ts`
```typescript
// useAuthフック:
// - localStorageからトークン読み込み
// - トークン検証（有効期限チェック）
// - 自動ログアウト
```

---

### Phase 6: 認証UI

#### Task 6-1: ログイン・登録ページ
**ファイル**: `src/presentation/ui/pages/LoginPage.tsx`
```typescript
// ログインフォーム:
// - email入力
// - password入力
// - ログインボタン
// - 登録ページへのリンク
```

**ファイル**: `src/presentation/ui/pages/RegisterPage.tsx`
```typescript
// 登録フォーム:
// - email入力
// - password入力（確認用も）
// - 登録ボタン
// - ログインページへのリンク
```

#### Task 6-2: プロテクトルート
**ファイル**: `src/presentation/ui/components/ProtectedRoute.tsx`
```typescript
// 認証が必要なルートをラップするコンポーネント
// 未認証の場合は/loginにリダイレクト
```

---

### Phase 7: プロフィールUI

#### Task 7-1: プロフィールページ
**ファイル**: `src/presentation/ui/pages/ProfilePage.tsx`
```typescript
// プロフィール表示・編集:
// - 名前、住所、電話番号の表示
// - 編集モード切り替え
// - 保存ボタン
```

---

### Phase 8: 既存UIの修正

#### Task 8-1: App.tsxの修正
**ファイル**: `src/presentation/ui/App.tsx`（修正）
```typescript
// 修正点:
// - AuthProviderでラップ
// - ログイン・登録ルートを追加
// - プロフィールルートを追加
// - 保護が必要なルートをProtectedRouteでラップ
// - ヘッダーにログイン/ログアウトボタンを追加
```

#### Task 8-2: CartPageの修正
**ファイル**: `src/presentation/ui/pages/CartPage.tsx`（修正）
```typescript
// 修正点:
// - 認証済みユーザーのプロフィールから住所を取得
// - 住所が未登録の場合はプロフィール登録を促す
// - 注文リクエストにuserIdを含める（不要、トークンから自動取得）
```

#### Task 8-3: OrderHistoryPageの修正
**ファイル**: `src/presentation/ui/pages/OrderHistoryPage.tsx`（修正）
```typescript
// 修正点:
// - 住所がユーザーのものであることを明示（色付きバッジなど）
// - 「自分の住所」ラベルを追加
```

---

## 技術スタック

### バックエンド
- **認証**: JWT (jsonwebtoken)
- **パスワードハッシュ化**: bcrypt
- **メール**: Console出力（開発用）、将来的にSendGrid等

### フロントエンド
- **状態管理**: React Context API
- **ストレージ**: localStorage（トークン保存）

---

## データモデル

### User
```typescript
{
  id: number;
  email: string;
  passwordHash: string;
  profile: {
    name: string;
    address: {
      postalCode: string;
      prefecture: string;
      city: string;
      addressLine: string;
    };
    phone: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Payload
```typescript
{
  userId: number;
  email: string;
  iat: number; // 発行時刻
  exp: number; // 有効期限（24時間）
}
```

### Order（修正後）
```typescript
{
  id: number;
  userId: number; // 追加
  orderItems: OrderItem[];
  shippingAddress: ValidatedShippingAddress;
  customerInfo: ValidatedCustomerInfo;
  shippingStatus: ShippingStatus;
  totalAmount: number;
  createdAt: Date;
}
```

---

## 実装順序（推奨）

### バックエンド
1. ✅ Phase 1: ドメイン層（User, Email, Password, UserProfile）
2. ✅ Phase 2: アプリケーション層（認証・プロフィールユースケース）
3. ✅ Phase 3: インフラ層（リポジトリ、メールサービス）
4. ✅ Phase 4: プレゼンテーション層（API、ミドルウェア）

### フロントエンド
5. ✅ Phase 5: 認証状態管理（AuthContext, useAuth）
6. ✅ Phase 6: 認証UI（Login, Register）
7. ✅ Phase 7: プロフィールUI（Profile）
8. ✅ Phase 8: 既存UIの修正（App, Cart, OrderHistory）

---

## セキュリティ考慮事項

### 実装済み
- ✅ パスワードのハッシュ化（bcrypt、salt rounds: 10）
- ✅ JWTトークンの有効期限（24時間）
- ✅ HTTPSの使用（本番環境）

### 将来の改善
- ⏳ リフレッシュトークン
- ⏳ レート制限（ログイン試行回数制限）
- ⏳ CSRF対策
- ⏳ パスワードリセット機能

---

## テスト方針

### バックエンド
- ✅ 全ドメインロジックにユニットテスト（日本語、TDD）
- ✅ 全ユースケースにユニットテスト
- ✅ APIエンドポイントの統合テスト

### フロントエンド
- ⏳ 認証フローのE2Eテスト
- ⏳ プロフィール編集のテスト

---

## 依存パッケージ

### 追加が必要なパッケージ
```bash
# バックエンド
bun add jsonwebtoken bcrypt
bun add -D @types/jsonwebtoken @types/bcrypt

# フロントエンド（既存のReactで対応可能）
```

---

## マイグレーション計画

### 既存データとの互換性
1. ✅ 既存のOrderにuserIdフィールドを追加（nullable、既存注文はnull）
2. ✅ 既存のInMemoryOrderRepositoryを更新
3. ✅ 既存のOrderAPIにオプショナルで認証を追加（段階的移行）

---

## この設計書の使い方

この設計書を以下のように活用してください：

1. **タスク単位で実装**:
   - 各Phaseの各Taskを順番に実装
   - 各Taskは独立しており、TDD方式で進行

2. **Claude への指示例**:
   ```
   「Phase 1の Task 1-1 を実装してください」
   「Phase 2の Task 2-1 のテストを書いてください」
   「Phase 4まで完了したので、Phase 5に進んでください」
   ```

3. **進捗管理**:
   - 各Phaseの✅マークで進捗を管理
   - 完了したタスクにチェックを入れる

4. **段階的なコミット**:
   - 各Phase完了時にコミット
   - コミットメッセージに「Phase X完了」を明記

---

## 注意事項

### 本番環境への移行時
- ⚠️ InMemoryRepositoryを実際のDBに置き換え（PostgreSQL等）
- ⚠️ ConsoleEmailServiceを実際のメールサービスに置き換え（SendGrid等）
- ⚠️ JWT_SECRETを環境変数で管理
- ⚠️ HTTPS必須

### 開発環境
- ✅ 開発用のダミーデータを用意
- ✅ メールはコンソール出力で確認
- ✅ トークンはlocalStorageで管理

---

## 完成イメージ

### ユーザーフロー
1. ユーザーが `/register` で登録
2. 自動的にログイン状態に
3. `/profile` でプロフィール登録
4. カートから注文 → プロフィールの住所が自動入力
5. 注文完了 → メール通知（コンソール出力）
6. `/orders` で注文履歴確認 → 自分の住所が表示

---

## 実装開始コマンド例

```bash
# Phase 1開始
「Phase 1の Task 1-1から1-2まで実装してください。TDD方式でテストを先に書いてください。」

# Phase 2開始
「Phase 2の Task 2-1を実装してください。」

# 以降同様に進める
```
