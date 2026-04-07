// src/components/AuthenticatorBackground.tsx
export default function AuthenticatorBackground({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/bg.avif')", // ← 好きな背景画像に変更
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      {/* ガラスモーフィズムのカード */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "1px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
