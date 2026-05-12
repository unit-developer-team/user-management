// src/components/AuthenticatorBackground.tsx
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthenticatorBackground({ children }: Props) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Left brand panel */}
      <div
        style={{
          flex: "0 0 45%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            UM / System
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
            User Management
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
            チームの開発を<br />加速する基盤
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 280, margin: 0 }}>
            SPA + BFF + コンテナ構成による<br />モダンなAWS共通基盤
          </p>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 32 }}>
          {[["React 18", "Frontend"], ["ECS Fargate", "Backend"], ["DynamoDB", "Database"]].map(([name, role]) => (
            <div key={name}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>{name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            border: "0.5px solid #e0e0e0",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
        <p style={{ marginTop: 24, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#bbb" }}>
          © 2025 DISP Unit Project
        </p>
      </div>
    </div>
  );
}
