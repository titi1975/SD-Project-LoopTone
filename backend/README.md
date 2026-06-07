# 🎸 ToneForge API (LoopTone Backend)

Bem-vindo ao repositório oficial da API do **ToneForge / LoopTone**. 
Trata-se de uma aplicação backend robusta e escalável desenvolvida em Python, criada para gerenciar configurações e setups de equipamentos musicais de usuários (Guitarras, Baixos, Violões, Amplificadores, Pedais e DAWs).

---

## 🏛️ Arquitetura do Projeto

Este projeto foi construído utilizando os princípios de **Clean Architecture** (Arquitetura Limpa) e **SOLID**. O objetivo é manter o código altamente testável, desacoplado e fácil de manter.

A estrutura de pastas é dividida em módulos independentes (`users`, `equipments`, `auth`), garantindo o princípio de Responsabilidade Única (SRP). Cada módulo possui suas próprias camadas internas:

* **Controllers (Controladores):** Pontos de entrada da API (Rotas/Endpoints). Lidam com requisições e respostas HTTP.
* **DTOs (Data Transfer Objects):** Contratos de entrada e saída validados rigorosamente via Pydantic.
* **Use Cases (Casos de Uso):** O coração da aplicação. Contêm as regras de negócio puras (ex: limite máximo de equipamentos, validações de senha).
* **Repositories (Repositórios):** Camada de abstração e comunicação com o banco de dados. Implementados via Interfaces (Contratos), permitindo a Inversão de Dependência (DIP).
* **Entities (Entidades):** Representação das tabelas e colunas físicas no banco de dados.

Há também pastas globais:
* **`infra/`**: Configurações de banco de dados (Engine, Sessions).
* **`shared/`**: Recursos compartilhados, como manipulação de exceções globais, segurança (JWT, Hashes) e documentação.

---

## 🛠️ Tecnologias e Dependências

O ecossistema do projeto foi escolhido focando em performance assíncrona e validação de dados eficiente:

* **FastAPI:** Framework web moderno e de altíssima performance para construção de APIs.
* **Uvicorn:** Servidor ASGI ultrarrápido para rodar a aplicação FastAPI.
* **SQLAlchemy:** ORM (Object Relational Mapper) para comunicação com o banco de dados.
* **Pydantic (v2):** Validação de dados rigorosa através de tipagem e sub-modelos.
* **PostgreSQL:** Banco de dados relacional (utilizado ativamente pelos tipos avançados `JSONB` e `ARRAY`).
* **PyJWT:** Geração e decodificação de Tokens JWT para a arquitetura de segurança Stateless.
* **Scalar:** Interface de documentação OpenAPI rica, customizada e altamente interativa.

---

## 🚀 O Que Já Foi Implementado

O sistema já contempla um fluxo completo de uso seguro e estruturado:

### 1. Segurança & Autenticação (`auth`)
* Sistema de Login seguro evitando *User Enumeration*.
* Geração de Tokens **JWT (JSON Web Token)**.
* Cadeados de Segurança (`Depends`) que extraem o `user_id` diretamente do token, mitigando fraudes e manipulação de dados (Spoofing).

### 2. Gerenciamento de Usuários (`users`)
* CRUD completo (Criar, Listar, Buscar por ID, Atualizar, Deletar).
* Filtros inteligentes na listagem usando *Query Parameters*.
* Hashing automático de senhas para segurança do banco de dados.

### 3. Setups Musicais (`equipments`)
* CRUD completo vinculado aos usuários, 100% protegido por JWT (Rotas trancadas).
* **Regras de Negócio aplicadas:**
    * Limite máximo de 5 setups por usuário.
    * Restrição de instrumentos (`Guitarra`, `Baixo` ou `Violão`).
    * Regras de quantidade: 1 Instrumento, até 10 Amps (estruturados), 10 Pedais e 5 DAWs.
* Uso de colunas dinâmicas no PostgreSQL (`JSONB` e `ARRAY`) achatadas via entidades no Python.

### 4. Estruturas Globais
* **Exception Handlers:** Respostas de erro padronizadas interceptando infrações de negócio (HTTP 400), falhas de autorização (HTTP 401) e buscas não encontradas (HTTP 404).
* **Docs Inteligentes:** Textos injetados via variáveis globais exibindo guias detalhados diretamente no painel do Scalar.

---

## ⚙️ Como Executar o Projeto

**1. Clone o repositório e acesse a pasta:**
```bash
cd backend

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python3 src/main.py

http://localhost:8000/scalar