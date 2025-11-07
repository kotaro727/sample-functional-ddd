# sample-functional-ddd

関数型プログラミングとドメイン駆動設計（DDD）を組み合わせた受発注システムのサンプルプロジェクトです。

## プロジェクトの目的

- 関数型プログラミングのパラダイムでDDDを実践
- TypeScriptによる型安全な実装
- Hexagonal Architecture（ポート&アダプター）の採用
- イミュータブルなデータ構造と純粋関数の活用

## ディレクトリ構造

```
sample-functional-ddd/
├── src/
│   ├── domain/              # ドメイン層
│   ├── application/         # アプリケーション層
│   ├── infrastructure/      # インフラストラクチャ層
│   ├── presentation/        # プレゼンテーション層
│   ├── shared/             # 共通ユーティリティ
│   └── main.ts             # エントリーポイント
├── tests/                  # テストコード
└── package.json
```

### 各層の責務

#### Domain層 (`src/domain/`)
ビジネスロジックの中核を担う純粋関数とドメインモデルを配置します。

```
domain/
├── order/                  # 注文集約
│   ├── order.ts           # Order型定義（ADT）
│   ├── orderValidation.ts # バリデーションロジック
│   ├── orderService.ts    # ドメインサービス
│   └── events.ts          # ドメインイベント
├── customer/              # 顧客集約
├── product/               # 商品集約
└── shared/
    ├── valueObjects/      # 値オブジェクト（Email, Money等）
    └── result.ts          # Result型
```

**特徴:**
- 外部依存を持たない純粋関数
- イミュータブルなデータ構造
- ビジネスルールのカプセル化

#### Application層 (`src/application/`)
ユースケースを実装し、ドメイン層を組み合わせてビジネスフローを実現します。

```
application/
├── order/
│   ├── createOrder.ts     # 注文作成ユースケース
│   ├── cancelOrder.ts     # 注文キャンセル
│   └── updateOrder.ts     # 注文更新
├── customer/              # 顧客関連ユースケース
└── ports/                 # ポート（インターフェース定義）
    ├── orderRepository.ts
    ├── customerRepository.ts
    └── notificationService.ts
```

**特徴:**
- ユースケースを関数として実装
- Portsを通じた依存性の抽象化
- 関数合成によるフローの構築

#### Infrastructure層 (`src/infrastructure/`)
外部システムとの接続を担当するアダプターを実装します。

```
infrastructure/
├── persistence/           # 永続化
│   ├── prisma/           # ORMスキーマ
│   └── repositories/     # リポジトリ実装
├── external/             # 外部サービス
│   ├── emailService.ts
│   └── paymentGateway.ts
└── config/               # 設定
    └── database.ts
```

**特徴:**
- Portsの具体的な実装（アダプター）
- データベース、外部APIとの連携
- 技術的な詳細を隠蔽

#### Presentation層 (`src/presentation/`)
ユーザーインターフェースとAPIエンドポイントを提供します。

```
presentation/
├── api/                   # REST API
│   ├── routes/           # ルーティング定義
│   ├── controllers/      # コントローラー
│   ├── middleware/       # ミドルウェア
│   └── dto/              # データ転送オブジェクト
└── ui/                   # フロントエンド（optional）
    ├── components/
    └── pages/
```

**特徴:**
- HTTPリクエスト/レスポンスのハンドリング
- DTOを通じたデータ変換
- 認証・認可の実装

#### Shared層 (`src/shared/`)
プロジェクト全体で使用する共通ユーティリティです。

```
shared/
├── functional/            # 関数型ユーティリティ
│   ├── either.ts         # Either型
│   ├── option.ts         # Option型
│   ├── task.ts           # Task型（非同期処理）
│   └── pipe.ts           # パイプライン関数
└── logger/
    └── logger.ts         # ロガー
```

**特徴:**
- 関数型プログラミングのための基本的な型
- エラーハンドリングの抽象化
- 関数合成のためのユーティリティ

## アーキテクチャの原則

### 依存性の方向
```
Presentation → Application → Domain
       ↓            ↓
Infrastructure (Ports実装)
```

- 外側の層は内側の層に依存できる
- 内側の層は外側の層に依存しない（依存性逆転の原則）
- InfrastructureはApplicationのPortsを実装

### 関数型プログラミングの原則
- **イミュータビリティ**: すべてのデータ構造は不変
- **純粋関数**: 副作用のない関数を基本とする
- **関数合成**: 小さな関数を組み合わせて複雑な処理を実現
- **型安全性**: TypeScriptの型システムを最大限活用

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Bun
- **フレームワーク**: Express.js（予定）
- **ORM**: Prisma（予定）
- **テスト**: Bun test
- **UI**: React
- **開発サーバー**: Vite

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動（ポート3000）
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview

# テストの実行
bun test

# 型チェック
bun run typecheck
```
