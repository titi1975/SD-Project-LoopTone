# 🎸 LoopTone

> Plataforma de análise e melhoria de timbre musical com IA (Gemini). Grave seu som, selecione um artista de referência e receba ajustes personalizados para aproximar seu timbre do alvo.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Instalação](#configuração-e-instalação)
  - [1. Clone o Repositório](#1-clone-o-repositório)
  - [2. Backend (FastAPI)](#2-backend-fastapi)
  - [3. Frontend (React + Vite)](#3-frontend-react--vite)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Modo Demo (sem chave Gemini)](#modo-demo-sem-chave-gemini)

---

## Visão Geral

O LoopTone permite que músicos:
- Cadastrem seus perfis de equipamento (instrumento, amplificadores, pedais, DAWs)
- Selecionem um timbre alvo (artista + música)
- Enviem um áudio da sua gravação atual
- Recebam feedback técnico gerado por IA para aproximar seu som do alvo
- Salvem e revisitem análises anteriores em "Meus Timbres"

---

## Stack Tecnológica

| Camada       | Tecnologia                              |
|:-------------|:----------------------------------------|
| Frontend     | React 19 + TypeScript + Vite + Zustand  |
| Backend      | Python 3.12 + FastAPI + SQLAlchemy      |
| Banco        | PostgreSQL 14+                          |
| IA           | Google Gemini 2.5 Flash (multimodal)    |
| Autenticação | JWT (PyJWT)                             |

---

## Pré-requisitos

Certifique-se de ter instalado:

- **Git**
- **Python 3.12+** — [python.org](https://www.python.org/downloads/)
- **Node.js 20+** (inclui npm) — [nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** — [postgresql.org](https://www.postgresql.org/download/)

> **Linux (Ubuntu/Debian):** `sudo apt install python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib`
>
> **macOS (Homebrew):** `brew install python node postgresql`

---

## Configuração e Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/SD-Project-LoopTone.git
cd SD-Project-LoopTone
```

---

### 2. Backend (FastAPI)

#### 2.1 — Criar o banco de dados PostgreSQL

```bash
# Linux/macOS
sudo -u postgres psql -c "CREATE DATABASE toneforge_db;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'sua_senha'; GRANT ALL PRIVILEGES ON DATABASE toneforge_db TO postgres;"

# Windows (abra o psql como administrador)
psql -U postgres -c "CREATE DATABASE toneforge_db;"
```

#### 2.2 — Criar e ativar o ambiente virtual

```bash
cd backend

# Criar
python3 -m venv venv    # Linux/macOS
python -m venv venv     # Windows

# Ativar
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows (PowerShell)
```

#### 2.3 — Instalar dependências

```bash
pip install -r requirements.txt
```

#### 2.4 — Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha com suas credenciais:

```env
# Connection string do Supabase (Project Settings > Database > Connection string > URI)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Gere uma chave aleatória:
# python3 -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=cole_aqui_a_chave_gerada

# Obtenha em: https://aistudio.google.com/app/apikey
# Deixe o valor padrão para usar o MODO DEMO:
GEMINI_API_KEY=insira_sua_chave_da_google_aqui

AUDIO_UPLOAD_DIR=uploads/audio
```

#### 2.5 — Criar diretório de uploads

```bash
mkdir -p uploads/audio    # Linux/macOS
mkdir uploads\audio       # Windows
```

#### 2.6 — Iniciar o servidor

```bash
python main.py
# ou
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: **http://localhost:8000**
Documentação interativa (Scalar): **http://localhost:8000/scalar**

---

### 3. Frontend (React + Vite)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

> O Vite já está configurado com proxy para `/api` → `http://localhost:8000`, então o frontend se comunica com o backend automaticamente em desenvolvimento.

---

## Rodando o Projeto

Para rodar o projeto completo, você precisa de **dois terminais** abertos simultaneamente:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate   # Linux/macOS  |  venv\Scripts\activate no Windows
python main.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

---

## Estrutura do Projeto

```
SD-Project-LoopTone/
├── backend/
│   ├── infra/
│   │   └── database/          # Configuração do SQLAlchemy
│   ├── modules/
│   │   ├── auth/              # Autenticação (login/registro)
│   │   ├── equipment/         # Perfis de equipamento
│   │   ├── tone_analysis/     # Análise de timbre com IA
│   │   └── user/              # Gerenciamento de usuários
│   ├── shared/
│   │   ├── documentation/     # Metadados da API (Scalar/OpenAPI)
│   │   ├── exceptions/        # Exceções customizadas
│   │   └── security/          # JWT + hash de senha
│   ├── .env.example           # Template de variáveis de ambiente
│   ├── main.py                # Ponto de entrada da aplicação
│   └── requirements.txt       # Dependências Python
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── commons/       # Componentes compartilhados (Topbar, etc)
│   │       ├── features/
│   │       │   ├── auth/      # Login, Registro, Setup inicial
│   │       │   ├── equipment/ # Perfis de equipamento
│   │       │   └── timbre/    # Análise de timbre (chat + Meus Timbres)
│   │       └── infra/         # HttpAdapter, configuração de ambiente
│   ├── .env.example
│   └── vite.config.ts
│
└── .gitignore
```

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável           | Obrigatória | Descrição                                               |
|:-------------------|:-----------:|:--------------------------------------------------------|
| `DATABASE_URL`     | ✅           | Connection string do Supabase (PostgreSQL)               |
| `JWT_SECRET_KEY`   | ✅           | Chave secreta para assinar tokens JWT                   |
| `GEMINI_API_KEY`   | ⚠️           | Chave da API Google Gemini (sem ela usa modo demo)      |
| `AUDIO_UPLOAD_DIR` | ✅           | Diretório de uploads de áudio (padrão: `uploads/audio`) |

### Frontend (`frontend/.env`)

O frontend não requer variáveis de ambiente para rodar localmente. O proxy do Vite aponta automaticamente `/api` para `http://localhost:8000`.

---

## Modo Demo (sem chave Gemini)

Se você não tiver uma chave da API do Gemini, o sistema entra automaticamente em **Modo Demo**. Nesse modo:

- A análise de timbre retorna dados simulados
- Todas as demais funcionalidades (cadastro, login, equipamentos, chat) funcionam normalmente
- A UI indica visualmente que está em modo de demonstração

Para usar o modo demo, mantenha a variável:
```env
GEMINI_API_KEY=insira_sua_chave_da_google_aqui
```

Para usar a IA real, substitua pelo valor real obtido em [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
