# DISP-Unit-Project

DISPのユニット活動での開発の基盤となるシステム・インフラを構築する。

## ✨ 主な機能

- **機能1:** 高速で安全なフロントエンド配信
  - S3 + CloudFront による グローバル CDN 配信で高速レスポンス
  - HTTPS 化・キャッシュ最適化により セキュアかつ高パフォーマンス
  - API Gateway 経由でバックエンドと疎結合に連携できる構成

- **機能2:** スケーラブルなバックエンドで負荷に強いアプリを実現
  - ECS による コンテナ化されたアプリケーションの自動スケール
  - DynamoDB による サーバーレスで高可用なデータストア
  - API Gateway との組み合わせで 完全マネージドな API 基盤を構築
  
- **機能3:** CI/CD による自動デプロイで開発効率が向上
  - Git push → 自動ビルド → 自動デプロイの フルパイプラインを構築
  - ヒューマンエラーを減らし、安定したリリースが可能
  - インフラとアプリの更新が高速化し、開発サイクルが短縮
  - 
## 🚀 使い方・インストール方法
 

## 🛠️ 使用技術

- フロントエンド
  - HTML, CSS, JavaScript
  - React
  - Vite
  - S3 
  - CloudFront 
  - API Gateway 
  
- バックエンド
  - ECS (Fargate) 
  - Docker 
  - DynamoDB;
  - ALB
  - lambda

- インフラ・運用
  - IAM
  - VPC / Subnet / Security Group 
  - CloudWatch 

## 🧱 アーキテクチャ図

![architecture](./docs/architecture.png)

## ⛪システム構成のポイント(なぜこの構成なのか)

1. 高速で安全なフロントエンド配信を実現するため
  - S3 + CloudFront は静的サイト配信のベストプラクティス
  - グローバル CDN により、どの地域からでも高速アクセスが可能
  - HTTPS・キャッシュ制御・WAF などのセキュリティ対策が容易
  - バックエンドとは API Gateway 経由で疎結合にでき、フロントと API の独立性が高い

2. スケーラブルで運用負荷の低いバックエンドを構築するため
  - ECS(Fargate) により、サーバー管理不要でコンテナを実行
  - トラフィックに応じて自動スケールし、ピーク時も安定
  - DynamoDB はフルマネージドで、スケール・バックアップ・可用性を自動で担保
  - API Gateway + ALB により、API の入口とコンテナの負荷分散を分離できる
  
3. CI/CD による自動化で開発効率と品質を向上させるため
  - CodePipelineで push → build → deploy を自動化
  - ECR にイメージを保存し、ECS に自動デプロイ
  - CloudFront のキャッシュ無効化も自動化可能
  - 手動作業を減らし、ヒューマンエラーを防止
  
4. 拡張性が高く、将来の機能追加に強い構成にするため
  - フロントとバックエンドが完全に分離（SPA + API）
  - 新しい API を追加しても既存構成に影響しにくい
  - マイクロサービス化にも移行しやすい 
  
## 🛠️ 環境変数・設定ファイル
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
   
## API 仕様（OpenAPI / エンドポイント一覧）

概要

認証方式

エンドポイント

リクエスト

レスポンス

エラーハンドリング


## デプロイ方法