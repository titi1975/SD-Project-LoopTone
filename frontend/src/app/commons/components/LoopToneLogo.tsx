type LoopToneLogoProps = {
  size?: "sm" | "lg";
};

export function LoopToneLogo({ size = "lg" }: LoopToneLogoProps) {
  return (
    <span className={`looptone-logo looptone-logo-${size}`}>
      <span>Loop</span>Tone
    </span>
  );
}
