# 認証付きReactアプリをAWSで公開

## 手順1. Amazon Cognitoの作成
- ユーザープール(ユーザー情報を保存・管理する場所)作成
- アプリクライアント(アプリがログインするための設定)作成
  
---

## 手順2. フロント：React + Amplifyの作成
- npm create vite@latest で React プロジェクト作成
  - プロジェクト名：任意　　
  - フレームワーク：React
  - バリアント：JavaScript or TypeScript
  - プロジェクトに移動して依存をインストール npm install
  - npm run devでローカル環境でReactが動くようになる
- npm install aws-amplify @aws-amplify/ui-reactでAmplify を入れる
  - Amplify（AWS の認証・API・ストレージを、数行のコードで使えるようにする開発者向けフレームワーク）
  - App.tsxを修正する
  
## Amplify 認証付き React コンポーネント例(App.tsx)

```tsx
import { Authenticator } from '@aws-amplify/ui-react';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
```
---

## 手順3. ビルド
- dist/ フォルダが生成される　本番用ファイル
- API Gateway → Lambda（BFF）間は AWS 内部通信。

---

## 手順4. S3 バケット作成
- npm run buildコマンド実行
- dist/ フォルダが生成される
- dist/ の中身をアップロード
  
---

## 手順5. Amazon CloudFront
- オリジン：S3 バケット
- デフォルトルート：index.html
- URLアクセス → Reactアプリ表示

---
