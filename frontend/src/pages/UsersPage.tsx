import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../api/userApi";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const AVATAR_COLORS = [
  ["#6366f1", "#4f46e5"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"],
  ["#8b5cf6", "#7c3aed"],
  ["#06b6d4", "#0891b2"],
];

function avatarGradient(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return `linear-gradient(135deg, ${AVATAR_COLORS[i][0]}, ${AVATAR_COLORS[i][1]})`;
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      borderTop: `3px solid ${color}`,
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.04em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.03em" }}>{value}</div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch {
      setError("ユーザー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!name || !email) { setError("名前とメールアドレスを入力してください"); return; }
    setError(null);
    try {
      setLoading(true);
      await createUser(name, email);
      setName(""); setEmail("");
      await fetchUsers();
    } catch {
      setError("ユーザーの登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteUser(id);
      await fetchUsers();
    } catch {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Users" value={users.length} color="#6366f1" />
        <StatCard label="Active Today" value={users.length} color="#10b981" />
        <StatCard label="This Month" value={users.filter(u => u.createdAt?.startsWith(new Date().toISOString().slice(0,7))).length} color="#f59e0b" />
      </div>

<<<<<<< Updated upstream
        {/* ページタイトル */}
        <div style={{ position: "relative", borderBottom: "0.5px solid #0a0a0a", paddingBottom: 24, marginBottom: 64, overflow: "hidden" }}>
          {/* 背景グラフィック */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: -20,
              left: -10,
              fontSize: "clamp(80px, 18vw, 220px)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "transparent",
              WebkitTextStroke: "0.5px #e0e0e0",
              userSelect: "none",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              lineHeight: 1,
            }}
          >
            USERS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", position: "relative" }}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1, color: "#0a0a0a" }}>
              User<br />Management
            </h1>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: "#0a0a0a" }}>{String(users.length).padStart(2, "0")}</div>
            </div>
          </div>
        </div>
=======
      {/* Register form card */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px", marginBottom: 28,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b", marginBottom: 4 }}>新規ユーザー登録</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Add a new member to your team</div>
>>>>>>> Stashed changes

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>👤</span>
            <input
              type="text"
              placeholder="フルネーム"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px 12px 40px", borderRadius: 10,
                border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b",
                outline: "none", boxSizing: "border-box", background: "#f8fafc",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>✉️</span>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px 12px 40px", borderRadius: 10,
                border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b",
                outline: "none", boxSizing: "border-box", background: "#f8fafc",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#6366f1")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: loading ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
            }}
          >
            {loading ? "登録中..." : "＋ 登録"}
          </button>
        </div>
      </div>

      {/* Users list card */}
      <div style={{
        background: "#fff", borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr auto",
          padding: "14px 24px", background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          <span>ユーザー</span>
          <span>メールアドレス</span>
          <span>登録日</span>
          <span>操作</span>
        </div>

        {loading && users.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            読み込み中...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 4 }}>ユーザーがいません</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>上のフォームから最初のユーザーを登録してください</div>
          </div>
        ) : (
          users.map((user, i) => (
            <div
              key={user.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr auto",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < users.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: avatarGradient(user.name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}>
                  {initials(user.name)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{user.name}</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2,
                    background: "#dcfce7", borderRadius: 999, padding: "1px 8px",
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 500 }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: 13, color: "#64748b" }}>{user.email}</div>

              {/* Date */}
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>
                {user.createdAt ? user.createdAt.slice(0, 10) : "—"}
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid #fecaca",
                  background: deletingId === user.id ? "#fef2f2" : "transparent",
                  color: "#ef4444", fontSize: 12, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget.style.background = "#fef2f2"); }}
                onMouseLeave={e => { (e.currentTarget.style.background = "transparent"); }}
              >
                {deletingId === user.id ? "削除中..." : "削除"}
              </button>
            </div>
          ))
        )}

        {/* Footer */}
        {users.length > 0 && (
          <div style={{
            padding: "12px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0",
            fontSize: 12, color: "#94a3b8",
          }}>
            {users.length} 件のユーザー
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
