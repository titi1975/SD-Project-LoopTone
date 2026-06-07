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

AUTH_DOCS = {
    "login": """
    Gera um **Token de Acesso (JWT)** para o usuário autenticado.
    
    Este endpoint funciona como a recepção do sistema. Ao validar o e-mail e a senha com sucesso, ele devolve um "Cartão Magnético" digital (o `accessToken`), que deve ser usado para destrancar os endpoints protegidos da API.

    ### 🛠️ Como Testar:
    1. Certifique-se de já ter criado uma conta na rota `POST /api/users/`.
    2. Insira o seu `email` e `senha` cadastrados no corpo da requisição (*Request Body*).
    3. Clique em **Send**.
    4. Copie o texto do `accessToken` que será retornado na resposta (HTTP 200).
    5. Navegue até a rota que deseja testar (ex: *Criar Equipamento*), abra a aba de **Authentication**, selecione **HTTPBearer** e cole o token lá.
    
    **Nota de Segurança:** Por medidas de proteção contra enumeração de usuários, falhas de login (e-mail inexistente ou senha incorreta) retornarão sempre a mesma mensagem genérica com Status `401 Unauthorized`.
    """
}

# ... (conteúdo superior do arquivo permanece igual) ...

USER_DOCS = {
    "create": """
    Cria uma nova conta de usuário na plataforma.
    
    A senha enviada será automaticamente criptografada antes de ser salva no banco de dados. O campo `aceitouTermos` deve ser obrigatoriamente `true`.

    ### 🛠️ Como Testar:
    1. Preencha os dados no corpo da requisição (*Request Body*).
    2. Certifique-se de usar um e-mail não cadastrado e uma senha forte (mínimo 8 caracteres).
    3. Clique em **Send**.
    """,
    
    "get_all": """
    Retorna uma lista de todos os usuários cadastrados no sistema.
    
    ### 🔍 Filtros (Query Parameters):
    Você pode refinar a busca preenchendo os parâmetros de URL disponíveis abaixo (ex: buscando por um nome específico). O FastAPI converte automaticamente esses parâmetros para o nosso `UserFilterDTO`.
    """,
    
    "get_by_id": """
    Busca os detalhes públicos e de perfil de um usuário específico utilizando o seu identificador único (`id`).
    """,
    
    "update": """
    Realiza a atualização **parcial** dos dados do usuário.
    
    Você não precisa enviar o JSON inteiro. Envie **apenas** as chaves e valores que deseja alterar. 
    Se você enviar um novo valor para a chave `senha`, o sistema irá gerar um novo hash de segurança automaticamente.
    """,
    
    "delete": """
    Realiza a remoção de um usuário do sistema.
    
    *(Nota de Arquitetura: Em sistemas em produção, a deleção de usuário geralmente é um "Soft Delete", apenas inativando a conta no banco para manter a integridade dos relacionamentos com os equipamentos antigos)*.
    """
}

