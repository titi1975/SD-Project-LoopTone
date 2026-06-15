from datetime import datetime, timezone, timedelta
from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.equipment.repositories.interfaces import IEquipmentRepository
from shared.exceptions.base_exceptions import BusinessRuleException

class CreditService:
    MAX_DAILY_CREDITS = 10 # Limite generoso que definimos
    RESET_INTERVAL_HOURS = 24

    def __init__(self, equipment_repo: IEquipmentRepository):
        self.equipment_repo = equipment_repo

    def consume_credit_or_fail(self, equipment: EquipmentEntity) -> None:
        """
        Calcula o Lazy Reset. Se passou o tempo, reseta e cobra. 
        Se não, só cobra. Se acabou, falha.
        As mudanças são persistidas via repositório.
        """
        now = datetime.now(timezone.utc)
        
        # Garante que o timestamp do banco seja traduzido para UTC (Padrão ouro)
        last_reset = equipment.ultimo_reset_creditos
        if last_reset.tzinfo is None:
            last_reset = last_reset.replace(tzinfo=timezone.utc)

        # 1. Lógica do Lazy Reset: Passaram-se 24 horas?
        if now >= last_reset + timedelta(hours=self.RESET_INTERVAL_HOURS):
            equipment.creditos_ia = self.MAX_DAILY_CREDITS
            equipment.ultimo_reset_creditos = now

        # 2. Verificação de Saldo
        if equipment.creditos_ia <= 0:
            # Calcula quanto tempo falta para voltar
            time_passed = now - last_reset
            time_remaining = timedelta(hours=self.RESET_INTERVAL_HOURS) - time_passed
            hours, remainder = divmod(time_remaining.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            
            raise BusinessRuleException(
                f"Créditos diários esgotados para este Setup. Tente novamente em {hours}h e {minutes}m."
            )

        # 3. Consumo (Gasta 1 crédito)
        equipment.creditos_ia -= 1
        
        # 4. Salva a alteração (O método update do repositório dá o db.commit())
        self.equipment_repo.update(equipment)