import { X } from "lucide-react";

type LegalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
};

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const isTerms = type === "terms";

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="equipment-modal" style={{ maxWidth: "600px", width: "min(100% - 32px, 600px)", position: "relative", maxHeight: "80vh", display: "flex", flexDirection: "column", padding: "30px" }}>
        
        {/* Botão de Fechar "X" */}
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <h2 style={{ color: "var(--primary)", fontSize: "1.6rem", fontWeight: 800, marginBottom: "16px", paddingRight: "30px" }}>
          {isTerms ? "Termos de Uso e Condições" : "Políticas de Privacidade"}
        </h2>

        {/* Corpo de texto com scroll vertical */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: "10px", textAlign: "left", fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
          {isTerms ? (
            <>
              <h3>1. Aceitação dos Termos</h3>
              <p>Ao acessar e utilizar a plataforma LoopTone, você concorda em cumprir e se submeter integralmente a estes Termos de Uso. O uso do nosso laboratório de análise de timbres digitais e processamento espectral é estritamente pessoal e intransferível.</p>
              <h3>2. Limitações de Créditos e Uso da IA</h3>
              <p>O LoopTone oferece um modelo de processamento distribuído por demanda. Cada setup cadastrado possui um limite diário estrito de créditos para chamadas de IA generativa, renovados dinamicamente a cada 24 horas. Tentativas de burlar o sistema de cotas por scripts automatizados resultarão em suspensão imediata da conta.</p>
              <h3>3. Propriedade Intelectual de Arquivos de Áudio</h3>
              <p>O usuário retém todos os direitos autorais sobre as gravações e arquivos de áudio enviados para análise. O LoopTone utiliza esses dados temporariamente apenas para calcular o Spectral Centroid, Flatness e processar o refinamento via LLM, descartando os arquivos temporários logo em seguida.</p>
            </>
          ) : (
            <>
              <h3>1. Coleta de Informações</h3>
              <p>Coletamos dados cadastrais essenciais como Nome, E-mail, CPF e CEP para garantir a integridade da conta e o cumprimento de regras fiscais de assinatura. As senhas são criptografadas de forma irreversível (salted hash) antes de tocarem nossa persistência.</p>
              <h3>2. Processamento Espectral de Sinal</h3>
              <p>Os arquivos de áudio carregados na plataforma passam por transformações matemáticas locais via algoritmos espectrais. Nenhuma gravação de áudio do usuário é compartilhada com terceiros ou utilizada para treinamento de modelos de inteligência artificial de código aberto.</p>
              <h3>3. Direitos dos Usuários (LGPD)</h3>
              <p>Em conformidade com as diretrizes vigentes de proteção de dados, você possui o direito de solicitar a exclusão total do seu perfil e de todo o seu histórico de laboratório (Slots de Timbres e Equipamentos) a qualquer momento através da interface de configurações.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}