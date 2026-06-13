import type { PropsWithChildren } from "react";
import { LoopToneLogo } from "../../../../commons/components/LoopToneLogo";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className="auth-shell">
      <LoopToneLogo size="sm" />
      {children}
    </main>
  );
}
