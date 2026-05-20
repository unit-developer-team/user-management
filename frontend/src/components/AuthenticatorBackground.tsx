// src/components/AuthenticatorBackground.tsx
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthenticatorBackground({ children }: Props) {
  return (
    <div style={{
      height: "100vh",
      background: "linear-gradient(160deg, #060B18 0%, #0D1B3E 50%, #0F172A 100%)",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "10%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* ── Top-right env info ── */}
      <div style={{
        position: "fixed", top: 24, right: 28,
        display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "ui-monospace, 'Courier New', monospace",
        pointerEvents: "none",
      }}>
        {[
          ["REGION", "ap-northeast-1"],
          ["STATUS", "ACTIVE"],
          ["BUILD",  "v1.0.2"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)" }}>{k}:</span>
            <span style={{ fontSize: 9, letterSpacing: "0.08em", color: "rgba(165,180,252,0.35)" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom-right decorative cluster ── */}
      <div style={{ position: "fixed", bottom: 0, right: 0, width: 340, height: 340, pointerEvents: "none" }}>
        {/* Circular gradient */}
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)",
        }} />
        {/* Glow ring */}
        <div style={{
          position: "absolute", bottom: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          border: "1px solid rgba(59,130,246,0.15)",
          boxShadow: "0 0 32px rgba(59,130,246,0.2), inset 0 0 32px rgba(59,130,246,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          width: 100, height: 100, borderRadius: "50%",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 0 20px rgba(99,102,241,0.25)",
        }} />
        {/* Particles */}
        {[
          { bottom: 120, right: 60,  size: 2.5, opacity: 0.6, color: "#60A5FA" },
          { bottom: 80,  right: 140, size: 2,   opacity: 0.4, color: "#818CF8" },
          { bottom: 180, right: 100, size: 1.5, opacity: 0.35, color: "#93C5FD" },
          { bottom: 60,  right: 200, size: 2,   opacity: 0.3, color: "#6366F1" },
          { bottom: 200, right: 50,  size: 1.5, opacity: 0.25, color: "#A78BFA" },
          { bottom: 140, right: 180, size: 1,   opacity: 0.2, color: "#60A5FA" },
          { bottom: 40,  right: 90,  size: 3,   opacity: 0.15, color: "#3B82F6" },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute", bottom: p.bottom, right: p.right,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: p.opacity,
          }} />
        ))}
      </div>

      {/* ── Two-column container ── */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "48px 6vw",
        gap: "4vw",
        boxSizing: "border-box",
      }}>

      {/* ── Left brand ── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 40,
        alignSelf: "stretch",
        paddingTop: 52,
        paddingBottom: 52,
      }}>
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            boxShadow: "0 0 16px rgba(99,102,241,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
            DISP Unit Project
          </span>
        </div>

        {/* DISP UNIT typography */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 24, height: 1, background: "rgba(99,102,241,0.6)" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#6366F1", boxShadow: "0 0 8px #6366F1" }} />
            <div style={{ width: 48, height: 1, background: "rgba(99,102,241,0.3)" }} />
            <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(99,102,241,0.7)", textTransform: "uppercase" }}>v1.0</span>
          </div>

          {/* DISP */}
          <div style={{ position: "relative", lineHeight: 1 }}>
            <div style={{
              position: "absolute", top: 3, left: 3,
              fontSize: "clamp(80px, 11vw, 140px)", fontWeight: 900, letterSpacing: "-0.04em",
              color: "transparent", WebkitTextStroke: "1px rgba(99,102,241,0.12)",
              userSelect: "none",
            }}>DISP</div>
            <div style={{
              fontSize: "clamp(80px, 11vw, 140px)", fontWeight: 900, letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #E0E7FF 0%, #A5B4FC 40%, #818CF8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 24px rgba(99,102,241,0.4))",
              lineHeight: 1,
            }}>DISP</div>
          </div>

          {/* UNIT */}
          <div style={{ lineHeight: 1, marginTop: 2 }}>
            <div style={{
              fontSize: "clamp(80px, 11vw, 140px)", fontWeight: 900, letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #7C3AED 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 24px rgba(139,92,246,0.35))",
              lineHeight: 1,
            }}>UNIT</div>
          </div>

          {/* Underline glow */}
          <div style={{
            marginTop: 12, height: 2, width: 160,
            background: "linear-gradient(90deg, rgba(99,102,241,0.8), rgba(139,92,246,0.6), transparent)",
            borderRadius: 2, boxShadow: "0 0 12px rgba(99,102,241,0.4)",
          }} />

          <p style={{ marginTop: 20, fontSize: 15, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", lineHeight: 1.7, maxWidth: 400, margin: "20px 0 0" }}>
            AWS共通基盤 — トライアル開発を迅速に<br />開始するためのプラットフォーム
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            {["React 18", "ECS Fargate", "DynamoDB", "Cognito"].map((t) => (
              <span key={t} style={{
                fontSize: 13, fontWeight: 500, letterSpacing: "0.06em",
                color: "rgba(165,180,252,0.7)",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 6, padding: "4px 10px",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            System Online — Tokyo, JP
          </span>
        </div>
      </div>

      {/* ── Right: login card ── */}
      <div style={{ flex: "0 0 auto", width: "min(480px, 44vw)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "100%",
          maxWidth: "100%",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
          padding: "8px",
        }}>
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden" }}>
            {children}
          </div>
        </div>
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
          © 2025 DISP Unit Project
        </p>
      </div>

      </div>{/* end two-column container */}
    </div>
  );
}
