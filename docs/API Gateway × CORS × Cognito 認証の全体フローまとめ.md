## 1. CORS の基本構造
ブラウザはクロスオリジンで「安全ではないリクエスト」を送る前に、
必ず OPTIONS（プリフライト）を送って安全性を確認する。

コード
ブラウザ → OPTIONS → API
ブラウザ ← CORS 許可レスポンス ← API
OPTIONS が成功したら、初めて本番の POST/GET が送られる。

## 2. OPTIONS の役割（プリフライト）
 OPTIONS は ブラウザが自動で送る “事前審査”。

✔ ブラウザが API に質問している内容：
 
  - この API にアクセスしていい？ 

  - Authorization ヘッダー送っていい？

  - Content-Type を application/json にしていい？

  - POST/GET を送っていい？
 
✔ OPTIONS の特徴

  - 認証情報（Authorization）は送られない
  
  - ブラウザが自動で送る
  
  - サーバーは CORS ヘッダーだけ返せばよい

  - 本番処理はしない
  
  - 認証を付けると絶対に失敗する

## 3. POST / GET の役割（本番処理）
OPTIONS が成功した後、
ブラウザは 本番のリクエスト（POST/GET） を送る。

ここで初めて Authorization ヘッダーが送られる：

コード
Authorization: Bearer <ID_TOKEN>
API Gateway の Cognito Authorizer が JWT を検証し、
成功すると Lambda に claims を渡す。

Lambda はこれを使う：

js
const userId = event.requestContext.authorizer?.claims?.sub;
## 4. なぜ OPTIONS に認証を付けてはいけないのか
理由は明確。

❌ ブラウザは OPTIONS にトークンを付けない
→ Authorizer が claims を作れない
→ API Gateway が 401 を返す
→ プリフライト失敗
→ POST/GET が送られない
→ CORS エラー発生

✔ OPTIONS は “認証なし” が絶対ルール
## 5. 統合レスポンス（Integration Response）とは？
API Gateway が バックエンドのレスポンスをどう整形して返すか を定義する場所。

OPTIONS（MOCK）の場合：

バックエンドは固定レスポンス（200）

統合レスポンスで CORS ヘッダーを付ける

例：

コード
Access-Control-Allow-Origin: '*'
Access-Control-Allow-Methods: 'GET,POST,OPTIONS'
Access-Control-Allow-Headers: 'Authorization,Content-Type,...'
これが正しく設定されていれば、
ブラウザは「OK、この API は安全」と判断して本番リクエストを送る。

## 6. 全体の流れ（図解）
コード
① ブラウザ
   ↓ OPTIONS（トークンなし）
② API Gateway（MOCK）
   → CORS ヘッダー返す
   → 認証なし
   ↑ OK

③ ブラウザ
   ↓ POST/GET（Authorization: Bearer <ID_TOKEN>）
④ API Gateway（Cognito Authorizer）
   → JWT を検証
   → claims.sub を Lambda に渡す

⑤ Lambda
   → event.requestContext.authorizer.claims.sub を使って処理
   → レスポンスに CORS を付けて返す
## 7. 正しい設定まとめ
✔ OPTIONS（プリフライト）
統合タイプ：MOCK

認可：なし

統合レスポンスで CORS ヘッダーを返す

✔ POST / GET（本番処理）
統合タイプ：Lambda Proxy

認可：Cognito User Pool Authorizer

Lambda のレスポンスにも CORS ヘッダーを付ける