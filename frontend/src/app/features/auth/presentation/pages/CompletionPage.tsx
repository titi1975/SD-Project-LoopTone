import { useNavigate } from "react-router";
import { PrimaryButton } from "../../../../commons/components/PrimaryButton";
import { AuthShell } from "../components/AuthShell";
import { AuthStepper } from "../components/AuthStepper";

export function CompletionPage() {
  const navigate = useNavigate();

  return (
    <AuthShell>
      <AuthStepper activeStep={3} />
      <section className="completion-card">
        <div className="completion-check" aria-hidden="true">
          ✓
        </div>
        <h1>Concluído!</h1>
        <PrimaryButton className="completion-action" type="button" onClick={() => navigate("/setup")}>
          Produzir Primeiro Timbre
        </PrimaryButton>
      </section>
    </AuthShell>
  );
}
