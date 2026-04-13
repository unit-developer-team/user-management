# API仕様書

## 1. 概要

### ベースURL

```
https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

### 認証

全てのエンドポイントはCognito認証が必要です。リクエストヘッダーにCognitoのIDトークンを付与してください。

```
Authorization: Bearer {CognitoIDトークン}
```

#### トークンの取得方法（フロントエンド）

```typescript
import { fetchAuthSession } from "aws-amplify/auth";

const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();
```

### リクエストヘッダー

| ヘッダー | 必須 | 説明 |
|------|------|------|
| `Authorization` | ✅ | `Bearer {CognitoIDトークン}` |
| `Content-Type` | POST時のみ | `application/json` |

---

## 2. エンドポイント一覧

| メソッド | パス | 説明 |
|------|------|------|
| GET | /users | ユーザー一覧取得 |
| POST | /users | ユーザー登録 |
| GET | /users/{id} | ユーザー詳細取得 |
| DELETE | /users/{id} | ユーザー削除 |

---

## 3. エンドポイント詳細

### 3.1 ユーザー一覧取得

```
GET /users
```

**リクエスト**

ボディなし

**レスポンス（200 OK）**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "山田太郎",
    "email": "yamada@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "田中花子",
    "email": "tanaka@example.com",
    "createdAt": "2024-01-02T00:00:00.000Z"
  }
]
```

**ユーザーが存在しない場合（200 OK）**

```json
[]
```

---

### 3.2 ユーザー登録

```
POST /users
```

**リクエストボディ**

```json
{
  "name": "山田太郎",
  "email": "yamada@example.com"
}
```

| フィールド | 型 | 必須 | 説明 |
|------|------|------|------|
| name | string | ✅ | ユーザー名 |
| email | string | ✅ | メールアドレス |

**レスポンス（201 Created）**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 動く仕組み
1. LambdaがリクエストボディをバリデーションしてECSに転送する
2. ECSがUUIDでIDを自動生成して `createdAt` に現在時刻を設定する
3. DynamoDBの `ConditionExpression` により同じIDが存在する場合は409を返す

---

### 3.3 ユーザー詳細取得

```
GET /users/{id}
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|------|------|------|
| id | string | ユーザーID（UUID） |

**レスポンス（200 OK）**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3.4 ユーザー削除

```
DELETE /users/{id}
```

**パスパラメータ**

| パラメータ | 型 | 説明 |
|------|------|------|
| id | string | ユーザーID（UUID） |

**レスポンス（200 OK）**

```json
{
  "message": "削除しました"
}
```

---

## 4. エラーレスポンス一覧

### 4.1 エラーレスポンスの形式

```json
{
  "message": "エラーの説明"
}
```

### 4.2 ステータスコード一覧

| ステータスコード | 説明 | 発生箇所 |
|------|------|------|
| 400 Bad Request | リクエストボディが不正 | Lambda（バリデーション） |
| 401 Unauthorized | 認証トークンがない・無効 | API Gateway（Cognito Authorizer） |
| 403 Forbidden | 内部トークンが不一致 | ECS（verifyInternalToken） |
| 404 Not Found | ユーザーが存在しない | ECS（getUserById） |
| 405 Method Not Allowed | 対応していないHTTPメソッド | Lambda |
| 409 Conflict | 同じIDのユーザーが既に存在する | ECS（DynamoDB ConditionExpression） |
| 500 Internal Server Error | サーバー内部エラー | Lambda / ECS |
| 502 Bad Gateway | LambdaからECSへの接続失敗 | Lambda（apiForwarder） |

### 4.3 エラーレスポンス例

**401 Unauthorized**

```json
{
  "message": "Unauthorized"
}
```

**400 Bad Request**

```json
{
  "message": "リクエストボディがありません"
}
```

**404 Not Found**

```json
{
  "message": "ユーザーが見つかりません"
}
```

**409 Conflict**

```json
{
  "message": "既に存在するユーザーです"
}
```

---

## 5. リクエストの流れ

### 5.1 ユーザー一覧取得（GET /users）

```
① クライアント
   GET /users
   Authorization: Bearer {IDトークン}
   ↓
② API Gateway
   Cognito AuthorizerがIDトークンを検証
   検証OK → Lambdaに転送
   検証NG → 401を返す
   ↓
③ Lambda BFF
   event.requestContext.authorizer.claims.subでユーザーIDを確認
   GETなのでバリデーションをスキップ
   ALBに転送
   ↓
④ ALB
   ECSコンテナにルーティング
   ↓
⑤ ECS（Express）
   X-Internal-Tokenを検証
   DynamoDBにScanCommandを送信
   ↓
⑥ DynamoDB
   UsersTableを全件スキャン
   ↓
⑦ レスポンス
   ECS → Lambda → API Gateway → クライアント
```

### 5.2 ユーザー登録（POST /users）

```
① クライアント
   POST /users
   Authorization: Bearer {IDトークン}
   Body: { "name": "山田太郎", "email": "yamada@example.com" }
   ↓
② API Gateway
   Cognito AuthorizerがIDトークンを検証
   ↓
③ Lambda BFF
   リクエストボディをJSONとしてパース・バリデーション
   ALBに転送
   ↓
④ ALB → ECS（Express）
   X-Internal-Tokenを検証
   ↓
⑤ ECS（userController）
   nameとemailの存在確認
   uuidv4でIDを生成
   new Date().toISOString()でcreatedAtを生成
   ↓
⑥ DynamoDB
   PutCommandでUsersTableに書き込み
   ConditionExpressionで重複チェック
   ↓
⑦ レスポンス
   作成したユーザー情報を201で返す
```

---

## 6. データモデル

### User

```typescript
type User = {
  id: string;        // UUID（自動生成）
  name: string;      // ユーザー名
  email: string;     // メールアドレス
  createdAt: string; // ISO8601形式（例: "2024-01-01T00:00:00.000Z"）
};
```

### DynamoDB UsersTable

| 属性 | 型 | キー |
|------|------|------|
| id | String | パーティションキー（PK） |
| name | String | - |
| email | String | - |
| createdAt | String | - |

---

## 7. CORS設定

フロントエンド（CloudFront）からAPI Gatewayへのリクエストを許可するためCORSを設定しています。

### レスポンスヘッダー

```
Access-Control-Allow-Origin: https://xxxx.cloudfront.net
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Allow-Methods: GET,POST,DELETE,OPTIONS
```

### プリフライトリクエスト

ブラウザはPOSTやDELETEリクエストを送る前にOPTIONSリクエスト（プリフライト）を送ってCORSの許可を確認します。API GatewayのCORS設定でOPTIONSメソッドを有効化しています。

```
① ブラウザ
   OPTIONS /users
   Origin: https://xxxx.cloudfront.net
   ↓
② API Gateway
   Access-Control-Allow-Origin: https://xxxx.cloudfront.net を返す
   ↓
③ ブラウザ
   CORSの許可を確認して本来のリクエスト（POST等）を送信
```
