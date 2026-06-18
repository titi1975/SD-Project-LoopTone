import type { InputHTMLAttributes } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string; // Nova propriedade opcional para capturar o erro específico do campo
};

export function FormInput({ label, id, error, ...props }: FormInputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="form-field" htmlFor={inputId} style={{ display: "grid", gap: "4px", position: "relative" }}>
      <span>{label}</span>
      <input 
        id={inputId} 
        {...props} 
        style={{
          // Se houver erro, sobrepõe a cor da borda com a variável de perigo (vermelho)
          borderColor: error ? "var(--danger, #ff583d)" : undefined,
          // Adiciona um brilho vermelho suave ao redor para chamar a atenção
          boxShadow: error ? "0 0 0 2px rgba(255, 88, 61, 0.1)" : undefined,
          ...props.style // Preserva outros estilos inline que possam ser passados
        }} 
      />
      
      {/* Renderização Condicional: Só exibe o texto se a string 'error' não estiver vazia */}
      {error && (
        <span style={{ color: "var(--danger, #ff583d)", fontSize: "0.78rem", fontWeight: 600, marginTop: "2px" }}>
          {error}
        </span>
      )}
    </label>
  );
}