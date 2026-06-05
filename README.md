# LoopTone

Frontend e backend do LoopTone, com fluxo inicial de login, cadastro, setup de equipamentos e tela de conclusao.

## Requisitos

- Python 3.11+
- Node.js 20+
- npm
- PostgreSQL

## Configurar o Backend

Crie e instale as dependencias do ambiente virtual:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Crie um arquivo `.env` dentro da pasta `backend`:

```txt
backend/.env
```

Use a variavel `DATABASE_URL` apontando para seu PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/looptone
```

Ajuste usuario, senha, host, porta e nome do banco conforme sua instalacao.

Se o PostgreSQL estiver instalado no Windows pelo instalador oficial, o `psql` costuma ficar em:

```txt
C:\Program Files\PostgreSQL\18\bin\psql.exe
```

Para criar o banco manualmente:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres
```

Dentro do `psql`:

```sql
CREATE DATABASE looptone;
\q
```

## Rodar o Backend

Abra um terminal na raiz do projeto e execute:

```powershell
cd backend
..\.venv\Scripts\python.exe main.py
```

Por padrao, o backend sobe em:

```txt
http://localhost:8000
```

Tambem existe um exemplo de configuracao em:

```txt
backend/.env.example
```

## Rodar o Frontend

Em outro terminal, execute:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --port 5173
```

O frontend sobe em:

```txt
http://localhost:5173
```

Durante o desenvolvimento, o Vite redireciona chamadas `/api` para o backend em `http://localhost:8000`.

## Fluxo Disponivel 

- Login: `http://localhost:5173/login`
- Cadastro: `http://localhost:5173/cadastro`
- Setup de equipamentos: `http://localhost:5173/setup`
- Conclusao: `http://localhost:5173/concluido`

## Banco de Dados

O backend usa PostgreSQL via `DATABASE_URL`, como na estrutura original do projeto.

Tabelas principais:

- `users`
- `equipments`

## Validacoes

Frontend:

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

Backend:

```powershell
python -m compileall backend
```

## Observacoes

- A senha do cadastro precisa ter pelo menos 8 caracteres, com letra maiuscula, letra minuscula, numero e caractere especial.
- Exemplo de senha valida: `Teste@123`.
- O backend cria as tabelas com `Base.metadata.create_all(bind=engine)`. Em producao, substitua por migrations com Alembic.
