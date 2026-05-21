import React, { useEffect, useState } from "react";
import { Authenticator, ThemeProvider, translations, useAuthenticator, type Theme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { I18n } from "aws-amplify/utils";
import UsersPage from "./pages/UsersPage";
import AuthenticatorBackground from "./components/AuthenticatorBackground";

I18n.putVocabularies(translations);
I18n.putVocabularies({
  ja: {
    "Sign In": "ログイン",
    "Sign in": "ログイン",
    "Enter your Email": "メールアドレスを入力してください",
    "Enter your Password": "パスワードを入力してください",
    "Create Account": "新規ユーザー登録",
  },
});
I18n.setLanguage("ja");

function Clock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" }}>
      {time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

const headerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: 52,
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  padding: "0 32px",
  background: "#fff",
  borderBottom: "0.5px solid #0a0a0a",
};

const logoStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#0a0a0a",
};

const navPillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  border: "0.5px solid #0a0a0a",
  borderRadius: 999,
  overflow: "hidden",
};

const navItemStyle: React.CSSProperties = {
  padding: "6px 20px",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#0a0a0a",
  background: "transparent",
  border: "none",
  cursor: "default",
  borderRight: "0.5px solid #0a0a0a",
};

const navItemActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  background: "#0a0a0a",
  color: "#fff",
  borderRight: "none",
};

const headerRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 24,
};

const clockStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.1em",
  color: "#555",
  fontVariantNumeric: "tabular-nums",
};

const footerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  background: "#0a0a0a",
  color: "#fff",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

const footerStatusStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const statusDotStyle: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "#fff",
  display: "inline-block",
  marginRight: 6,
};

function AppShell({ signOut, username, children }: { signOut?: () => void; username?: string; children: React.ReactNode }) {
  return (
    <>
      <header style={headerStyle}>
        <span style={logoStyle}>UM / System</span>
        <nav style={navPillStyle}>
          <span style={navItemActiveStyle}>Users</span>
          <span style={{ ...navItemStyle, borderRight: "none" }}>Settings</span>
        </nav>
        <div style={headerRightStyle}>
          <span style={clockStyle}><Clock /></span>
          {username && (
            <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#555" }}>{username}</span>
          )}
          {signOut && (
            <button
              onClick={signOut}
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: "transparent",
                border: "0.5px solid #0a0a0a",
                padding: "4px 12px",
                cursor: "pointer",
                color: "#0a0a0a",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main style={{ paddingTop: 52, paddingBottom: 32, minHeight: "100vh" }}>
        {children}
      </main>

      <footer style={footerStyle}>
        <div style={footerStatusStyle}>
          <span style={footerTextStyle}>
            <span style={statusDotStyle} />
            System Online
          </span>
          <span style={footerTextStyle}>Tokyo, JP</span>
        </div>
        <span style={footerTextStyle}>User Management System — v1.0</span>
        <span style={footerTextStyle}>© 2025</span>
      </footer>
    </>
  );
}

const authTheme: Theme = {
  name: "um-auth",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: "#eef2ff" },
          80: { value: "#6366F1" },
          90: { value: "#4F46E5" },
          100: { value: "#4338CA" },
        },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "0" },
          boxShadow: { value: "none" },
          backgroundColor: { value: "transparent" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: "#6366F1" },
          color: { value: "#fff" },
          borderColor: { value: "#6366F1" },
          borderRadius: { value: "10px" },
          _hover: {
            backgroundColor: { value: "#4F46E5" },
            borderColor: { value: "#4F46E5" },
          },
          _focus: {
            backgroundColor: { value: "#4F46E5" },
            borderColor: { value: "#4F46E5" },
          },
        },
        link: {
          color: { value: "#6366F1" },
          _hover: { color: { value: "#4F46E5" } },
        },
      },
      fieldcontrol: {
        borderColor: { value: "#e2e8f0" },
        borderRadius: { value: "10px" },
        boxShadow: { value: "0 1px 3px rgba(0,0,0,0.06)" },
        _focus: {
          borderColor: { value: "#6366F1" },
          boxShadow: { value: "0 0 0 3px rgba(99,102,241,0.15)" },
        },
      },
      tabs: {
        item: {
          color: { value: "#94a3b8" },
          _active: {
            color: { value: "#6366F1" },
            borderColor: { value: "#6366F1" },
          },
          _hover: { color: { value: "#6366F1" } },
        },
      },
    },
    fontSizes: {
      small: { value: "0.8rem" },
      medium: { value: "0.875rem" },
    },
    radii: {
      small: { value: "8px" },
      medium: { value: "10px" },
      large: { value: "12px" },
    },
  },
};

const authComponents = {
  SignIn: {
    Header() {
      return (
        <div style={{ padding: "32px 32px 0", textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 12c-5.33 0-8 2.686-8 4v2h16v-2c0-1.314-2.67-4-8-4z" fill="white"/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>
            UM / System
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>アカウントにサインイン</p>
        </div>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <div style={{ padding: "0 32px 28px", textAlign: "center" }}>
          <button
            onClick={toForgotPassword}
            style={{ fontSize: 12, color: "#6366F1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
          >
            パスワードをお忘れですか？
          </button>
        </div>
      );
    },
  },
};

function App() {
  return (
    <ThemeProvider theme={authTheme}>
      <Authenticator.Provider>
        <AuthenticatorContent />
      </Authenticator.Provider>
    </ThemeProvider>
  );
}

function AuthenticatorContent() {
  const { authStatus, signOut, user } = useAuthenticator((ctx) => [ctx.authStatus, ctx.signOut, ctx.user]);
  if (authStatus !== "authenticated") {
    return (
      <AuthenticatorBackground>
        <Authenticator components={authComponents} />
      </AuthenticatorBackground>
    );
  }
  return (
    <AppShell signOut={signOut} username={user?.username}>
      <UsersPage />
    </AppShell>
  );
}

export default App;
