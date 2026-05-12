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
          10: { value: "#f5f5f5" },
          80: { value: "#0a0a0a" },
          90: { value: "#222" },
          100: { value: "#000" },
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
          backgroundColor: { value: "#0a0a0a" },
          color: { value: "#fff" },
          borderColor: { value: "#0a0a0a" },
          _hover: {
            backgroundColor: { value: "#333" },
            borderColor: { value: "#333" },
          },
          _focus: {
            backgroundColor: { value: "#333" },
            borderColor: { value: "#333" },
          },
        },
        link: {
          color: { value: "#0a0a0a" },
          _hover: { color: { value: "#555" } },
        },
      },
      fieldcontrol: {
        borderColor: { value: "#d0d0d0" },
        _focus: {
          borderColor: { value: "#0a0a0a" },
          boxShadow: { value: "0 0 0 1px #0a0a0a" },
        },
      },
      tabs: {
        item: {
          color: { value: "#999" },
          _active: {
            color: { value: "#0a0a0a" },
            borderColor: { value: "#0a0a0a" },
          },
          _hover: { color: { value: "#0a0a0a" } },
        },
      },
    },
    fontSizes: {
      small: { value: "0.8rem" },
      medium: { value: "0.875rem" },
    },
    radii: {
      small: { value: "4px" },
      medium: { value: "6px" },
      large: { value: "8px" },
    },
  },
};

const authComponents = {
  SignIn: {
    Header() {
      return (
        <div style={{ padding: "32px 32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#0a0a0a", marginBottom: 8 }}>
            UM / System
          </div>
          <div style={{ width: 24, height: 1, background: "#0a0a0a", margin: "0 auto 20px" }} />
          <p style={{ fontSize: 13, color: "#555", letterSpacing: "0.02em" }}>アカウントにサインイン</p>
        </div>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <div style={{ padding: "0 32px 28px", textAlign: "center" }}>
          <button
            onClick={toForgotPassword}
            style={{ fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
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
