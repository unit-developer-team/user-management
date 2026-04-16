import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../api/userApi";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
    <div style={{ position: "relative", minHeight: "calc(100vh - 84px)", overflow: "hidden", backgroundImage: "url('/7f30c12b-5d08-41e3-b6c7-b4bdb75a6425.png')", backgroundSize: "cover", backgroundPosition: "center" }}>

      {/* コンテンツ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "64px 40px" }}>

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
              User<br />Management v2
            </h1>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: "#0a0a0a" }}>{String(users.length).padStart(2, "0")}</div>
            </div>
          </div>
        </div>

        {/* エラー */}
        {error && (
          <div style={{
            borderLeft: "2px solid #0a0a0a",
            paddingLeft: 16,
            marginBottom: 40,
            fontSize: 12,
            letterSpacing: "0.05em",
            color: "#0a0a0a",
          }}>
            {error}
          </div>
        )}

        {/* 登録フォーム */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#999", marginBottom: 20 }}>
            — Register New User
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 0, border: "0.5px solid #0a0a0a" }}>
            <input
              type="text"
              placeholder="NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "18px 20px",
                fontSize: 12,
                letterSpacing: "0.1em",
                border: "none",
                borderRight: "0.5px solid #0a0a0a",
                outline: "none",
                background: "transparent",
                color: "#0a0a0a",
              }}
            />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "18px 20px",
                fontSize: 12,
                letterSpacing: "0.1em",
                border: "none",
                borderRight: "0.5px solid #0a0a0a",
                outline: "none",
                background: "transparent",
                color: "#0a0a0a",
              }}
            />
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                padding: "18px 32px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: loading ? "#f5f5f5" : "#0a0a0a",
                color: loading ? "#999" : "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : "Register"}
            </button>
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "#999" }}>
              — Registered Users
            </div>
            {loading && (
              <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999" }}>
                Loading...
              </div>
            )}
          </div>

          {users.length === 0 ? (
            <div style={{
              border: "0.5px solid #e8e8e8",
              padding: "80px 40px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#ccc" }}>
                No Users Registered
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0, border: "0.5px solid #0a0a0a" }}>
              {users.map((user, i) => (
                <div
                  key={user.id}
                  style={{
                    padding: "28px 28px",
                    borderRight: (i + 1) % 3 === 0 ? "none" : "0.5px solid #0a0a0a",
                    borderBottom: "0.5px solid #0a0a0a",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* アバター + 名前 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      border: "0.5px solid #0a0a0a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      color: "#0a0a0a",
                    }}>
                      {initials(user.name)}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#999", letterSpacing: "0.03em", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* メタ情報 + 削除 */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "0.5px solid #e8e8e8", paddingTop: 12 }}>
                    <div style={{ fontSize: 9, color: "#bbb", letterSpacing: "0.05em", fontFamily: "var(--mono)" }}>
                      {user.createdAt}
                    </div>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        background: "transparent",
                        border: "0.5px solid #0a0a0a",
                        padding: "4px 10px",
                        cursor: "pointer",
                        color: "#0a0a0a",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default UsersPage;
