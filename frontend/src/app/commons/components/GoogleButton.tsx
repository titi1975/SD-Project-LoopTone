import type { ButtonHTMLAttributes } from "react";

export function GoogleButton({ children = "Conectar com Google", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="google-button" type="button" {...props}>
      <span className="google-mark">G</span>
      {children}
    </button>
  );
}
