// src/components/AuthenticatorBackground.tsx
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AuthenticatorBackground({ children }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/bg.avif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "1px",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
