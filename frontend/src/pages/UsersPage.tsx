// src/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../api/userApi";
import "../index.css";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const s = {
  page: {
    maxWidth: 780,
    margin: "0 auto",
    padding: "52px 24px",
    textAlign: "left" as const,
  },
  headingWrap: { marginBottom: 36 },
  heading: {
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: "-0.8px",
    margin: 0,
    color: "var(--text-h)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headingSub: {
    fontSize: 13,
    color: "var(--text)",
    marginTop: 6,
    letterSpacing: 0,
  },
  card: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: 14,
    padding: "28px 32px",
    marginBottom: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 18,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  row: { display: "flex", gap: 10, flexWrap: "wrap" as const },
  input: {
    flex: 1,
    minWidth: 160,
    padding: "11px 14px",
    fontSize: 15,
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    background: "var(--bg)",
    color: "var(--text-h)",
    outline: "none",
  },
  btnPrimary: {
    padding: "11px 24px",
    fontSize: 15,
    fontWeight: 700,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  btnDanger: {
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 500,
    background: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: 8,
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 15 },
  th: {
    textAlign: "left" as const,
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-h)",
    verticalAlign: "middle" as const,
  },
  tdMuted: {
    padding: "14px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: 12,
    fontFamily: "var(--mono)",
    verticalAlign: "middle" as const,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 99,
    background: "var(--accent-bg)",
    color: "var(--accent)",
    fontSize: 12,
    fontWeight: 600,
  },
  error: {
    padding: "12px 16px",
    borderRadius: 10,
    background: "rgba(239,68,68,0.08)",
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid var(--border)",
    borderTop: "2px solid var(--accent)",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  empty: {
    color: "var(--text)",
    fontSize: 15,
    padding: "24px 0",
    textAlign: "center" as const,
  },
};

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      await deleteUser(id);
      await fetchUsers();
    } catch {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.heading}>ユーザー管理</h1>

      {error && <div style={s.error}>{error}</div>}

      {/* 登録フォーム */}
      <div style={s.card}>
        <p style={s.cardTitle}>ユーザー登録</p>
        <div style={s.row}>
          <input
            style={s.input}
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={s.input}
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button style={s.btnPrimary} onClick={handleCreate} disabled={loading}>
            登録
          </button>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div style={s.card}>
        <p style={s.cardTitle}>ユーザー一覧{loading && <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 10, color: "var(--text)" }}>読み込み中…</span>}</p>
        {users.length === 0 ? (
          <p style={s.empty}>ユーザーがいません</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["ID", "名前", "メールアドレス", "作成日時", ""].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={s.tdMuted}>{user.id}</td>
                  <td style={s.td}>{user.name}</td>
                  <td style={s.td}>{user.email}</td>
                  <td style={s.tdMuted}>{user.createdAt}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <button style={s.btnDanger} onClick={() => handleDelete(user.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UsersPage;