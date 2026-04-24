# 開発者ガイド

---

## 🛠️ 技術スタック

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

## 👤 役割別ガイド

この基盤は、役割ごとに「始めるための手順」が異なります。それぞれの入口を以下に示します。

| 対象 | 最初にやること | 詳細 |
|------|--------------|------|
| フロントエンドエンジニア | `frontend/` をCloneして `npm run dev` | `.env.example` を `.env` にコピーして起動するだけで `localhost:5173` で動く。バックエンドの準備は不要 |
| バックエンドエンジニア | `containers/api/` に処理を追加して `npm start` | 認証・ルーティング・スケールは基盤側が担保済み。ロジックを書くことに集中できる |
| チーム全員 | 開発ブランチへのマージ | フロントエンド・APIコンテナともに自動でビルド・デプロイされる。Lambdaのみ現時点で手動 |

---

## ⚡ クイックスタート

フロントエンドのみで利用する場合の最小構成での起動手順

```bash
git clone https://github.com/unit-developer-team/user-management.git
cd user-management/frontend
npm install
cp .env.example .env   # 環境変数を設定（下記「環境変数」を参照）
npm run dev            # http://localhost:5173 で起動
```

APIまで繋いだE2Eの確認や、AWSへのデプロイ手順は「[動かし方](#-動かし方)」を参照してください。

---

## 💻 ローカル開発

### 前提条件

- Node.js 20以上
- AWS CLIの設定済み
- Gitのインストール済み


#### 認証情報

**Git / GitHub**
- このリポジトリへの読み取り権限があるGitHubアカウント
- SSHキーの登録 または 個人アクセストークン（PAT）の設定が済んでいること
  - 参考: [GitHubへのSSH接続設定](https://docs.github.com/ja/authentication/connecting-to-github-with-ssh)

**AWS**
- 開発用AWSアカウントへのIAMユーザーまたはIAMロールが払い出されていること
- `aws configure` で以下が設定済みであること
    - AWS Access Key ID
    - AWS Secret Access Key
    - Default region: ap-northeast-1


### Step 1: フロントエンドの環境設定

フロントエンドがAWSの認証基盤(Cognito)やAPIと通信するための設定を行います。

`.env.example` は設定ファイルのテンプレートです。
このファイルを `.env` という名前でコピーし、自分の環境の値に書き換えて使います。

```bash
cp .env.example .env
```

> `.env.example` には値の入っていないプレースホルダーが書かれています。
> `.env` にコピーした後、以下の表を参考にAWSコンソールから実際の値を取得して書き換えてください。
> `.env` はGitの管理対象外のため、書き換えた内容が誤ってGitHubに公開されることはありません。

| 変数名 | 取得場所 |
|--------|---------|
| `VITE_API_URL` | API Gateway → ステージ → URLをコピー |
| `VITE_USER_POOL_ID` | Cognito → ユーザープール → プールID |
| `VITE_USER_POOL_CLIENT_ID` | Cognito → ユーザープール → アプリクライアント |

### Step 2: フロントエンドの起動

```bash
cd user-management/frontend
npm install
npm run dev    # http://localhost:5173 をブラウザで開く
```

フロントエンドが起動したら、実際に画面を操作してバックエンドとの連携を確認します。

1.ブラウザで http://localhost:5173 を開く

2.ログイン画面が表示されるので、Cognitoで作成したユーザーでサインインする

3.ユーザー一覧の取得や登録を試す

### Step 3: バックエンドとのE2E確認

バックエンドの動作確認はAWSへのデプロイ後に行います。
デプロイ手順は [デプロイ方法](#-デプロイ方法) を参照してください。

---

## 📁 ディレクトリ構成

```
user-management/
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

## 🔐 環境変数・設定ファイル

### ローカル開発用

ローカルで動かすときだけ必要です。GitHubには含まれません（`.gitignore`で除外済み）。

**frontend/.env**
```
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### CI/CD用（CodeBuild）

CodePipelineが自動デプロイする際に使用します。AWSコンソールのCodeBuild設定画面で管理者が設定します。開発者が直接編集することはありません。

| サービス | キー | 説明 |
|---------|------|------|
| フロントエンド | `VITE_API_URL` | API GatewayのURL |
| フロントエンド | `VITE_USER_POOL_ID` | CognitoユーザープールID |
| フロントエンド | `VITE_USER_POOL_CLIENT_ID` | CognitoアプリクライアントID |
| フロントエンド | `CLOUDFRONT_DISTRIBUTION_ID` | CloudFrontのディストリビューションID |
| APIコンテナ | `AWS_ACCOUNT_ID` | AWSアカウントID |

---

### 実行環境用

AWS上で各サービスが動作する際に参照します。初期構築時に管理者が設定します。

**Lambda環境変数**

| キー | 説明 |
|------|------|
| `ALB_URL` | ALBのDNS名（`http://`から始まる） |
| `INTERNAL_TOKEN` | 内部通信用トークン（Lambda⇔ECS間の認証） |

**ECSタスク定義**

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

全てのエンドポイントにCognitoのIDトークンが必要です:

```
Authorization: Bearer {CognitoIDトークン}
```

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/users` | ユーザー一覧取得 |
| POST | `/users` | ユーザー登録 |
| GET | `/users/{id}` | ユーザー詳細取得 |
| DELETE | `/users/{id}` | ユーザー削除 |

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
|----------------|------|
| 400 | リクエストボディが不正 |
| 401 | 認証トークンがない・無効 |
| 404 | ユーザーが存在しない |
| 409 | 同じIDのユーザーが既に存在する |
| 500 | サーバー内部エラー |

詳細は [API仕様書](docs/api-spec.md) を参照してください。

---

## 🚢 デプロイ方法

フロントエンドとAPIコンテナは、mainブランチへのpushで自動デプロイされます。Lambdaのみ現時点では手動デプロイが必要です（CI/CD化は今後の課題）。

### フロントエンド

```bash
git add .
git commit -m "変更内容"
git push origin main
# → CodePipelineが自動起動 → テスト → ビルド → S3デプロイ → CloudFrontキャッシュ無効化
```

### APIコンテナ

```bash
git add .
git commit -m "変更内容"
git push origin main
# → CodePipelineが自動起動 → Dockerビルド → ECRプッシュ → ECSローリングアップデート
```

### Lambda（手動）

```bash
cd lambda/bff
npm run build
cd dist
# PowerShell
Compress-Archive -Path * -DestinationPath ../function.zip -Force
# AWSコンソールからfunction.zipをアップロード
```

---

## 🔭 運用・観測性

### ログ設計

#### 形式
全ログはJSON形式で出力しています。

#### フィールド
| フィールド | 説明 |
|------------|------|
| level | ログレベル（下記参照） |
| message | ログの内容 |
| request_id | リクエストの追跡ID |
| timestamp | 発生時刻（ISO 8601形式） |

#### ログレベルの定義

| レベル | 用途 | 例 |
|--------|------|----|
| INFO | 正常な処理の記録 | リクエスト受信、DB取得成功 |
| WARN | 動いているが注意が必要 | リトライ発生、レスポンスが遅い |
| ERROR | 対応が必要な問題 | API失敗、DB接続エラー |

#### レベルの判断基準
- ユーザーに影響が出ていない → WARN
- ユーザーに影響が出ている　 → ERROR
- 正常な処理の記録　　　　　 → INFO

### CloudWatchでの確認方法

**エラーログのみ確認する場合**
```sql
fields @timestamp, level, message, request_id
| filter level = "ERROR"
| sort @timestamp desc
```

**特定リクエストを追跡する場合**
```sql
fields @timestamp, level, message
| filter request_id = "abc-123"
| sort @timestamp asc
```
