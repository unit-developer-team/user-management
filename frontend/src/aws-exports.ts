// src/aws-exports.ts
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "ap-northeast-1_HNp0vXOzs",        // ユーザープールID
      userPoolClientId: "3eicnvugve43fq407ucs3tg2m3", // アプリクライアントID
      region: "ap-northeast-1",
    }
  }
};

export default awsConfig;