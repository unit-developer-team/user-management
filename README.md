# DISP-Unit-Project

> DISP社内向けトライアル開発用AWS共通基盤

---

## 🎯 プロジェクトの背景・目的

本チームでは、新規施策の検証を開始するたびにゼロからインフラを構築していました。
その結果、初期工数がかさみ、検証開始までのリードタイムが長期化する阻害要因となっていました。

本プロジェクトでは、トライアル開発を迅速に開始できる共通基盤をあらかじめ整備し、アプリケーションが想定通りに動作し、実際の業務で利用できるかを素早く検証できる環境を提供します。

この基盤が解決する課題は2つあります。

- **新規構築コストの削減** — 本基盤が提供する共通機能により、エンジニアの個別実装の負荷を軽減します。
- **モダンなアーキテクチャの標準化** — SPA + BFF + コンテナ構成（React / Lambda / ECS）の実例を整理し、チーム内で再利用可能な設計指針として整備します。

この基盤を活用することで、アイデアが生まれてから検証を開始するまでのリードタイムを短縮し、施策の試行回数そのものを増やすことができます。

---

## 🏗️ 設計思想

本基盤の基本方針は3つあります。これらの思想が、アーキテクチャの各技術選定の根拠になっています。

### 迅速に検証できる開発サイクル

新規開発では実装が完了しても検証環境へ公開できない状態が、開発の障壁となります。
CDNの設定・HTTPS化・キャッシュ制御などのインフラ作業が完了するまで、
検証環境への公開の待機が発生するためです。

本基盤はこれらのインフラ構築を自動化しており、開発初期段階から検証環境への公開が可能です。
またフロントエンドとバックエンドが疎結合であるため、
UIのみを先行して公開・検証するなど、柔軟な開発サイクルを支援します。

### アプリケーション開発に集中できる実行環境

スケールや可用性の管理は、基盤側で自動的に担保されるため、開発者が意識する必要はありません。
ECS Fargateによるオートスケーリングや、DynamoDBによるデータ管理の自動化により、運用負荷を最小限に抑えます。
スキーマレスなデータ構造により、仕様変更に柔軟に対応できます。

### 安定してデプロイできる開発基盤

手動操作による設定ミスを防止し、開発状況をチーム全体で把握するため、CI/CDパイプラインを組み込んでいます。
コード変更をトリガーとした自動ビルド・デプロイにより、動作する最新のコードが環境に反映される状態を維持します。

---

## 🧱 アーキテクチャ

上記の設計思想を実現する技術構成は以下の通りです。フロントとバックの完全分離が、試行錯誤しやすさの設計上の根拠になっています。

### アーキテクチャ図

![architecture](./docs/architecture.png)
```
[ブラウザ]
    ↓ HTTPS
[CloudFront] ← S3（Reactビルド成果物）
    ↓
[Cognito] ← 認証（サインアップ・サインイン）
    ↓
[API Gateway] ← Cognito Authorizer
    ↓
[Lambda BFF] ← 振り分け・バリデーション
    ↓ HTTP
[ALB]
    ↓
[ECS Fargate（APIコンテナ）] ← Express / TypeScript
    ↓ VPCエンドポイント経由（インターネットを通らない）
[DynamoDB（UsersTable）]
```

ブラウザからのリクエストはCloudFrontで受け、Cognito認証を通過した後、Lambda BFFが内容を検証してECSコンテナに転送します。ECSからDynamoDBへの通信はVPCエンドポイント経由のため、インターネットを経由しません。

### 構成の選択理由

| 構成要素 | トライアル開発における意図 |
|---------|--------------------------|
| S3 + CloudFront | 静的サイト配信のベストプラクティス。フロントの公開・更新が素早くできる |
| ECS Fargate | サーバー管理不要。コンテナを差し替えるだけでアプリを更新できる |
| Lambda BFF | 入口の共通化と、各チームの実装の自由度を両立する |
| DynamoDB | スキーマレスで素早くデータ構造を変えられる。トライアル期間中の変更に強い |
| Cognito | 認証基盤を自前で作らなくてよい。セキュアな認証をすぐに組み込める |
| VPCエンドポイント | インターネットを経由せずにAWSサービスと通信。セキュリティを高める |

### セキュリティ方針

本基盤では、トライアル用途に合わせて簡潔性と安全性のバランスを取っています。
外部からの通信を最小化し、内部通信にも認証を設けるという構成を採用しています。

- **外部通信の制御** — ブラウザとの通信はCloudFront経由のHTTPSに限定します。ECS↔DynamoDB間はVPCエンドポイントを利用し、パブリックインターネットを経由しない構成としています。
- **API認証** — すべてのAPIリクエストにCognitoのIDトークンが必要です。API GatewayのCognito Authorizerにより、リクエストの正当性を検証します。
- **内部通信の認証** —  Lambda↔ECS間はINTERNAL_TOKENによるトークン認証を行います。外部APIキーとは独立して管理することで、漏洩時の影響範囲を限定します。
- **最小権限の原則** — 各コンポーネントに付与するIAMロールは、動作に必要なリソースのみにアクセスを制限しています。

#### ⚠️ 現状の制約

本番環境への転用を検討する場合は、以下の制約を考慮してください。
対応方針の詳細は[ロードマップ](#-ロードマップ)を参照してください。

| 項目 | 現状 | 本番向け対応方針 |
|------|------|----------------|
| ALBの配置 | パブリックサブネット | Internal ALB化 |
| LambdaのVPC配置 | 未対応 | VPC内配置によるネットワーク閉域化 |
| WAF | 未対応 | リクエストフィルタリングの導入が必要 |

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

\```bash
cp .env.example .env
\```

> `.env.example` には値の入っていないプレースホルダーが書かれています。
> `.env` にコピーした後、以下の表を参考にAWSコンソールから実際の値を取得して書き換えてください。
> `.env` はGitの管理対象外のため、書き換えた内容が誤ってGitHubに公開されることはありません。

| 変数名 | 取得場所 |
|--------|---------|
| `VITE_API_URL` | API Gateway → ステージ → URLをコピー |
| `VITE_USER_POOL_ID` | Cognito → ユーザープール → プールID |
| `VITE_USER_POOL_CLIENT_ID` | Cognito → ユーザープール → アプリクライアント |

### Step 2: フロントエンドの起動

\```bash
cd user-management/frontend
npm install
npm run dev    # http://localhost:5173 をブラウザで開く
\```

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

## 🔐 環境変数・設定ファイル

### ローカル開発用

ローカルで動かすときだけ必要です。GitHubには含まれません（`.gitignore`で除外済み）。

**frontend/.env**
\```
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
\```

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

## 🔮 ロードマップ

現在は**トライアル開発の最小構成**として動作する状態です。

> **⚠️ 利用前に確認してください**
> 本基盤は以下の用途を対象外としています。
> - マルチリージョン構成・障害復旧設計
> - WAFによるリクエストフィルタリング等の高度なセキュリティ制御
> - リザーブドインスタンス等のコスト最適化
> - アラート設計・オンコール体制などの本番運用フロー

優先度は以下の2軸で判断しています。
- 現時点で手動オペレーションが残っている領域
- 利用規模拡大時にボトルネック化しやすい領域

**優先度: 高 — 現状、手作業またはテスト空白が残っている領域**
- LambdaのCI/CDパイプライン構築 — 現在手動のデプロイを自動化し、フロントエンド・バックエンドと同様のフローに統一する

**優先度: 中 — 利用規模が拡大したときに最初に限界が来る領域**
- ECS Workerコンテナの実装（SQSによる非同期処理） — 複数チームが同じ基盤を使い始めたときの負荷分散と、重い処理の切り離しを実現する
- ページネーション対応（DynamoDB ScanからQueryへの変更） — データ量が増えても安定したレスポンスを維持するために必要

**優先度: 中 — 本番移行を見据えた運用成熟度の向上**
- IaC（TerraformまたはCDK）によるインフラのコード化 — 現在は手動管理の部分を残したまま。インフラの再現性・レビュー可能性を高める
- 本番環境向けのセキュリティ強化（Internal ALB + LambdaのVPC配置） — より本番に近い構成への移行。現在はトライアル用途のため一部をシンプルに保っている

### 現時点でカバーしない範囲

本基盤はトライアル開発フェーズに特化した構成であり、以下は現時点で対象外となっています。本番サービスへの移行を検討する際は、別途要件定義が必要になります。

- **高可用性・障害復旧** — マルチリージョン構成やRTOを定めた障害復旧設計は含まない
- **高度なセキュリティ制御** — WAFによるリクエストフィルタリング、セキュリティ監査ログの長期保管は対象外
- **コスト最適化** — リザーブドインスタンスやSavings Planによる料金最適化は行っていない
- **本番運用の観測性** — アラート設計・ダッシュボード・オンコール体制などの運用フローは含まない


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

## 📚 ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [フロントエンド技術詳細](docs/frontend.md) | React・Amplify・CloudFront・CI/CDの詳細 |
| [バックエンド技術詳細](docs/backend.md) | Lambda・ECS・DynamoDB・VPC・IAMの詳細 |
| [API仕様書](docs/api-spec.md) | エンドポイント・リクエスト・エラー仕様 |

---

## 💸 コストと運用負荷

マネージドサービス中心の構成のため、インフラの運用負荷はほぼ発生しません。スケールアップ・バックアップ・冗長化はAWS側が自動で担保します。

コストはすべて従量課金です。小規模なトライアル用途（開発メンバー数名・リクエスト数が少ない期間）では月数百円〜数千円程度に収まることが多いです。ECS Fargateは起動中のコンテナ数に比例するため、不要なタスクを停止しておくと抑制できます。

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

---

