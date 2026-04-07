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

function App() {
  return (
    <AuthenticatorBackground>
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
    </AuthenticatorBackground>
  );
}

export default App;