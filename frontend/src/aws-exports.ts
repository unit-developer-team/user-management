// src/aws-exports.ts
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId:  import.meta.env.VITE_USER_POOL_ID,        // ユーザープールID
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID, // アプリクライアントID
      region: "ap-northeast-1",
    }
  }
};

export default awsConfig;