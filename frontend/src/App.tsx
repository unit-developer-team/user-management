import React from "react";
import { Authenticator, translations } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { I18n } from "aws-amplify/utils";
import UsersPage from "./pages/UsersPage";
import AuthenticatorBackground from "./components/AuthenticatorBackground";

// Amplify UI の翻訳を読み込む
I18n.putVocabularies(translations);

// 日本語を追加
I18n.putVocabularies({
  ja: {
    'Sign In': 'ログイン',
    'Sign in': 'ログイン',
    'Enter your Email': 'メールアドレスを入力してください',
    'Enter your Password': 'パスワードを入力してください',
    'Create Account': '新規ユーザー登録',
  }
});

// 言語を日本語に設定
I18n.setLanguage('ja');

const appStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundImage: "url('/bg.avif')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  display: "flex",
  flexDirection: "column",
};

const navStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 40px",
  height: 64,
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
};

const navLogoStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#fff",
  letterSpacing: "-0.5px",
};

const navRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const navUserStyle: React.CSSProperties = {
  fontSize: 14,
  color: "rgba(255,255,255,0.85)",
};

const signOutBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  fontSize: 14,
  fontWeight: 600,
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 8,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
};

const mainStyle: React.CSSProperties = {
  paddingTop: 64,
};

function App() {
  return (
    <div style={appStyle}>
      <Authenticator>
        {({ signOut, user }) => (
          <>
            <nav style={navStyle}>
              <span style={navLogoStyle}>ユーザー管理</span>
              <div style={navRightStyle}>
                <span style={navUserStyle}>{user?.username}</span>
                <button style={signOutBtnStyle} onClick={signOut}>ログアウト</button>
              </div>
            </nav>
            <main style={mainStyle}>
              <UsersPage />
            </main>
          </>
        )}
      </Authenticator>
    </div>
  );
}

export default App;