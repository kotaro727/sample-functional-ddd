# Git Worktreeを使った並行開発ガイド

## 概要

Git Worktreeを使用して、同一リポジトリの複数ブランチで同時に作業する方法を解説します。
このガイドでは、認証機能のバックエンド・フロントエンド開発を並行して進めるケースを例に説明します。

## Git Worktreeとは？

**Git Worktree**は、1つのGitリポジトリの**複数のブランチを同時に異なるディレクトリで作業できる**機能です。

### 通常のGitの制約

```bash
# 通常のGit
cd /Users/suzukikoutarou/sample-functional-ddd
git checkout feature/auth-backend  # バックエンド開発中...

# フロントエンドも作業したい！でも...
git checkout feature/auth-frontend  # ← ブランチ切り替えでファイルが全部変わる
# 問題: バックエンドの作業中ファイルが消える、開発サーバーが停止する
```

### Git Worktreeの解決策

```bash
# Git Worktree使用
/Users/suzukikoutarou/
├── sample-functional-ddd/           # メインディレクトリ（mainブランチ）
├── ddd-backend/                     # 別ディレクトリ（feature/auth-backendブランチ）
└── ddd-frontend/                    # 別ディレクトリ（feature/auth-frontendブランチ）

# 各ディレクトリで独立して作業可能！
# ファイルも、ブランチも、開発サーバーも、全て独立
```

## 基本コマンド

### 1. Worktreeを追加

```bash
# 基本構文
git worktree add <新しいディレクトリのパス> <ブランチ名>

# 例1: バックエンド用のworktree
git worktree add ../ddd-backend feature/auth-backend
# → /Users/suzukikoutarou/ddd-backend/ を作成
# → feature/auth-backendブランチがチェックアウトされた状態

# 例2: フロントエンド用のworktree
git worktree add ../ddd-frontend feature/auth-frontend
# → /Users/suzukikoutarou/ddd-frontend/ を作成
# → feature/auth-frontendブランチがチェックアウトされた状態
```

### 2. Worktreeの一覧を表示

```bash
git worktree list

# 出力例:
# /Users/suzukikoutarou/sample-functional-ddd  abc1234 [main]
# /Users/suzukikoutarou/ddd-backend            def5678 [feature/auth-backend]
# /Users/suzukikoutarou/ddd-frontend           ghi9012 [feature/auth-frontend]
```

### 3. Worktreeを削除

```bash
# ディレクトリを削除
git worktree remove ../ddd-backend

# または、ディレクトリを手動削除後にクリーンアップ
rm -rf ../ddd-backend
git worktree prune  # 削除されたworktreeを検出して整理
```

### 4. Worktreeに移動

```bash
# 普通にcdで移動
cd ../ddd-backend

# 確認
pwd
# /Users/suzukikoutarou/ddd-backend

git branch
# * feature/auth-backend  ← このブランチがチェックアウトされている
```

## セットアップ手順

### ステップ1: Worktreeを作成

```bash
# メインディレクトリにいることを確認
cd /Users/suzukikoutarou/sample-functional-ddd
pwd
# /Users/suzukikoutarou/sample-functional-ddd

# バックエンド用のworktreeを作成
git worktree add ../ddd-backend feature/auth-backend
# Preparing worktree (new branch 'feature/auth-backend')
# HEAD is now at xxx...

# フロントエンド用のworktreeを作成
git worktree add ../ddd-frontend feature/auth-frontend
# Preparing worktree (new branch 'feature/auth-frontend')
# HEAD is now at xxx...

# 作成されたディレクトリを確認
ls ../
# sample-functional-ddd/
# ddd-backend/  ← 新しく作成された
# ddd-frontend/ ← 新しく作成された
```

### ステップ2: 各ディレクトリで依存関係をインストール

```bash
# バックエンドディレクトリ
cd ../ddd-backend
bun install

# フロントエンドディレクトリ
cd ../ddd-frontend
bun install
```

### ステップ3: VSCodeで各ディレクトリを開く

```bash
# ウィンドウ1: バックエンド開発
cd /Users/suzukikoutarou/ddd-backend
code .
# VSCodeでClaude Codeを起動

# ウィンドウ2: フロントエンド開発（新しいターミナル）
cd /Users/suzukikoutarou/ddd-frontend
code .
# VSCodeでClaude Codeを起動
```

### ステップ4: 開発サーバーを起動

**バックエンドウィンドウ:**
```bash
bun run dev:api
# http://localhost:4000 で起動
```

**フロントエンドウィンドウ:**
```bash
bun run dev
# http://localhost:3000 で起動
```

## 開発ワークフロー

### 1. 各Worktreeで開発・コミット

#### バックエンドディレクトリでの作業

```bash
cd /Users/suzukikoutarou/ddd-backend

# 開発作業...
# Phase 1実装、テスト作成など

# 変更をコミット
git add src/domain/user/email.ts src/domain/user/email.test.ts
git commit -m "feat: Email値オブジェクト実装（Phase 1-1）"

git add src/domain/user/password.ts src/domain/user/password.test.ts
git commit -m "feat: Password値オブジェクト実装（Phase 1-1）"

# ブランチの状態確認
git log --oneline
# abc1234 feat: Password値オブジェクト実装（Phase 1-1）
# def5678 feat: Email値オブジェクト実装（Phase 1-1）
```

#### フロントエンドディレクトリでの作業

```bash
cd /Users/suzukikoutarou/ddd-frontend

# 開発作業...
# Phase 5実装など

# 変更をコミット
git add src/presentation/ui/contexts/AuthContext.tsx
git commit -m "feat: AuthContext実装（Phase 5-1）"

git add src/presentation/ui/hooks/useAuth.ts
git commit -m "feat: useAuthフック実装（Phase 5-1）"

# ブランチの状態確認
git log --oneline
# ghi9012 feat: useAuthフック実装（Phase 5-1）
# jkl3456 feat: AuthContext実装（Phase 5-1）
```

### 2. メインディレクトリでマージ

```bash
# メインディレクトリに移動
cd /Users/suzukikoutarou/sample-functional-ddd

# 現在のブランチ確認
git branch
# * main
#   feature/auth-backend   ← worktreeで作業中
#   feature/auth-frontend  ← worktreeで作業中

# ブランチの最新状態を確認
git log feature/auth-backend --oneline
# abc1234 feat: Password値オブジェクト実装（Phase 1-1）
# def5678 feat: Email値オブジェクト実装（Phase 1-1）

git log feature/auth-frontend --oneline
# ghi9012 feat: useAuthフック実装（Phase 5-1）
# jkl3456 feat: AuthContext実装（Phase 5-1）

# mainブランチにいることを確認
git checkout main

# バックエンドブランチをマージ
git merge feature/auth-backend
# Updating xxx...yyy
# Fast-forward
#  src/domain/user/email.ts | 20 ++++++++++++++++++++
#  src/domain/user/email.test.ts | 30 ++++++++++++++++++++++++++++++
#  ...

# フロントエンドブランチをマージ
git merge feature/auth-frontend
# Updating yyy...zzz
# Fast-forward
#  src/presentation/ui/contexts/AuthContext.tsx | 50 ++++++++++++++++++++++++++++++++++++++++++++++++++
#  ...

# mainブランチの状態確認
git log --oneline --graph
# *   (HEAD -> main) Merge branch 'feature/auth-frontend'
# |\
# | * ghi9012 feat: useAuthフック実装（Phase 5-1）
# | * jkl3456 feat: AuthContext実装（Phase 5-1）
# * |   Merge branch 'feature/auth-backend'
# |\ \
# | * | abc1234 feat: Password値オブジェクト実装（Phase 1-1）
# | * | def5678 feat: Email値オブジェクト実装（Phase 1-1）
```

### 3. コンフリクトの解決（発生した場合）

```bash
# マージ時にコンフリクトが発生した場合
git merge feature/auth-frontend
# Auto-merging src/presentation/ui/App.tsx
# CONFLICT (content): Merge conflict in src/presentation/ui/App.tsx
# Automatic merge failed; fix conflicts and then commit the result.

# コンフリクトファイルを確認
git status
# On branch main
# You have unmerged paths.
#   (fix conflicts and run "git commit")
#
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   src/presentation/ui/App.tsx

# ファイルを開いて手動で解決
code src/presentation/ui/App.tsx

# コンフリクトマーカーを削除後、ステージング
git add src/presentation/ui/App.tsx

# マージコミット
git commit -m "Merge feature/auth-frontend into main"

# または、マージを中止
git merge --abort
```

### 4. マージ後の確認

```bash
# メインディレクトリで確認
cd /Users/suzukikoutarou/sample-functional-ddd

# ファイル構成を確認
ls -la src/domain/user/
# email.ts
# email.test.ts
# password.ts
# password.test.ts
# ← バックエンドの変更が反映されている

ls -la src/presentation/ui/contexts/
# AuthContext.tsx
# ← フロントエンドの変更が反映されている

# テストを実行
bun test

# 型チェック
bun run typecheck

# 開発サーバーで動作確認
bun run dev:api &  # バックグラウンド
bun run dev        # フロントエンド
```

### 5. Worktreeでの継続開発

マージ後も、worktreeで開発を継続できます：

```bash
# バックエンドworktreeに戻る
cd /Users/suzukikoutarou/ddd-backend

# 最新のmainの変更を取り込む（必要に応じて）
git merge main
# または
git rebase main

# 開発を継続
# Phase 2の実装...
git add src/application/auth/register.ts
git commit -m "feat: ユーザー登録ユースケース実装（Phase 2-1）"

# 再度mainにマージ
cd /Users/suzukikoutarou/sample-functional-ddd
git checkout main
git merge feature/auth-backend
```

### 6. Worktreeの削除（開発完了後）

```bash
# メインディレクトリに移動
cd /Users/suzukikoutarou/sample-functional-ddd

# worktree一覧を確認
git worktree list
# /Users/suzukikoutarou/sample-functional-ddd  abc1234 [main]
# /Users/suzukikoutarou/ddd-backend            def5678 [feature/auth-backend]
# /Users/suzukikoutarou/ddd-frontend           ghi9012 [feature/auth-frontend]

# worktreeを削除
git worktree remove ../ddd-backend
git worktree remove ../ddd-frontend

# ブランチも削除する場合（マージ済みなら）
git branch -d feature/auth-backend
git branch -d feature/auth-frontend

# または、ブランチは残しておく（将来の機能追加用）
```

## 実践的なワークフロー例

### シナリオ: Phase 1とPhase 5を並行開発してmainに統合

```bash
# 【初期セットアップ】
cd /Users/suzukikoutarou/sample-functional-ddd
git worktree add ../ddd-backend feature/auth-backend
git worktree add ../ddd-frontend feature/auth-frontend

# 【バックエンド開発】ターミナル1
cd /Users/suzukikoutarou/ddd-backend
bun install
bun run dev:api
# Claude Codeに指示: Phase 1実装
# ... 開発 ...
git add src/domain/user/*
git commit -m "feat: Phase 1完了 - User値オブジェクト実装"

# 【フロントエンド開発】ターミナル2
cd /Users/suzukikoutarou/ddd-frontend
bun install
bun run dev
# Claude Codeに指示: Phase 5実装
# ... 開発 ...
git add src/presentation/ui/contexts/* src/presentation/ui/hooks/*
git commit -m "feat: Phase 5完了 - 認証状態管理実装"

# 【統合】ターミナル3
cd /Users/suzukikoutarou/sample-functional-ddd
git checkout main

# バックエンドをマージ
git merge feature/auth-backend
# Updating xxx...yyy
# Fast-forward (コンフリクトなし)

# フロントエンドをマージ
git merge feature/auth-frontend
# Updating yyy...zzz
# Fast-forward (コンフリクトなし)

# 統合テスト
bun test
# ✓ すべてのテストが通過

# リモートにプッシュ（GitHub等）
git push origin main

# 【継続開発】
# バックエンドでPhase 2を開発
cd /Users/suzukikoutarou/ddd-backend
git merge main  # 最新のmainを取り込む
# Phase 2実装...

# フロントエンドでPhase 6を開発
cd /Users/suzukikoutarou/ddd-frontend
git merge main  # 最新のmainを取り込む
# Phase 6実装...
```

## OpenAPI型定義の同期

OpenAPI型は両方のworktreeで共有する必要があるため、以下の方法で同期します。

### 方法1: 各Worktreeで独立に型生成（推奨）

両方のworktreeで同じ`openapi/openapi.yaml`を共有しているため、それぞれで生成可能：

```bash
# バックエンドディレクトリ
cd /Users/suzukikoutarou/ddd-backend
bun run openapi:generate

# フロントエンドディレクトリ
cd /Users/suzukikoutarou/ddd-frontend
bun run openapi:generate
```

### 方法2: シンボリックリンク

```bash
# バックエンドworktree
cd /Users/suzukikoutarou/ddd-backend
rm -rf src/generated
ln -s ../../sample-functional-ddd/src/generated src/generated

# フロントエンドworktree
cd /Users/suzukikoutarou/ddd-frontend
rm -rf src/generated
ln -s ../../sample-functional-ddd/src/generated src/generated

# メインディレクトリで型生成
cd /Users/suzukikoutarou/sample-functional-ddd
bun run openapi:generate
# → 両方のworktreeで自動的に反映される
```

### 方法3: メインディレクトリで型生成→コピー

```bash
# メインディレクトリで型生成
cd /Users/suzukikoutarou/sample-functional-ddd
bun run openapi:generate

# 生成された型を他のworktreeにコピー
cp src/generated/api-schema.ts ../ddd-backend/src/generated/
cp src/generated/api-schema.ts ../ddd-frontend/src/generated/
```

## リモートリポジトリとの連携

### Worktreeでの変更をリモートにプッシュ

```bash
# バックエンドworktree
cd /Users/suzukikoutarou/ddd-backend
git push origin feature/auth-backend

# フロントエンドworktree
cd /Users/suzukikoutarou/ddd-frontend
git push origin feature/auth-frontend
```

### プルリクエストをマージ後、メインディレクトリで更新

```bash
# メインディレクトリでプル
cd /Users/suzukikoutarou/sample-functional-ddd
git checkout main
git pull origin main

# worktreeに最新のmainを反映
cd /Users/suzukikoutarou/ddd-backend
git merge main

cd /Users/suzukikoutarou/ddd-frontend
git merge main
```

## Claude Codeを使った並行開発

### 2つのVSCodeウィンドウで同時開発

**ウィンドウ1（バックエンド）:**
```bash
cd /Users/suzukikoutarou/ddd-backend
code .
# Claude Codeに指示:
# 「Phase 1-4を実装してください。TDDサイクルを厳守してください」
```

**ウィンドウ2（フロントエンド）:**
```bash
cd /Users/suzukikoutarou/ddd-frontend
code .
# Claude Codeに指示:
# 「Phase 5-8をモックAPIで実装してください」
```

### 交互に指示を出す

両方のVSCodeウィンドウを並べて表示し、交互にClaude Codeに指示を出します：

1. バックエンドウィンドウ: 「Phase 1のTask 1-1を実装してください」
2. フロントエンドウィンドウ: 「Phase 5のTask 5-1を実装してください」
3. バックエンドウィンドウ: テスト確認・コミット承認
4. フロントエンドウィンドウ: テスト確認・コミット承認
5. 繰り返し...

## よくある質問

### Q1: Worktreeディレクトリを削除したらどうなる？

```bash
rm -rf ../ddd-backend

# ブランチは残る
cd /Users/suzukikoutarou/sample-functional-ddd
git branch
# main
# feature/auth-backend  ← まだ存在

# worktreeの参照を削除
git worktree prune
```

### Q2: コミットはどうなる？

```bash
# worktreeディレクトリでコミット
cd ../ddd-backend
git add .
git commit -m "バックエンド実装"

# メインディレクトリから確認
cd /Users/suzukikoutarou/sample-functional-ddd
git log feature/auth-backend
# ← worktreeでのコミットが見える（同じリポジトリなので）
```

### Q3: node_modulesはどうなる？

```bash
# 各worktreeで独立してインストール必要
cd ../ddd-backend
bun install  # ← このディレクトリ用のnode_modules

cd ../ddd-frontend
bun install  # ← このディレクトリ用のnode_modules

# メインディレクトリとは別
```

### Q4: メインディレクトリは必要？

```bash
# 必要！worktreeはメインディレクトリの.gitを参照している
# メインディレクトリを削除するとworktreeも使えなくなる

# ただし、メインディレクトリでは作業不要
# → すべてworktreeで作業してもOK
```

## まとめ

### Git Worktreeのメリット

- ✅ **完全な並行開発**: 2つのClaude Codeが同時に作業
- ✅ **コンテキスト分離**: バックエンドとフロントエンドのファイルが混在しない
- ✅ **ブランチ独立**: 互いに影響を与えずにコミット可能
- ✅ **効率的**: 片方の待ち時間に、もう片方を進められる

### マージの基本パターン

```bash
# パターン1: 単純なマージ（Fast-forward）
cd メインディレクトリ
git checkout main
git merge feature/auth-backend
# → コンフリクトなし、自動マージ

# パターン2: コンフリクトあり
git merge feature/auth-frontend
# → コンフリクト発生
# → 手動解決
git add 解決したファイル
git commit

# パターン3: マージ前に最新のmainを取り込む
cd worktreeディレクトリ
git merge main  # または git rebase main
# → コンフリクトを事前解決
cd メインディレクトリ
git merge feature/auth-backend
# → コンフリクトなし
```

### 推奨ワークフロー

1. ✅ **Worktreeをセットアップ**: バックエンド・フロントエンド用のディレクトリを作成
2. ✅ **各ディレクトリでVSCodeを開く**: Claude Codeインスタンスを2つ起動
3. ✅ **並行開発**: 各Phaseを同時に進める
4. ✅ **頻繁にコミット**: TDDサイクルごとにコミット
5. ✅ **定期的にマージ**: Phase完了時にmainに統合
6. ✅ **統合テスト**: マージ後に全体のテストを実行
7. ✅ **Worktree削除**: 開発完了後にクリーンアップ

## 参考リンク

- [Git公式ドキュメント - git-worktree](https://git-scm.com/docs/git-worktree)
- [認証・ユーザー管理・メール機能_設計書](./認証・ユーザー管理・メール機能_設計書.md)
- [契約駆動開発ガイド](./CONTRACT_DRIVEN_DEVELOPMENT.md)
