# フロントエンド技術詳細

## 1. 構成概要

```
React（TypeScript）
  ↓ npm run build
Viteによる静的ファイル生成（dist/）
  ↓ CodePipeline → CodeBuild → S3 sync
S3バケット（user-management-frontend）
  ↓ CloudFront経由で配信
ブラウザ
```

---

## 2. 技術スタック

| 技術 | バージョン | 役割 |
|------|------|------|
| React | 18系 | UIフレームワーク |
| TypeScript | 5系 | 型安全な開発 |
| Vite | 8系 | ビルドツール |
| AWS Amplify | 6系 | Cognito連携 |
| Vitest | 最新 | ユニットテスト |
| Testing Library | 最新 | コンポーネントテスト |

---

## 3. ディレクトリ構成

```
frontend/
├── src/
│   ├── api/
│   │   └── userApi.ts        ← API呼び出しロジック
│   ├── pages/
│   │   └── UsersPage.tsx     ← ユーザー管理画面
│   ├── tests/
│   │   ├── setup.ts          ← テストのセットアップ
│   │   ├── api/
│   │   │   └── userApi.test.ts
│   │   └── pages/
│   │       └── UsersPage.test.tsx
│   ├── aws-exports.ts        ← Amplify設定
│   ├── App.tsx               ← 認証ラッパー
│   └── main.tsx              ← エントリーポイント
├── .env                      ← ローカル開発用環境変数（Git管理外）
├── vite.config.ts
└── package.json
```

---

## 4. 認証フロー（Cognito + Amplify）

### 4.1 設定

```typescript
// aws-exports.ts
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: "ap-northeast-1",
    }
  }
};
```

#### なぜ環境変数で管理するか
`VITE_USER_POOL_ID` などの値はCognitoのリソースIDです。コードに直接書くとGitHubに公開されてしまうため、環境変数で管理しています。ローカルでは `.env` ファイルから、AWS上ではCodeBuildの環境変数から読み込まれます。

---

### 4.2 認証の仕組み

```typescript
// main.tsx
Amplify.configure(awsConfig); // AmplifyにCognitoの設定を渡す

// App.tsx
<Authenticator>
  {({ signOut, user }) => (
    <div>
      <header>
        <span>ようこそ {user?.username}</span>
        <button onClick={signOut}>ログアウト</button>
      </header>
      <main>
        <UsersPage />
      </main>
    </div>
  )}
</Authenticator>
```

#### 動く仕組み
1. `Amplify.configure` でCognitoのユーザープールに接続する設定をAmplifyに渡す
2. `<Authenticator>` コンポーネントがログイン状態を管理する
3. 未ログインの場合はCognitoのログイン画面を表示する
4. ログイン成功後はCognitoがJWTトークン（IDトークン）を発行する
5. トークンはAmplifyが自動でメモリに保持する

---

### 4.3 APIへのトークン送信

```typescript
// api/userApi.ts
const getHeaders = async () => {
  const session = await fetchAuthSession();  // Amplifyからセッション情報を取得
  const token = session.tokens?.idToken?.toString(); // IDトークンを取り出す

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, // APIリクエストのヘッダーに付与
  };
};
```

#### 動く仕組み
1. `fetchAuthSession` でAmplifyが保持しているCognitoのセッションを取得する
2. セッションからIDトークンを取り出す
3. `Authorization: Bearer {トークン}` としてAPIリクエストのヘッダーに付与する
4. API Gateway側でCognito Authorizerがトークンを検証する
5. 検証OKの場合のみLambdaにリクエストが転送される

---

## 5. API呼び出し

```typescript
// api/userApi.ts
const API_URL = import.meta.env.VITE_API_URL; // API GatewayのURL

// ユーザー一覧取得
export const getUsers = async () => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users`, { headers });
  if (!res.ok) throw new Error("ユーザー一覧の取得に失敗しました");
  return res.json();
};

// ユーザー登録
export const createUser = async (name: string, email: string) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("ユーザーの登録に失敗しました");
  return res.json();
};

// ユーザー削除
export const deleteUser = async (id: string) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("ユーザーの削除に失敗しました");
  return res.json();
};
```

#### 動く仕組み
- `VITE_API_URL` にAPI GatewayのURLを設定することで、フロントエンドがどのAPIを呼び出すかを環境変数で切り替えられる
- 全てのリクエストに `Authorization` ヘッダーを付与することでAPI Gatewayの認証を通過する

---

## 6. CloudFront + S3による配信

### 6.1 構成

```
ブラウザ
  ↓ https://xxxx.cloudfront.net
CloudFront（ディストリビューション）
  ↓ OAC（Origin Access Control）経由
S3バケット（user-management-frontend）
  └── index.html
  └── assets/
      ├── index-xxx.js
      └── index-xxx.css
```

### 6.2 OACの役割

S3バケットはパブリックアクセスを全てブロックしています。CloudFrontのOACを使うことで、CloudFront経由のアクセスのみS3に届くようにしています。

```json
// S3バケットポリシー
{
  "Effect": "Allow",
  "Principal": {
    "Service": "cloudfront.amazonaws.com"
  },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::user-management-frontend/*",
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "arn:aws:cloudfront::xxx:distribution/xxx"
    }
  }
}
```

#### 動く仕組み
1. ブラウザがCloudFrontのドメインにアクセスする
2. CloudFrontがS3からファイルを取得してキャッシュする
3. 2回目以降はCloudFrontのキャッシュからファイルを返す（高速）
4. S3への直接アクセスはバケットポリシーで拒否される

### 6.3 SPAのルーティング設定

ReactはSPA（シングルページアプリケーション）のためブラウザ側でルーティングを処理します。S3に存在しないパスへのアクセスはCloudFrontが `index.html` にリダイレクトする設定にしています。

| エラーコード | レスポンスページ | 理由 |
|------|------|------|
| 403 | /index.html | S3がファイルなしの場合403を返すことがある |
| 404 | /index.html | 存在しないパスへのアクセスをReactに委ねる |

---

## 7. CI/CDパイプライン

### 7.1 構成

```
GitHubへのプッシュ（frontend/**の変更）
  ↓ トリガー
CodePipeline（user-management-pipeline-frontend）
  ↓
CodeBuild（user-management-build-frontend）
  ├── npm ci
  ├── npm test（Vitestでテスト実行）
  ├── npm run build（Viteでビルド）
  ├── aws s3 sync dist/ s3://user-management-frontend --delete
  └── aws cloudfront create-invalidation --paths "/*"
```

### 7.2 buildspec-frontend.yml

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - cd frontend
      - npm ci

  build:
    commands:
      - npm test
      - npm run build

  post_build:
    commands:
      - aws s3 sync dist/ s3://user-management-frontend --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
```

#### 動く仕組み
1. `frontend/**` 以下のファイルが変更されてmainブランチにプッシュされると自動でパイプラインが起動する
2. `npm test` でVitestが実行される。テストが失敗するとビルドもデプロイも実行されない
3. `npm run build` でViteがTypeScriptをJavaScriptにコンパイルして `dist/` を生成する
4. `aws s3 sync` で `dist/` の中身をS3に同期する。`--delete` オプションで古いファイルを自動削除する
5. CloudFrontのキャッシュを無効化して最新のファイルが配信されるようにする

### 7.3 CodeBuildの環境変数

| キー | 用途 |
|------|------|
| `VITE_API_URL` | API GatewayのURL |
| `VITE_USER_POOL_ID` | CognitoユーザープールID |
| `VITE_USER_POOL_CLIENT_ID` | CognitoアプリクライアントID |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFrontのディストリビューションID |

---

## 8. テスト

### 8.1 テスト構成

```
Vitest + Testing Library
  ├── userApi.test.ts   ← API呼び出しのユニットテスト
  └── UsersPage.test.tsx ← コンポーネントのテスト
```

### 8.2 モックの使い方

```typescript
// aws-amplify/authをモックしてテスト時にCognitoに接続しない
vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      idToken: { toString: () => "mock-token" },
    },
  }),
}));

// fetchをモックしてAPIリクエストを実際に送らない
const mockFetch = vi.fn();
global.fetch = mockFetch;
```

#### なぜモックを使うか
テスト時にCognitoやAPIに実際にアクセスすると、テストが遅くなりAWSのリソースにも依存してしまいます。モックを使うことでテストを高速かつ独立して実行できます。
