import { Check } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

type SuccessModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm: () => void;
};

export function SuccessModal({ isOpen, title, message, buttonText = "Continuar", onConfirm }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        className="equipment-modal" 
        style={{ maxWidth: "400px", textAlign: "center", padding: "40px 30px", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%", background: "var(--surface-soft)",
          color: "var(--primary)", border: "3px solid var(--primary-2)", display: "flex", 
          alignItems: "center", justifyContent: "center", marginBottom: "16px"
        }}>
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 12px" }}>
          {title}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 24px" }}>
          {message}
        </p>
        <PrimaryButton onClick={onConfirm} style={{ width: "100%" }}>
          {buttonText}
        </PrimaryButton>
      </div>
    </div>
  );
}