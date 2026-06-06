# --- METADADOS GERAIS DA API ---

API_TITLE = "ToneForge API"
API_VERSION = "1.0.0"

# O FastAPI suporta Markdown nativamente na descrição global.
# O Scalar renderiza isso de forma lindíssima na tela inicial.
API_DESCRIPTION = """
# 🎸 ToneForge API - Documentação Interativa

Bem-vindo à documentação oficial do **ToneForge**, o seu gerenciador de setups musicais.
Esta API foi construída utilizando os princípios de **Clean Architecture** e **SOLID**.

## 🛠️ Como testar nesta interface (Scalar)
1. **Navegue pelos Módulos:** No menu lateral esquerdo, você encontrará as tags separando as rotas de `Users` e `Equipments`.
2. **Abra um Endpoint:** Clique na rota desejada (ex: `POST /api/users/`).
3. **Preencha os Dados:** No painel principal ou direito, localize a seção de *Body* ou *Parameters*. O Scalar já gera um JSON de exemplo com base nos nossos contratos (DTOs).
4. **Envie a Requisição:** Clique em **Test Request** e depois em **Send**. O resultado (Status Code e JSON de retorno) aparecerá logo abaixo.

---
"""

# --- DESCRIÇÃO DAS TAGS (MÓDULOS) ---
# Isso cria subtítulos e descrições para os grupos de rotas no menu lateral.
TAGS_METADATA = [
    {
        "name": "Users",
        "description": "Operações de gerenciamento de **Usuários**. Crie, liste, atualize ou remova contas da plataforma.",
    },
    {
        "name": "Equipments",
        "description": "Gerenciamento de **Setups de Equipamentos** (Guitarras, Baixos, Violões, Amps e Pedais). *Regra: Máximo de 5 setups por usuário.*",
    },
]

# --- DESCRIÇÕES ESPECÍFICAS DOS ENDPOINTS ---
# Dicionários organizados para injetar nos Controllers e manter o código deles limpo.

USER_DOCS = {
    "create": "Cria um novo usuário. É obrigatório o envio do aceite dos termos (`aceitouTermos: true`). A senha será criptografada automaticamente antes de ser salva.",
    "get_all": "Retorna uma lista paginada de todos os usuários ativos no sistema. É possível filtrar por nome ou e-mail.",
    "get_by_id": "Busca os detalhes de um usuário específico utilizando o seu ID (Identificador único).",
    "update": "Atualização parcial de um usuário. Envie apenas os campos que deseja alterar no JSON. Se a senha for enviada, um novo hash será gerado.",
    "delete": "Realiza o **Soft Delete** (Exclusão Lógica) de um usuário, inativando-o no banco de dados para manter a integridade de registros antigos."
}

EQUIPMENT_DOCS = {
    "create": """
    Cria um novo setup de equipamento musical.
    
    **Regras de Negócio Importantes:**
    * O usuário pode possuir no máximo **5 setups**.
    * O `instrumentType` aceita apenas: *Guitarra, Baixo ou Violão*.
    * É permitido apenas **1 instrumento** principal, até **10 amplificadores**, até **10 pedais** e até **5 DAWs**.
    """,
    "get_all_by_user": "Lista todos os setups de equipamentos vinculados a um determinado `user_id`.",
    "update": "Atualização parcial de um setup de equipamento. Envie apenas as estruturas ou listas que deseja substituir.",
    "delete": "Realiza o **Hard Delete** (Exclusão Física) de um setup de equipamento, liberando espaço para que o usuário possa criar um novo."
}