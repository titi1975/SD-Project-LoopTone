from infra.database.database_config import engine
from modules.user.entities.user_entity import UserEntity
from modules.equipment.entities.equipment_entity import EquipmentEntity
from modules.tone_analysis.entities.tone_entity import ToneEntity

try:
    print("Iniciando a limpeza profunda do banco de dados...")

    # 1. Apaga os netos (Timbres)
    ToneEntity.__table__.drop(engine, checkfirst=True)
    print(" Tabela 'tones' apagada com sucesso!")

    # 2. Apaga os filhos (Equipamentos)
    EquipmentEntity.__table__.drop(engine, checkfirst=True)
    print(" Tabela 'equipments' apagada com sucesso!")

    # 3. Apaga os pais (Usuários)
    UserEntity.__table__.drop(engine, checkfirst=True)
    print("Tabela 'users' apagada com sucesso!")

    print("Limpeza total concluída! Todas as tabelas estão prontas para serem recriadas com as novas colunas.")

except Exception as e:
    print(f"Erro durante a limpeza: {e}")