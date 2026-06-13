type AuthStepperProps = {
  activeStep: 1 | 2 | 3;
};

export function AuthStepper({ activeStep }: AuthStepperProps) {
  return (
    <div className="auth-stepper" aria-label={`Etapa ${activeStep} de 3`}>
      {[1, 2, 3].map((step) => {
        const checked = step <= activeStep;

        return (
          <div className="step-item" key={step}>
            <span className={`step-dot ${checked ? "is-active" : ""}`}>{checked ? "✓" : ""}</span>
            {step < 3 && <span className={`step-line ${step < activeStep ? "is-complete" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}
