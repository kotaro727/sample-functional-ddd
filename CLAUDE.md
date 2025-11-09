# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**このプロジェクトでは日本語を使用してください。**
- コメント、ドキュメント、コミットメッセージは日本語で記述
- コードの説明やディスカッションも日本語で行う
- 変数名や関数名は英語を使用（TypeScriptの慣例に従う）

## プロジェクト概要

関数型プログラミング（FP）とドメイン駆動設計（DDD）を組み合わせた受発注システムのサンプルプロジェクトです。TypeScriptで実装し、ヘキサゴナルアーキテクチャ（ポート&アダプター）を採用しています。

## アーキテクチャ

### 層構造と依存関係

```
Presentation → Application → Domain
       ↓            ↓
Infrastructure (Portsを実装)
```

**依存関係のルール:**
- 外側の層は内側の層にのみ依存
- 内側の層は外側の層に依存しない（依存性逆転の原則）
- InfrastructureはApplicationのPorts（インターフェース）を実装

### 各層の責務

**Domain (`src/domain/`)**: 外部依存を持たない純粋なビジネスロジック
- 境界づけられたコンテキスト（注文、顧客、商品）ごとに集約を編成
- 純粋関数とイミュータブルなデータ構造
- 値オブジェクトは`shared/valueObjects/`に配置
- ドメインイベントは各集約ディレクトリ内
- エラーハンドリング用のResult型は`shared/result.ts`

**Application (`src/application/`)**: ユースケースとビジネスフロー
- ユースケースを関数として実装（例: `createOrder.ts`, `cancelOrder.ts`）
- Ports（インターフェース）は`ports/`サブディレクトリに定義
- 関数合成によってワークフローを構築
- 依存性はPortsを通じて抽象化

**Infrastructure (`src/infrastructure/`)**: 外部システムアダプター
- `persistence/`: データベース実装（Prisma予定）
- `persistence/repositories/`: リポジトリの具体的実装
- `external/`: サードパーティサービス連携
- `config/`: 技術的な設定

**Presentation (`src/presentation/`)**: ユーザーインターフェースとAPI
- `api/routes/`: APIルーティング定義
- `api/controllers/`: リクエストハンドラー
- `api/middleware/`: 横断的関心事
- `api/dto/`: API境界のためのデータ転送オブジェクト
- `ui/`: Reactによるフロントエンド
  - `ui/components/`: 再利用可能なReactコンポーネント
  - `ui/pages/`: ページコンポーネント
  - `ui/hooks/`: カスタムフック

**Shared (`src/shared/`)**: 横断的な関数型ユーティリティ
- `functional/either.ts`: エラーハンドリング用Either型
- `functional/option.ts`: null許容値用Option型
- `functional/task.ts`: 非同期処理用Task型
- `functional/pipe.ts`: 関数合成ユーティリティ
- `logger/`: ロギングユーティリティ

## 関数型プログラミングの原則

**イミュータビリティ**: すべてのデータ構造は不変である必要があります。readonly型を使用し、ミューテーションを避けます。

**純粋関数**: DomainとApplication層の関数は純粋であるべきです（副作用なし、決定論的）。

**関数合成**: `shared/functional/`のユーティリティを使用して、小さく焦点を絞った関数を合成することで複雑な操作を構築します。

**型安全性**: TypeScriptの型システムを最大限活用します。ドメインモデルには判別可能な共用体型（ADT）を使用します。

## テスト駆動開発（TDD）

**このプロジェクトではTDD（Test-Driven Development）を採用します。**

### TDDサイクル
1. **Red**: まず失敗するテストを書く
2. **Green**: テストが通る最小限の実装を行う
3. **Refactor**: コードをリファクタリングして改善

### 開発フロー（厳守）

**必ずこの順序で開発を進めること:**

1. **失敗するテストを書く（Red）**
   - テストファイルを作成
   - テストを実行して失敗を確認
   - **開発者に確認してもらう**

2. **開発者からコミット指示を受ける**

3. **テストをグリーンにする実装を書く（Green）**
   - 最小限の実装を追加
   - テストを実行して成功を確認
   - **開発者に確認してもらう**

4. **開発者からコミット指示を受ける**

5. **次の機能に進む、または必要に応じてリファクタリング（Refactor）**

この順序を守ることで、開発者が各ステップを確認でき、適切なタイミングでコミットできます。

### テストの原則
- **テストは日本語で記述**: テストはドキュメントとしての役割も果たすため、describeとtestの説明は日本語で記述
- **モックは極力使用しない**: 純粋関数のテストでは実際の値を使用。外部APIなど副作用がある場合のみモックを使用
- **各層でテストを書く**:
  - Domain層: 値オブジェクト、集約、ドメインサービスの純粋関数をテスト
  - Application層: ユースケースのロジックをテスト（Portsは実装を注入）
  - Infrastructure層: 外部システムとの統合テスト
  - Presentation層: コントローラーのHTTPハンドリングをテスト

### テストファイルの配置
- テストファイルは実装ファイルと同じディレクトリに配置
- ファイル名: `{name}.test.ts`

## 開発コマンド

### セットアップ
```bash
bun install
```

### 開発サーバー起動

**APIサーバー（バックエンド）**
```bash
bun run dev:api  # ポート4000で起動
```

**フロントエンド（React）**
```bash
bun run dev  # ポート3000で起動
```

**並行起動**: APIとフロントエンドを同時に開発する場合は、2つのターミナルで別々に起動

### テスト実行
```bash
bun test
```

### ビルド
```bash
bun run build
```

### 型チェック
```bash
bun run typecheck
```

## 実装ガイドライン

### 新しい集約の作成
1. `src/domain/{aggregate-name}/`配下にディレクトリを作成
2. `{aggregate}.ts`で判別可能な共用体型を使用して型を定義
3. `{aggregate}Validation.ts`にバリデーションロジックを追加
4. `{aggregate}Service.ts`にドメインサービスを実装
5. `events.ts`にドメインイベントを定義

### ユースケースの作成
1. `src/application/{aggregate}/`にファイルを作成
2. 必要なPortsをインターフェースとして`src/application/ports/`に定義
3. 依存性と入力を受け取る関数としてユースケースを実装
4. ワークフローには`shared/functional/`の関数合成を使用
5. エラーハンドリングにはResultまたはEither型を返す

### Infrastructureアダプターの実装
1. 適切な`src/infrastructure/`サブディレクトリにアダプターを作成
2. Application層のPortインターフェースを実装
3. 技術的な詳細（DBアクセス、API呼び出しなど）を処理
4. ドメインモデルと外部表現の間で変換を行う

### エラーハンドリング
- 例外をスローする代わりに`shared/functional/`のResult/Either型を使用
- ドメインバリデーションはResult型を返す
- Application層は関数合成を使用してエラーを伝播
- Infrastructure層は例外をキャッチしてResult/Eitherに変換

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Bun
- **Webフレームワーク**: Express.js（予定）
- **ORM**: Prisma（予定）
- **テスト**: Bun test
- **UI**: React
