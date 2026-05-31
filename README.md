# LoopTone

## Requisitos

- Python 3.11+
- Node.js 20+
- npm

## Rodar o Backend

Abra um terminal na raiz do projeto e execute:

```powershell
cd backend
python main.py
```

Por padrao, o backend sobe em:

```txt
http://localhost:8000
```

Se nao existir variavel `DATABASE_URL`, o backend usa SQLite local automaticamente:

```txt
backend/looptone.db
```

Tambem existe um exemplo de configuracao em:

```txt
backend/.env.example
```

## Rodar o Frontend

Em outro terminal, execute:

```powershell
cd frontend
npm install
npm run dev
```

Durante o desenvolvimento, o Vite redireciona chamadas `/api` para o backend em `http://localhost:8000`.

## Fluxo Disponivel

- Login: `http://localhost:5173/login`
- Cadastro: `http://localhost:5173/cadastro`
- Setup de equipamentos: `http://localhost:5173/setup`
- Conclusao: `http://localhost:5173/concluido`

## Banco de Dados

O banco local e SQLite. Para visualizar no VSCode, use uma extensao como **SQLite Viewer** e abra:

```txt
backend/looptone.db
```

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
- Se a estrutura do banco local ficar antiga durante o desenvolvimento, pare o backend e rode novamente. O projeto possui migracao simples para limpar campos legados da tabela `users` em SQLite.
