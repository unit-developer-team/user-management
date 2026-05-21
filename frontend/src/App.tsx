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

const SIDEBAR_W = 220;

const sidebarNavItems = [
  { label: "Users", icon: "👥", active: true },
  { label: "Settings", icon: "⚙️", active: false },
];

function AppShell({ signOut, username, children }: { signOut?: () => void; username?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.5)",
              fontSize: 16,
            }}>👤</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>UserHub</div>
              <div style={{ fontSize: 10, color: "rgba(165,180,252,0.6)", letterSpacing: "0.04em" }}>Management</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {sidebarNavItems.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, marginBottom: 4,
              background: item.active ? "rgba(99,102,241,0.25)" : "transparent",
              borderLeft: item.active ? "3px solid #818cf8" : "3px solid transparent",
              cursor: "default",
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? "#e0e7ff" : "rgba(255,255,255,0.45)", letterSpacing: "0.01em" }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: "16px 16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #34d399, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff",
            }}>{username ? username[0].toUpperCase() : "U"}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e0e7ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{username ?? "User"}</div>
              <div style={{ fontSize: 10, color: "rgba(165,180,252,0.5)" }}>Administrator</div>
            </div>
          </div>
          {signOut && (
            <button onClick={signOut} style={{
              width: "100%", padding: "8px", borderRadius: 8,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", fontSize: 12, fontWeight: 500, cursor: "pointer",
              letterSpacing: "0.02em",
            }}>Sign Out</button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header style={{
          height: 60, background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e1b4b", letterSpacing: "-0.02em" }}>User Management</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Manage your team members</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontVariantNumeric: "tabular-nums" }}><Clock /></div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          </div>
        </header>
        <main style={{ flex: 1, padding: "32px" }}>{children}</main>
      </div>
    </div>
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
