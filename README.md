# Nexus SEO & LLMO Intelligence Platform

AI駆動のSEO/LLMO（Large Language Model Optimization）分析プラットフォームです。従来のSEO指標に加え、ChatGPT、Perplexity、Geminiなどの生成AIでの引用状況を分析し、次世代の検索最適化を支援します。

![Nexus Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 主な機能

### ダッシュボード
- トラッキング中のキーワード数、平均順位、AI可視性、ドメインレーティングをリアルタイム表示
- オーガニック vs AI経由トラフィックの比較チャート
- AIプラットフォーム別の引用分布

### キーワード分析
- SEO + LLMO統合分析
- キーワードの検索ボリューム、難易度、AI可視性スコア
- 競合分析とキーワードギャップ分析

### ドメイン調査（AI駆動）
- **AI分析機能**: ドメインを入力するだけで、AIがサイトを包括的に分析
- ドメインレーティング、月間トラフィック、被リンク数の推定
- LLM引用状況（ChatGPT/Perplexity/Gemini）
- 強みキーワードの特定
- 競合サイトの自動検出と分析
- 具体的な改善提案の生成

### 順位トラッキング
- Google検索順位とAI引用順位のハイブリッド監視
- 履歴データの可視化

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **バックエンド**: Node.js, Express, tRPC
- **データベース**: PostgreSQL (Drizzle ORM)
- **認証**: Google OAuth 2.0
- **AI**: OpenAI GPT-4 (invokeLLM)
- **API統合**: Google Search Console, PageSpeed Insights

## セットアップ

### 必要条件

- Node.js 18以上
- PostgreSQL データベース
- Google Cloud Console プロジェクト（OAuth認証用）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/nexus-seo-platform.git
cd nexus-seo-platform

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

### 環境変数

以下の環境変数を設定してください：

```env
# データベース
DATABASE_URL=postgresql://user:password@host:5432/database

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret

# AI API（Manus内蔵）
BUILT_IN_FORGE_API_KEY=your_forge_api_key
BUILT_IN_FORGE_API_URL=your_forge_api_url
```

### 開発サーバーの起動

```bash
# 開発モードで起動
pnpm dev
```

### データベースのセットアップ

```bash
# スキーマをプッシュ
pnpm db:push
```

## 使い方

### ドメイン分析

1. サイドバーから「ドメイン調査」を選択
2. 分析したいドメイン（例: example.com）を入力
3. 「AI分析」ボタンをクリック
4. AIが10〜30秒で包括的な分析結果を生成

### キーワード分析

1. サイドバーから「キーワード分析」を選択
2. 分析したいキーワードを入力
3. 検索ボリューム、難易度、AI可視性スコアを確認

## デプロイ

### Manusでのデプロイ

このプロジェクトはManus上で開発されており、Manusの「Publish」ボタンからワンクリックでデプロイできます。

### 他のプラットフォームでのデプロイ

1. PostgreSQLデータベースをセットアップ
2. 環境変数を設定
3. `pnpm build` でビルド
4. `pnpm start` で起動

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## 作者

Manus AI Assistant
