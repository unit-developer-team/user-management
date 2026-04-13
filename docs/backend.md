# バックエンド技術詳細

## 1. 構成概要

```
クライアント（React）
  ↓ HTTPS
API Gateway（認証・ルーティング）
  ↓
Lambda BFF（振り分け・バリデーション）
  ↓ HTTP
ALB（ロードバランサー）
  ↓
ECS Fargate（APIコンテナ）
  ↓ VPCエンドポイント経由
DynamoDB（UsersTable）
```

---

## 2. 技術スタック

| 技術 | 役割 |
|------|------|
| API Gateway | 外部からのHTTPリクエスト受付・認証 |
| Lambda（Node.js 20.x / TypeScript） | BFF：振り分け・バリデーション |
| ALB（Application Load Balancer） | ECSへのロードバランシング |
| ECS Fargate | APIコンテナの実行環境 |
| Express（TypeScript） | RESTful APIの実装 |
| DynamoDB | ユーザー情報の永続化 |
| Cognito | 認証基盤 |

---

## 3. ディレクトリ構成

```
lambda/bff/
├── src/
│   ├── handlers/
│   │   └── userHandler.ts      ← Lambdaのエントリーポイント
│   ├── services/
│   │   └── apiForwarder.ts     ← ECSへの転送ロジック
│   └── utils/
│       ├── response.ts         ← レスポンス生成ユーティリティ
│       └── validate.ts         ← バリデーション
└── package.json

containers/api/
├── src/
│   ├── routes/
│   │   └── userRoutes.ts       ← ルーティング定義
│   ├── controllers/
│   │   └── userController.ts   ← リクエスト処理
│   ├── services/
│   │   └── dynamoService.ts    ← DynamoDBアクセス
│   ├── models/
│   │   └── user.ts             ← Userの型定義
│   └── app.ts                  ← Expressの起動
├── Dockerfile
└── package.json
```

---

## 4. API Gateway

### 4.1 役割

- 外部クライアントからのHTTPリクエストを受け付ける
- Cognito AuthorizerでJWTトークンを検証する
- 検証OKのリクエストのみLambdaに転送する

### 4.2 Cognito Authorizer

```
クライアント
  ↓ Authorization: Bearer {IDトークン}
API Gateway
  ↓ トークンをCognitoに検証依頼
Cognito
  ↓ 検証OK → Lambdaに転送 / 検証NG → 401を返す
Lambda
```

#### 動く仕組み
1. クライアントがリクエストの `Authorization` ヘッダーにCognitoのIDトークンを付与する
2. API GatewayのCognito Authorizerがトークンをユーザープールに照合して検証する
3. 検証OKの場合はLambdaに `requestContext.authorizer.claims` としてユーザー情報を渡す
4. 検証NGの場合はLambdaに転送せず401を返す

### 4.3 エンドポイント構成

| メソッド | パス | 説明 |
|------|------|------|
| GET | /users | ユーザー一覧取得 |
| POST | /users | ユーザー登録 |
| GET | /users/{id} | ユーザー詳細取得 |
| DELETE | /users/{id} | ユーザー削除 |

---

## 5. Lambda BFF

### 5.1 役割

- 認証情報の取得
- 入力バリデーション
- ECSコンテナへのリクエスト転送
- レスポンス整形

### 5.2 userHandler.ts

```typescript
// handlers/userHandler.ts
export const handler = async (event: APIGatewayEvent) => {

  // ① 認証情報の取得（Cognito Authorizerが検証済みのClaimsを使う）
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) return unauthorized();

  // ② GETはバリデーション不要なのでそのまま転送
  if (event.httpMethod === "GET") {
    return await forwardToApi(event);
  }

  // ③ GET以外は入力バリデーション
  const validated = validate(event.body);
  if (!validated.ok) return badRequest(validated.error);

  // ④ 振り分け
  switch (event.httpMethod) {
    case "POST":
    case "DELETE":
      return await forwardToApi(event);
    default:
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }
};
```

#### 動く仕組み
1. API Gatewayから渡された `event` に認証済みのユーザー情報が含まれている
2. `event.requestContext.authorizer.claims.sub` でCognitoのユーザーIDを取得する
3. ユーザーIDが取得できない場合はAPI GatewayのAuthorizerが通過していないと判断して401を返す
4. HTTPメソッドに応じてECSへの転送処理を行う

### 5.3 apiForwarder.ts

```typescript
// services/apiForwarder.ts
export const forwardToApi = async (event: APIGatewayEvent) => {
  const albUrl = process.env.ALB_URL;         // ALBのDNS名
  const internalToken = process.env.INTERNAL_TOKEN; // 内部通信用トークン

  const path = event.path ?? "/users";
  const url = `${albUrl}${path}`;             // 転送先URL

  const res = await fetch(url, {
    method: event.httpMethod,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": internalToken,      // 内部通信用トークンを付与
    },
    body: event.body ? event.body : undefined,
  });

  const data = await res.json();
  return {
    statusCode: res.status,
    headers: CORS_HEADERS,                    // CORSヘッダーを付与
    body: JSON.stringify(data),
  };
};
```

#### 動く仕組み
1. `ALB_URL` 環境変数からALBのDNS名を取得する
2. `event.path` からリクエストパスを取得してALBへの転送URLを組み立てる
3. `X-Internal-Token` ヘッダーを付与することでECS側でLambda以外からのアクセスを拒否できる
4. ECSからのレスポンスにCORSヘッダーを付与してクライアントに返す

### 5.4 CORSの設定

```typescript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://xxxx.cloudfront.net",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};
```

#### なぜCORSヘッダーが必要か
ブラウザはセキュリティ上の理由から異なるドメインへのリクエストを制限しています（Same-Origin Policy）。CloudFrontのドメイン（`xxxx.cloudfront.net`）からAPI Gateway（`xxxx.execute-api.amazonaws.com`）へのリクエストはドメインが異なるため、CORSヘッダーがないとブラウザがレスポンスを拒否します。

---

## 6. ECS Fargate（APIコンテナ）

### 6.1 役割

- ALBからのリクエストをExpressで受け付ける
- DynamoDBからユーザー情報を取得・登録・削除する
- ALBのヘルスチェックに応答する

### 6.2 内部トークン検証

```typescript
// routes/userRoutes.ts
const verifyInternalToken = (req: any, res: any, next: any) => {
  const token = req.headers["x-internal-token"];
  if (token !== process.env.INTERNAL_TOKEN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
```

#### 動く仕組み
1. LambdaがALBにリクエストを送る際に `X-Internal-Token` ヘッダーを付与する
2. ECS側でヘッダーの値とタスク定義の環境変数 `INTERNAL_TOKEN` を比較する
3. 値が一致しない場合は403を返すことでLambda以外からの直接アクセスを拒否する

### 6.3 dynamoService.ts

```typescript
// services/dynamoService.ts
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// ユーザー一覧取得
export const getAllUsers = async (): Promise<User[]> => {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
  }));
  return (res.Items ?? []) as User[];
};

// ユーザー登録
export const createUser = async (user: User): Promise<void> => {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)", // 同じIDが存在する場合は上書きしない
  }));
};

// ユーザー削除
export const deleteUser = async (id: string): Promise<void> => {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }));
};
```

#### 動く仕組み
1. ECSタスクはIAMタスクロール（`user-management-ecs-task-role`）を持っている
2. `DynamoDBClient` はタスクロールの認証情報を自動で取得する（環境変数にアクセスキーを書く必要がない）
3. VPCエンドポイント経由でDynamoDBにアクセスするためインターネットを経由しない
4. `ConditionExpression: "attribute_not_exists(id)"` で同じIDのユーザーが既に存在する場合は上書きせずエラーを返す

### 6.4 ヘルスチェック

```typescript
// app.ts
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
```

#### 動く仕組み
1. ALBは定期的にECSコンテナの `/health` にリクエストを送る
2. 200が返ってきた場合はコンテナが正常と判断してトラフィックを転送する
3. 200が返ってこない場合はコンテナを異常と判断してトラフィックを転送しない

---

## 7. DynamoDB

### 7.1 テーブル設計

| 属性 | 型 | 役割 |
|------|------|------|
| id | String（PK） | ユーザーID（UUID） |
| name | String | ユーザー名 |
| email | String | メールアドレス |
| createdAt | String | 作成日時（ISO8601） |

### 7.2 キャパシティモード

オンデマンドモードを採用しています。アクセス量に応じて自動でキャパシティが調整されるため、開発環境での無駄なコストを抑えられます。

---

## 8. ネットワーク設計

### 8.1 VPC構成

```
VPC（10.0.0.0/16）
├── パブリックサブネット
│   ├── user-management-public-1（10.0.1.0/24）ap-northeast-1a
│   └── user-management-public-2（10.0.2.0/24）ap-northeast-1c
│       └── ALB（インターネット向け）
└── プライベートサブネット
    ├── user-management-private-1（10.0.10.0/24）ap-northeast-1a
    └── user-management-private-2（10.0.11.0/24）ap-northeast-1c
        └── ECS Fargate
```

### 8.2 セキュリティグループ

| SG名 | インバウンド | アウトバウンド |
|------|------|------|
| alb-sg | HTTP:80（0.0.0.0/0） | HTTP:3000（ecs-api-sg） |
| ecs-api-sg | HTTP:3000（alb-sg） | HTTPS:443（vpce-sg） |
| vpce-sg | HTTPS:443（ecs-api-sg, codebuild-sg） | 全て許可 |
| codebuild-sg | なし | HTTPS:443（vpce-sg） |

#### 動く仕組み
1. ALBはインターネットからHTTP:80のみ受け付ける
2. ECSはALBからのアクセスのみ受け付ける（SGで制御）
3. ECSからDynamoDB・ECR・CloudWatch LogsへのアクセスはVPCエンドポイント経由（インターネットを経由しない）
4. CodeBuildもVPC内に配置してVPCエンドポイント経由でECRにアクセスする

### 8.3 VPCエンドポイント

| エンドポイント | 種別 | 用途 |
|------|------|------|
| DynamoDB | Gateway | ECS → DynamoDB |
| ECR API | Interface | ECS/CodeBuild → ECRイメージ取得 |
| ECR DKR | Interface | ECS/CodeBuild → Dockerイメージ取得 |
| CloudWatch Logs | Interface | ECS → ログ出力 |
| SQS | Interface | 将来のWorker用 |

#### なぜVPCエンドポイントを使うか
ECSがプライベートサブネットに配置されているため、インターネットへの経路がありません。VPCエンドポイントを使うことでインターネットを経由せずにAWSサービスにアクセスできます。NAT Gatewayを使わないためコストも抑えられます。

---

## 9. IAM設計

### 9.1 Lambda実行ロール（user-management-lambda-role）

| 権限 | 理由 |
|------|------|
| CloudWatch Logs | ログ出力 |

LambdaはVPC外に配置されているためALBへの通信はHTTPで行います。IAMによるアクセス制御は不要です。

### 9.2 ECSタスクロール（user-management-ecs-task-role）

```json
{
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:DeleteItem",
    "dynamodb:Scan"
  ],
  "Resource": "arn:aws:dynamodb:ap-northeast-1:xxx:table/UsersTable"
}
```

#### 動く仕組み
ECSタスクはタスクロールを持つことでAWSサービスへのアクセス権限を得ます。アクセスキーをコードに書く必要がなく、タスクが自動で認証情報を取得します。

### 9.3 ECSタスク実行ロール（user-management-ecs-execution-role）

| 権限 | 理由 |
|------|------|
| AmazonECSTaskExecutionRolePolicy | ECRからのイメージ取得・CloudWatch Logs出力 |

---

## 10. CI/CDパイプライン

### 10.1 構成

```
GitHubへのプッシュ（containers/api/**の変更）
  ↓ トリガー
CodePipeline（user-management-pipeline-api）
  ↓
CodeBuild（user-management-build-api）
  ├── ECRへのログイン
  ├── Dockerイメージのビルド
  ├── ECRへのプッシュ
  └── ECSサービスの更新（ローリングアップデート）
```

### 10.2 buildspec-api.yml

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
      - IMAGE_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

  build:
    commands:
      - cd containers/api
      - docker build --no-cache -t $IMAGE_URI .

  post_build:
    commands:
      - docker push $IMAGE_URI
      - aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment
```

#### 動く仕組み
1. `containers/api/**` 以下のファイルが変更されてmainブランチにプッシュされると自動でパイプラインが起動する
2. CodeBuildがECRにログインしてDockerイメージをビルドする
3. ビルドしたイメージをECRにプッシュする
4. `aws ecs update-service` でECSサービスを更新する。ECSが新しいイメージでタスクを起動してローリングアップデートを行う

### 10.3 Dockerfileのマルチステージビルド

```dockerfile
# ビルドステージ：TypeScriptをコンパイル
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# 本番ステージ：devDependenciesを除いた軽量イメージ
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

#### なぜマルチステージビルドを使うか
1つのステージでビルドすると、TypeScriptのコンパイラやdevDependenciesが本番イメージに含まれてしまいます。マルチステージビルドでビルド用とランタイム用を分けることで本番イメージを軽量化できます。
