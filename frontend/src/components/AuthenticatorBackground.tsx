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
        backgroundImage: "url('/7f30c12b-5d08-41e3-b6c7-b4bdb75a6425.png')",
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
          background: "rgba(255,255,255,1)",
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
