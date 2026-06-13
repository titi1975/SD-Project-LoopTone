import { AudioWaveform } from "lucide-react";

type LoopToneLogoProps = {
  size?: "sm" | "lg";
};

export function LoopToneLogo({ size = "lg" }: LoopToneLogoProps) {
  const isLg = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isLg ? "12px" : "8px" }}>
      <span className="brand-mark" style={{
        width: isLg ? "42px" : "32px",
        height: isLg ? "42px" : "32px",
        borderRadius: isLg ? "12px" : "10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        background: "linear-gradient(135deg, var(--primary-2), var(--primary))",
        boxShadow: "0 10px 24px rgba(90, 34, 214, 0.28)",
        flexShrink: 0
      }}>
        <AudioWaveform size={isLg ? 22 : 16} />
      </span>
      <span className="looptone-logo" style={{ fontSize: isLg ? "26px" : "20px", margin: 0 }}>
        <span>Loop</span>Tone
      </span>
    </div>
  );
}
