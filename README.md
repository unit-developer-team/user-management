# DISP-Unit-Project

DISPのユニット活動での開発の基盤となるシステム・インフラを構築する。

---

## ✨ 主な機能

- **機能1:** 高速で安全なフロントエンド配信
  - S3 + CloudFront によるグローバルCDN配信で高速レスポンス
  - HTTPS化・キャッシュ最適化によりセキュアかつ高パフォーマンス
  - API Gateway経由でバックエンドと疎結合に連携できる構成

- **機能2:** スケーラブルなバックエンドで負荷に強いアプリを実現
  - ECSによるコンテナ化されたアプリケーションの自動スケール
  - DynamoDBによるサーバーレスで高可用なデータストア
  - API Gateway との組み合わせで完全マネージドなAPI基盤を構築

- **機能3:** CI/CDによる自動デプロイで開発効率が向上
  - Git push → 自動ビルド → 自動デプロイのフルパイプラインを構築
  - ヒューマンエラーを減らし、安定したリリースが可能
  - インフラとアプリの更新が高速化し、開発サイクルが短縮

---

## 🚀 使い方・インストール方法

### 前提条件

- Node.js 20以上
- AWS CLIの設定済み
- Gitのインストール済み

### フロントエンド（ローカル起動）

```bash
cd frontend
npm install
cp .env.example .env   # 環境変数を設定（下記参照）
npm run dev            # http://localhost:5173 で起動
```

### APIコンテナ（ローカル起動）

```bash
cd containers/api
npm install
npm run build
npm start
```

### Lambda BFF（ビルドのみ）

```bash
cd lambda/bff
npm install
npm run build
```

---

## 🛠️ 使用技術

### フロントエンド

| 技術 | 役割 |
|------|------|
| React 18 / TypeScript | UIフレームワーク |
| Vite | ビルドツール |
| AWS Amplify | Cognito連携・認証管理 |
| Vitest / Testing Library | ユニットテスト |
| S3 | 静的ファイルのホスティング |
| CloudFront | CDN配信・HTTPS化 |

### バックエンド

| 技術 | 役割 |
|------|------|
| Lambda（Node.js 20.x / TypeScript） | BFF（振り分け・バリデーション） |
| ECS Fargate / Express / TypeScript | APIコンテナ |
| ALB | ロードバランシング |
| DynamoDB | ユーザーデータの永続化 |
| API Gateway | エンドポイント管理・認証 |
| Cognito | 認証基盤（サインアップ・サインイン） |
| SQS | 非同期処理（将来実装予定） |

### インフラ・運用

| 技術 | 役割 |
|------|------|
| IAM | 最小権限によるアクセス制御 |
| VPC / Subnet / Security Group | ネットワーク閉域化 |
| VPCエンドポイント | インターネットを経由しないAWSサービス通信 |
| CloudWatch | ログ収集・監視 |
| CodePipeline / CodeBuild | CI/CDパイプライン |
| ECR | Dockerイメージの管理 |

---

## 🧱 アーキテクチャ図

![architecture](./docs/architecture.png)

```
[ブラウザ]
    ↓ HTTPS
[CloudFront] ← S3（Reactビルド成果物）
    ↓
[Cognito] ← 認証
    ↓
[API Gateway] ← Cognito Authorizer
    ↓
[Lambda BFF] ← 振り分け・バリデーション
    ↓ HTTP
[ALB]
    ↓
[ECS Fargate（APIコンテナ）] ← Express / TypeScript
    ↓ VPCエンドポイント経由
[DynamoDB（UsersTable）]
```

---

## ⛪ システム構成のポイント（なぜこの構成なのか）

1. **高速で安全なフロントエンド配信を実現するため**
   - S3 + CloudFrontは静的サイト配信のベストプラクティス
   - グローバルCDNにより、どの地域からでも高速アクセスが可能
   - HTTPS・キャッシュ制御などのセキュリティ対策が容易
   - バックエンドとはAPI Gateway経由で疎結合にでき、フロントとAPIの独立性が高い

2. **スケーラブルで運用負荷の低いバックエンドを構築するため**
   - ECS（Fargate）により、サーバー管理不要でコンテナを実行
   - トラフィックに応じて自動スケールし、ピーク時も安定
   - DynamoDBはフルマネージドで、スケール・バックアップ・可用性を自動で担保
   - API Gateway + ALBにより、APIの入口とコンテナの負荷分散を分離できる

3. **CI/CDによる自動化で開発効率と品質を向上させるため**
   - CodePipelineでpush → build → deployを自動化
   - テストが失敗した場合はビルド・デプロイを自動で停止
   - ECRにイメージを保存し、ECSに自動デプロイ
   - CloudFrontのキャッシュ無効化も自動化

4. **拡張性が高く、将来の機能追加に強い構成にするため**
   - フロントとバックエンドが完全に分離（SPA + API）
   - 新しいAPIを追加しても既存構成に影響しにくい
   - SQSによる非同期処理への拡張が容易

---

## 🔐 環境変数・設定ファイル

### frontend/.env

ローカル開発時に必要です。GitHubには含まれません（`.gitignore`で除外済み）。

```
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### AWS CodeBuildの環境変数

本番環境ではCodeBuildの環境変数として設定します。

| サービス | キー | 説明 |
|------|------|------|
| フロントエンド | `VITE_API_URL` | API GatewayのURL |
| フロントエンド | `VITE_USER_POOL_ID` | CognitoユーザープールID |
| フロントエンド | `VITE_USER_POOL_CLIENT_ID` | CognitoアプリクライアントID |
| フロントエンド | `CLOUDFRONT_DISTRIBUTION_ID` | CloudFrontのディストリビューションID |
| APIコンテナ | `AWS_ACCOUNT_ID` | AWSアカウントID |

### Lambda環境変数

| キー | 説明 |
|------|------|
| `ALB_URL` | ALBのDNS名（`http://`から始まる） |
| `INTERNAL_TOKEN` | 内部通信用トークン（Lambda⇔ECS間の認証） |

### ECSタスク定義の環境変数

| キー | 説明 |
|------|------|
| `TABLE_NAME` | DynamoDBのテーブル名（`UsersTable`） |
| `INTERNAL_TOKEN` | 内部通信用トークン（Lambdaと同じ値） |
| `PORT` | Expressのポート番号（`3000`） |

---

## 📡 API仕様

### 概要

| 項目 | 内容 |
|------|------|
| ベースURL | `https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod` |
| データ形式 | JSON |
| 認証方式 | Cognito IDトークン（Bearer認証） |

### 認証方式

全てのエンドポイントにCognitoのIDトークンが必要です。

```
Authorization: Bearer {CognitoIDトークン}
```

### エンドポイント一覧

| メソッド | パス | 説明 |
|------|------|------|
| GET | /users | ユーザー一覧取得 |
| POST | /users | ユーザー登録 |
| GET | /users/{id} | ユーザー詳細取得 |
| DELETE | /users/{id} | ユーザー削除 |

### リクエスト・レスポンス例

**ユーザー登録（POST /users）**

```json
// リクエスト
{
  "name": "山田太郎",
  "email": "yamada@example.com"
}

// レスポンス（201 Created）
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### エラーハンドリング

| ステータスコード | 説明 |
|------|------|
| 400 | リクエストボディが不正 |
| 401 | 認証トークンがない・無効 |
| 404 | ユーザーが存在しない |
| 409 | 同じIDのユーザーが既に存在する |
| 500 | サーバー内部エラー |

詳細は [API仕様書](docs/api-spec.md) を参照してください。

---

## 🚢 デプロイ方法

### フロントエンド

`frontend/` 以下のファイルを変更してmainブランチにプッシュすると自動でデプロイされます。

```bash
git add .
git commit -m "変更内容"
git push origin main
# → CodePipelineが自動起動 → テスト → ビルド → S3デプロイ → CloudFrontキャッシュ無効化
```

### APIコンテナ

`containers/api/` 以下のファイルを変更してmainブランチにプッシュすると自動でデプロイされます。

```bash
git add .
git commit -m "変更内容"
git push origin main
# → CodePipelineが自動起動 → Dockerビルド → ECRプッシュ → ECSローリングアップデート
```

### Lambda

現在は手動デプロイです。

```bash
cd lambda/bff
npm run build
cd dist
# PowerShell
Compress-Archive -Path * -DestinationPath ../function.zip -Force
# AWSコンソールからfunction.zipをアップロード
```

---

## 📁 ディレクトリ構成

```
DISP-Unit-Project/
├── frontend/               ← Reactアプリ
│   ├── src/
│   │   ├── api/            ← API呼び出しロジック
│   │   ├── pages/          ← 画面コンポーネント
│   │   └── tests/          ← テスト
│   ├── buildspec-frontend.yml
│   └── package.json
│
├── lambda/
│   └── bff/                ← Lambda BFF
│       └── src/
│           ├── handlers/   ← Lambdaエントリーポイント
│           ├── services/   ← ECSへの転送ロジック
│           └── utils/      ← バリデーション・レスポンス
│
├── containers/
│   └── api/                ← ECS APIコンテナ
│       └── src/
│           ├── routes/     ← ルーティング
│           ├── controllers/ ← リクエスト処理
│           ├── services/   ← DynamoDBアクセス
│           └── models/     ← 型定義
│
├── docs/
│   ├── frontend.md         ← フロントエンド技術詳細
│   ├── backend.md          ← バックエンド技術詳細
│   └── api-spec.md         ← API仕様書
│
├── buildspec-api.yml       ← APIコンテナのCI/CD設定
└── README.md
```

---

## 📚 ドキュメント

| ドキュメント | 内容 |
|------|------|
| [フロントエンド技術詳細](docs/frontend.md) | React・Amplify・CloudFront・CI/CDの詳細 |
| [バックエンド技術詳細](docs/backend.md) | Lambda・ECS・DynamoDB・VPC・IAMの詳細 |
| [API仕様書](docs/api-spec.md) | エンドポイント・リクエスト・エラー仕様 |

---

## 🔮 今後の課題

- ECS Workerコンテナの実装（SQSによる非同期処理）
- LambdaのCI/CDパイプライン構築
- IaC（TerraformまたはCDK）によるインフラのコード化
- 本番環境向けのセキュリティ強化（Internal ALB + LambdaのVPC配置）
- APIコンテナのユニットテスト実装
- ページネーション対応（DynamoDB ScanからQueryへの変更）
