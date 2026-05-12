// src/components/AuthenticatorBackground.tsx
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthenticatorBackground({ children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 500,
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: "8px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
        © 2026 DISP Unit Project
      </p>
    </div>
  );
}
