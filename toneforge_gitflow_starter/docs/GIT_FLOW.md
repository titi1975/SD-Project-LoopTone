# Git Flow e Padrao de Versionamento - SD-Project-ToneForge

Versao: 1.0  
Repositorio: `SD-Project-ToneForge`  
Remote SSH sugerido pelo GitHub: `git@github.com:vs0808/SD-Project-ToneForge.git`

---

## 1. Objetivo

Este documento define o fluxo de trabalho com Git e GitHub para o projeto `SD-Project-ToneForge`, com foco em:

- organizar o trabalho de uma equipe;
- evitar conflito entre desenvolvedores;
- impedir alteracoes diretas em branches importantes;
- garantir revisao de codigo antes de integrar mudancas;
- manter uma branch estavel para execucao do projeto completo;
- criar um padrao profissional de nomes de branches, commits, pull requests e releases.

---

## 2. Decisao principal de arquitetura de branches

### 2.1 Recomendacao para este projeto

Mesmo que o projeto tenha front-end e back-end, a recomendacao principal e NAO manter `frontend` e `backend` como branches fixas de integracao no fluxo padrao.

O fluxo recomendado e:

```text
main
└── dev
    ├── feature/frontend/tela-login
    ├── feature/backend/autenticacao-jwt
    ├── bugfix/frontend/corrige-menu-mobile
    ├── bugfix/backend/corrige-validacao-token
    ├── style/frontend/ajusta-texto-home
    ├── refactor/backend/organiza-servico-usuarios
    └── docs/atualiza-readme
```

### 2.2 Por que nao usar `frontend` e `backend` como branches fixas por padrao?

A ideia de separar front-end e back-end em branches fixas parece organizada no inicio, mas tende a gerar problemas quando a equipe cresce:

1. **O projeto completo deixa de ter uma linha unica de integracao.**  
   O front pode estar funcionando em `frontend`, o back pode estar funcionando em `backend`, mas a combinacao dos dois pode quebrar quando for juntar.

2. **A integracao fica atrasada.**  
   Se front e back passam dias separados, conflitos e incompatibilidades aparecem tarde.

3. **A branch `main` fica distante da realidade do desenvolvimento.**  
   O ideal e que exista uma branch de integracao frequente (`dev`) e uma branch estavel (`main`).

4. **O escopo front/back deve aparecer no nome da branch e no CODEOWNERS.**  
   Assim, a separacao continua clara sem criar linhas paralelas permanentes.

### 2.3 Quando faria sentido manter branches fixas `frontend` e `backend`?

Apenas se a equipe realmente precisar de integracoes independentes por area, por exemplo:

- times grandes e bem separados;
- deploys independentes de front e back;
- pipelines separados e maduros;
- necessidade de homologar front e back em ritmos diferentes.

Nesse caso, consulte o **Apendice A - Fluxo alternativo com branches fixas de front-end e back-end**.

---

## 3. Branches oficiais do fluxo recomendado

| Branch | Tipo | Origem | Destino | Objetivo |
|---|---|---|---|---|
| `main` | Permanente | - | - | Codigo estavel, homologado e pronto para release/producao. |
| `dev` | Permanente | `main` | `main` | Integracao continua do desenvolvimento. Todas as features entram primeiro aqui. |
| `feature/*` | Temporaria | `dev` | `dev` | Desenvolvimento de nova funcionalidade. |
| `bugfix/*` | Temporaria | `dev` | `dev` | Correcao de bug ainda nao publicado em producao. |
| `hotfix/*` | Temporaria | `main` | `main` e depois `dev` | Correcao urgente em codigo ja publicado/estavel. |
| `style/*` | Temporaria | `dev` | `dev` | Ajustes visuais ou textuais que nao alteram regra de negocio. |
| `refactor/*` | Temporaria | `dev` | `dev` | Melhorias internas de codigo sem mudar comportamento. |
| `docs/*` | Temporaria | `dev` | `dev` | Alteracoes em documentacao. |
| `test/*` | Temporaria | `dev` | `dev` | Criacao ou ajuste de testes. |
| `chore/*` | Temporaria | `dev` | `dev` | Tarefas de manutencao, build, dependencias, configuracoes. |
| `release/*` | Temporaria/opcional | `dev` | `main` | Preparacao de uma versao antes de publicar. |

---

## 4. Nomes de branches

### 4.1 Formato recomendado

```text
tipo/escopo/resumo-curto
```

Onde:

- `tipo`: tipo da alteracao;
- `escopo`: area principal afetada;
- `resumo-curto`: descricao curta em kebab-case.

### 4.2 Tipos permitidos

```text
feature
bugfix
hotfix
style
refactor
docs
test
chore
release
```

### 4.3 Escopos sugeridos

```text
frontend
backend
database
infra
ci
docs
shared
```

### 4.4 Regras de escrita

Use:

- letras minusculas;
- palavras separadas por hifen;
- nomes curtos e objetivos;
- sem acentos;
- sem espacos;
- sem caracteres especiais desnecessarios.

Evite:

```text
feature/Login Novo
feature/tela de login
Feature/TelaLogin
bug/correção-do-usuário
```

Prefira:

```text
feature/frontend/tela-login
feature/backend/autenticacao-jwt
bugfix/frontend/menu-mobile
bugfix/backend/validacao-token
style/frontend/corrige-texto-home
refactor/backend/servico-usuarios
docs/readme-inicial
chore/ci/configura-actions
release/v1.0.0
hotfix/backend/corrige-token-expirado
```

### 4.5 Branch com numero de issue

Se a equipe usar GitHub Issues, e recomendado incluir o numero da issue:

```text
feature/12-frontend/tela-login
bugfix/27-backend/validacao-token
```

Ou, de forma mais simples:

```text
feature/frontend/12-tela-login
bugfix/backend/27-validacao-token
```

Escolha um padrao e mantenha sempre o mesmo.

---

## 5. Padrao de commits

### 5.1 Formato recomendado

```text
tipo(escopo): descricao curta no imperativo
```

Exemplos:

```text
feat(frontend): cria tela de login
feat(backend): adiciona endpoint de autenticacao
fix(backend): corrige validacao de token expirado
style(frontend): corrige texto do botao de envio
refactor(backend): simplifica servico de usuarios
docs(readme): adiciona instrucoes de instalacao
test(backend): adiciona testes de autenticacao
chore(ci): adiciona workflow de validacao
```

### 5.2 Tipos de commit

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade. |
| `fix` | Correcao de bug. |
| `docs` | Mudancas em documentacao. |
| `style` | Formatacao, texto, layout simples ou ajustes que nao alteram logica. |
| `refactor` | Refatoracao sem alterar comportamento. |
| `test` | Criacao ou ajuste de testes. |
| `chore` | Tarefas de manutencao, configs, build, dependencias. |
| `perf` | Melhoria de performance. |
| `ci` | Ajustes em pipeline e GitHub Actions. |
| `build` | Ajustes de empacotamento/build. |
| `revert` | Reversao de commit anterior. |

### 5.3 Regras de qualidade para commits

Cada commit deve:

- representar uma unidade pequena de mudanca;
- ser reversivel sem quebrar uma grande parte do projeto;
- ter mensagem clara;
- evitar misturar front-end, back-end e configuracao sem necessidade;
- nao conter arquivos gerados, credenciais, `.env`, `node_modules`, `dist`, `build`, caches ou arquivos temporarios.

### 5.4 Quando usar mais de um commit

Use commits separados quando a alteracao tiver responsabilidades diferentes.

Exemplo ruim:

```text
feat(fullstack): cria login, altera banco, corrige navbar e atualiza readme
```

Exemplo melhor:

```text
feat(backend): adiciona endpoint de login
feat(frontend): cria tela de login
style(frontend): ajusta responsividade da navbar
docs(readme): documenta variaveis de ambiente
```

---

## 6. Padrao de Pull Requests

No GitHub, o equivalente pratico ao Merge Request do GitLab e o Pull Request.

### 6.1 Regra principal

Nenhum codigo deve entrar diretamente em:

```text
main
dev
```

Toda alteracao deve entrar por Pull Request.

### 6.2 Destino dos Pull Requests

| Origem | Destino | Quando usar |
|---|---|---|
| `feature/*` | `dev` | Nova funcionalidade comum. |
| `bugfix/*` | `dev` | Bug encontrado durante desenvolvimento/homologacao. |
| `style/*` | `dev` | Ajuste visual/textual. |
| `refactor/*` | `dev` | Refatoracao interna. |
| `docs/*` | `dev` | Documentacao. |
| `test/*` | `dev` | Testes. |
| `chore/*` | `dev` | Manutencao/config. |
| `release/*` | `main` | Publicacao de versao. |
| `hotfix/*` | `main` | Correcao urgente em codigo estavel/producao. |
| `main` | `dev` | Sincronizar hotfix/release de volta para desenvolvimento. |

### 6.3 Titulo do Pull Request

Formato recomendado:

```text
tipo(escopo): descricao objetiva
```

Exemplos:

```text
feat(frontend): cria tela de login
feat(backend): adiciona autenticacao JWT
fix(backend): corrige validacao de usuario inativo
style(frontend): ajusta textos da home
refactor(backend): reorganiza camada de services
```

### 6.4 Descricao obrigatoria do Pull Request

Todo PR deve explicar:

- o que foi alterado;
- por que foi alterado;
- como testar;
- se existe impacto no front;
- se existe impacto no back;
- se existe impacto no banco;
- se exige variavel de ambiente;
- se fecha alguma issue.

Modelo:

```markdown
## Resumo

Descreva de forma objetiva o que este PR altera.

## Tipo de alteracao

- [ ] Feature
- [ ] Bugfix
- [ ] Hotfix
- [ ] Style
- [ ] Refactor
- [ ] Docs
- [ ] Test
- [ ] Chore

## Area impactada

- [ ] Front-end
- [ ] Back-end
- [ ] Banco de dados
- [ ] Infra/CI
- [ ] Documentacao

## Como testar

1. Execute `...`
2. Acesse `...`
3. Valide que `...`

## Checklist do autor

- [ ] Criei a branch a partir da branch correta.
- [ ] Atualizei minha branch com `dev` antes de abrir ou finalizar o PR.
- [ ] Testei localmente.
- [ ] Nao subi arquivos sensiveis.
- [ ] Atualizei documentacao, se necessario.
- [ ] O PR esta pequeno o suficiente para revisao.

## Issues relacionadas

Closes #NUMERO_DA_ISSUE
```

### 6.5 Draft Pull Request

Use Draft PR quando:

- a funcionalidade ainda nao esta pronta;
- voce quer mostrar progresso;
- precisa de ajuda antecipada;
- quer validar direcao tecnica antes de finalizar.

Quando estiver pronto, marque como "Ready for review".

---

## 7. Code Review

### 7.1 Regra minima

Todo PR para `dev` deve ter pelo menos 1 aprovacao.

Todo PR para `main` deve ter pelo menos 1 ou 2 aprovacoes, dependendo do tamanho da equipe e criticidade.

### 7.2 Checklist do revisor

O revisor deve avaliar:

- o codigo resolve o problema descrito?
- ha impacto em outras partes do sistema?
- os nomes de variaveis, funcoes, classes e arquivos estao claros?
- ha repeticao desnecessaria?
- ha risco de quebrar front-end ou back-end?
- ha alteracao de contrato entre API e interface?
- ha tratamento de erros?
- ha validacoes necessarias?
- ha testes ou pelo menos um roteiro claro de teste manual?
- ha credenciais ou dados sensiveis?
- a branch esta atualizada com a base?
- a mensagem e o titulo seguem o padrao?

### 7.3 Solicitacao de mudancas

Se o revisor pedir ajustes:

1. O autor corrige na mesma branch.
2. O autor faz novos commits.
3. O autor envia push novamente.
4. O mesmo PR e atualizado automaticamente.
5. O revisor reavalia.
6. O PR so e mergeado quando aprovado.

Nao feche o PR para abrir outro, exceto se a abordagem estiver completamente errada.

---

## 8. Estrategia de merge

### 8.1 Recomendacao: Squash and merge

Para este projeto, a recomendacao e usar **Squash and merge** em PRs de feature para `dev`.

Vantagens:

- historico mais limpo;
- cada PR vira um commit claro;
- facilita reverter uma funcionalidade;
- evita excesso de commits pequenos no historico principal.

### 8.2 Mensagem do squash

Ao fazer squash, ajuste a mensagem final para o padrao:

```text
feat(frontend): cria tela de login
```

ou

```text
fix(backend): corrige validacao de token
```

### 8.3 Quando usar merge commit

Use merge commit apenas se a equipe fizer questao de preservar o historico completo da branch.

Para uma equipe iniciando, `Squash and merge` e mais simples e profissional.

---

## 9. Releases e tags

### 9.1 Padrao de versao

Use versionamento semantico:

```text
vMAJOR.MINOR.PATCH
```

Exemplos:

```text
v1.0.0
v1.1.0
v1.1.1
v2.0.0
```

### 9.2 Quando incrementar

| Parte | Quando aumentar | Exemplo |
|---|---|---|
| `MAJOR` | Mudanca grande ou incompativel | `v1.4.2` -> `v2.0.0` |
| `MINOR` | Nova funcionalidade compativel | `v1.4.2` -> `v1.5.0` |
| `PATCH` | Correcao de bug/hotfix | `v1.4.2` -> `v1.4.3` |

### 9.3 Fluxo simples de release

Use quando a equipe ainda nao precisa de uma branch `release/*`:

```text
feature/* -> dev
dev testado -> PR para main
main recebe merge
cria tag vX.Y.Z
cria GitHub Release
```

### 9.4 Fluxo com branch release

Use quando precisar estabilizar uma versao antes de publicar:

```bash
git switch dev
git pull --rebase origin dev

git switch -c release/v1.0.0
git push -u origin release/v1.0.0
```

Depois:

1. Abrir PR de `release/v1.0.0` para `main`.
2. Fazer apenas ajustes pequenos e correcoes.
3. Aprovar PR.
4. Mergear em `main`.
5. Criar tag:

```bash
git switch main
git pull --rebase origin main

git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

6. Sincronizar `main` de volta em `dev`:

```bash
git switch dev
git pull --rebase origin dev
git merge origin/main
git push origin dev
```

---

## 10. Hotfix

Hotfix e uma correcao urgente feita a partir de `main`.

### 10.1 Quando usar hotfix

Use quando:

- o erro existe na versao estavel/publicada;
- a correcao precisa ir direto para `main`;
- nao pode esperar o fluxo normal de `dev`.

### 10.2 Fluxo de hotfix

```bash
git switch main
git pull --rebase origin main

git switch -c hotfix/backend/corrige-token-expirado
```

Faca a correcao:

```bash
git add .
git commit -m "fix(backend): corrige token expirado"
git push -u origin hotfix/backend/corrige-token-expirado
```

Depois:

1. Abrir PR de `hotfix/backend/corrige-token-expirado` para `main`.
2. Exigir revisao.
3. Fazer merge.
4. Criar tag patch, por exemplo `v1.0.1`.
5. Levar a correcao de volta para `dev`:

```bash
git switch dev
git pull --rebase origin dev
git merge origin/main
git push origin dev
```

Ou abrir PR de `main` para `dev`.

---

## 11. Configuracao inicial do Git local

### 11.1 Identidade do Git

Cada desenvolvedor deve configurar nome e e-mail:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email-do-github@example.com"
```

Conferir:

```bash
git config --global --list
```

### 11.2 Branch padrao

```bash
git config --global init.defaultBranch main
```

### 11.3 Pull com rebase

Recomendado para manter historico local mais limpo:

```bash
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global fetch.prune true
```

### 11.4 Editor padrao

Se usar VS Code:

```bash
git config --global core.editor "code --wait"
```

### 11.5 Configuracao de quebra de linha

Windows:

```bash
git config --global core.autocrlf true
```

Linux/macOS:

```bash
git config --global core.autocrlf input
```

---

## 12. Configuracao de SSH para GitHub

Como o repositorio esta usando URL SSH, cada desenvolvedor deve ter uma chave SSH configurada.

### 12.1 Criar chave

```bash
ssh-keygen -t ed25519 -C "seu-email-do-github@example.com"
```

Pressione Enter para aceitar o caminho padrao.

### 12.2 Adicionar ao ssh-agent

Linux/macOS/Git Bash:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 12.3 Copiar chave publica

```bash
cat ~/.ssh/id_ed25519.pub
```

Copie o conteudo e cadastre em:

```text
GitHub -> Settings -> SSH and GPG keys -> New SSH key
```

### 12.4 Testar conexao

```bash
ssh -T git@github.com
```

---

## 13. Configuracao inicial do repositorio

### 13.1 Caso A - O projeto ja existe localmente

Na pasta do projeto:

```bash
git init
git branch -M main
git remote add origin git@github.com:vs0808/SD-Project-ToneForge.git
git add .
git commit -m "chore(repo): estrutura inicial do projeto"
git push -u origin main
```

Criar a branch `dev`:

```bash
git switch -c dev
git push -u origin dev
```

### 13.2 Caso B - O repositorio esta vazio e voce quer comecar clonando

```bash
git clone git@github.com:vs0808/SD-Project-ToneForge.git
cd SD-Project-ToneForge
git switch -c main
```

Criar estrutura inicial:

```bash
mkdir docs
mkdir .github
echo "# SD-Project-ToneForge" > README.md
```

Commit inicial:

```bash
git add .
git commit -m "chore(repo): estrutura inicial do projeto"
git push -u origin main
```

Criar `dev`:

```bash
git switch -c dev
git push -u origin dev
```

---

## 14. Configuracoes recomendadas no GitHub

Acesse:

```text
Repositorio -> Settings
```

### 14.1 Collaborators

Caminho comum:

```text
Settings -> Collaborators
```

Recomendacao:

| Papel | Permissao |
|---|---|
| Responsavel tecnico / lider | Admin ou Maintain |
| Desenvolvedores ativos | Write |
| Pessoas que apenas acompanham | Read ou Triage |

Evite dar Admin para todos.

### 14.2 Pull Requests

Em:

```text
Settings -> General -> Pull Requests
```

Recomendado:

- habilitar `Allow squash merging`;
- opcionalmente desabilitar `Allow merge commits`;
- manter `Allow rebase merging` se a equipe souber usar;
- habilitar `Automatically delete head branches`;
- habilitar sugestao/atualizacao de branches se disponivel.

### 14.3 Branch protection ou Rulesets

Dependendo da tela atual do GitHub, a configuracao pode aparecer como:

```text
Settings -> Branches -> Branch protection rules
```

ou:

```text
Settings -> Rules -> Rulesets
```

#### Regra para `main`

Ative:

- Require a pull request before merging;
- Required approvals: 1 ou 2;
- Dismiss stale pull request approvals when new commits are pushed;
- Require review from Code Owners;
- Require status checks to pass before merging;
- Require conversation resolution before merging;
- Require linear history;
- Do not allow bypassing the above settings;
- Block force pushes;
- Block deletions.

#### Regra para `dev`

Ative:

- Require a pull request before merging;
- Required approvals: 1;
- Require status checks to pass before merging;
- Require conversation resolution before merging;
- Block force pushes;
- Block deletions.

#### Regra para `release/*` e `hotfix/*`

Opcional:

- exigir PR;
- exigir status checks;
- restringir quem pode criar ou fazer push;
- permitir apenas mantenedores.

### 14.4 Observacao importante sobre status checks

So marque um check como obrigatorio depois que o workflow do GitHub Actions existir e ja tiver rodado pelo menos uma vez.

Se voce exigir um check que ainda nao existe, os PRs podem ficar bloqueados.

---

## 15. CODEOWNERS

O arquivo CODEOWNERS define responsaveis por areas do codigo.

Local recomendado:

```text
.github/CODEOWNERS
```

Exemplo:

```text
# Donos padrao do repositorio
* @vs0808

# Front-end
/frontend/ @usuario-front-1 @usuario-front-2

# Back-end
/backend/ @usuario-back-1 @usuario-back-2

# Configuracoes criticas
/.github/ @vs0808
/docs/ @vs0808
```

Substitua os usuarios pelos GitHub usernames reais.

Se o repositorio estiver em uma organizacao, prefira teams:

```text
/frontend/ @nome-da-org/time-frontend
/backend/ @nome-da-org/time-backend
```

---

## 16. GitHub Actions - CI inicial

Crie um workflow real assim que a stack do projeto estiver definida.

Local:

```text
.github/workflows/ci.yml
```

Modelo inicial generico:

```yaml
name: CI

on:
  pull_request:
    branches:
      - dev
      - main
  push:
    branches:
      - dev
      - main

jobs:
  validate:
    name: validar-projeto
    runs-on: ubuntu-latest

    steps:
      - name: Baixar codigo
        uses: actions/checkout@v4

      - name: Validacao temporaria
        run: |
          echo "Substituir este passo por lint, testes e build reais."
          echo "Exemplos: npm test, npm run build, pytest, mvn test, etc."
```

Importante: esse workflow e apenas um ponto de partida. Antes de tornar o CI obrigatorio, substitua a validacao temporaria pelos comandos reais do projeto.

---

## 17. Fluxo diario do desenvolvedor

### 17.1 Criar uma feature de front-end

```bash
git fetch origin
git switch dev
git pull --rebase origin dev

git switch -c feature/frontend/tela-login
```

Trabalhar, testar e commitar:

```bash
git add .
git commit -m "feat(frontend): cria tela de login"
git push -u origin feature/frontend/tela-login
```

Abrir PR:

```text
base: dev
compare: feature/frontend/tela-login
```

### 17.2 Criar uma feature de back-end

```bash
git fetch origin
git switch dev
git pull --rebase origin dev

git switch -c feature/backend/autenticacao-jwt
```

Commit:

```bash
git add .
git commit -m "feat(backend): adiciona autenticacao JWT"
git push -u origin feature/backend/autenticacao-jwt
```

Abrir PR para `dev`.

### 17.3 Atualizar a branch de trabalho com `dev`

```bash
git fetch origin
git switch feature/frontend/tela-login
git rebase origin/dev
```

Se precisar enviar apos rebase:

```bash
git push --force-with-lease
```

Use `--force-with-lease` apenas em branch temporaria sua. Nunca use em `main` ou `dev`.

### 17.4 Depois que o PR for mergeado

```bash
git switch dev
git pull --rebase origin dev
git branch -d feature/frontend/tela-login
```

Se a branch remota nao foi apagada automaticamente:

```bash
git push origin --delete feature/frontend/tela-login
```

---

## 18. Fluxo completo recomendado

### 18.1 Feature comum

```text
dev -> feature/escopo/resumo -> PR -> dev
```

### 18.2 Publicacao simples

```text
dev testada -> PR -> main -> tag/release
```

### 18.3 Hotfix

```text
main -> hotfix/escopo/resumo -> PR -> main -> tag patch -> sincronizar main com dev
```

### 18.4 Release com estabilizacao

```text
dev -> release/vX.Y.Z -> PR -> main -> tag -> sincronizar main com dev
```

---

## 19. Politica de Issues e Project

### 19.1 Issues

Toda tarefa relevante deve ter uma issue.

Tipos recomendados de label:

```text
type: feature
type: bug
type: docs
type: refactor
type: chore
area: frontend
area: backend
area: database
area: infra
priority: high
priority: medium
priority: low
status: blocked
```

### 19.2 Project board

Colunas sugeridas:

```text
Backlog
Ready
In progress
Code review
Testing
Done
```

### 19.3 Relacao entre issue, branch e PR

Exemplo:

Issue:

```text
#12 Criar tela de login
```

Branch:

```text
feature/frontend/12-tela-login
```

Commit:

```text
feat(frontend): cria tela de login
```

PR:

```text
feat(frontend): cria tela de login
Closes #12
```

---

## 20. Arquivos que nao devem ser versionados

Nunca versionar:

```text
.env
.env.local
node_modules/
dist/
build/
coverage/
__pycache__/
.pytest_cache/
.DS_Store
*.log
*.sqlite
*.db
```

Use `.env.example` para documentar variaveis sem expor segredos.

Exemplo:

```text
DATABASE_URL=
JWT_SECRET=
API_BASE_URL=
```

---

## 21. Estrutura inicial sugerida do repositorio

Caso seja um monorepo com front e back no mesmo repositorio:

```text
SD-Project-ToneForge/
├── backend/
├── frontend/
├── docs/
│   └── GIT_FLOW.md
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .gitmessage.txt
└── README.md
```

---

## 22. Checklist de implantacao deste fluxo

### Etapa 1 - Preparar Git local

- [ ] Cada desenvolvedor configurou `user.name`.
- [ ] Cada desenvolvedor configurou `user.email`.
- [ ] Cada desenvolvedor testou SSH com GitHub.
- [ ] Cada desenvolvedor consegue clonar o repositorio.

### Etapa 2 - Preparar repositorio

- [ ] Criar commit inicial em `main`.
- [ ] Criar branch `dev`.
- [ ] Criar `README.md`.
- [ ] Criar `docs/GIT_FLOW.md`.
- [ ] Criar `.gitignore`.
- [ ] Criar `.github/pull_request_template.md`.
- [ ] Criar `.github/CODEOWNERS`.
- [ ] Criar templates de issue.

### Etapa 3 - Configurar GitHub

- [ ] Adicionar colaboradores.
- [ ] Definir permissoes.
- [ ] Habilitar squash merge.
- [ ] Habilitar auto-delete de branches.
- [ ] Proteger `main`.
- [ ] Proteger `dev`.
- [ ] Configurar CODEOWNERS.
- [ ] Configurar CI.
- [ ] Tornar checks obrigatorios depois que o CI estiver funcionando.

### Etapa 4 - Treinar equipe

- [ ] Todos sabem criar branch a partir de `dev`.
- [ ] Todos sabem abrir PR para `dev`.
- [ ] Todos conhecem o padrao de commit.
- [ ] Todos conhecem o checklist de review.
- [ ] Todos sabem atualizar branch com `rebase origin/dev`.
- [ ] Todos sabem que nao devem fazer push direto em `main` ou `dev`.

---

## 23. Apendice A - Fluxo alternativo com branches fixas de front-end e back-end

Use apenas se a equipe decidir manter a separacao por areas como branches permanentes.

### 23.1 Estrutura alternativa

```text
main
└── dev
    ├── frontend
    │   ├── feature/frontend/tela-login
    │   └── style/frontend/corrige-menu
    └── backend
        ├── feature/backend/autenticacao-jwt
        └── bugfix/backend/validacao-token
```

### 23.2 Regras

- `frontend` nasce de `dev`.
- `backend` nasce de `dev`.
- Features de front nascem de `frontend`.
- Features de back nascem de `backend`.
- PRs de feature front entram em `frontend`.
- PRs de feature back entram em `backend`.
- `frontend` e `backend` devem abrir PR para `dev` com frequencia.
- `dev` deve integrar o projeto completo.
- `main` recebe apenas de `dev`, `release/*` ou `hotfix/*`.

### 23.3 Comandos iniciais

```bash
git switch dev
git pull --rebase origin dev

git switch -c frontend
git push -u origin frontend

git switch dev
git switch -c backend
git push -u origin backend
```

### 23.4 Criar feature de front nesse modelo

```bash
git fetch origin
git switch frontend
git pull --rebase origin frontend

git switch -c feature/frontend/tela-login
```

PR:

```text
base: frontend
compare: feature/frontend/tela-login
```

Depois, periodicamente:

```text
base: dev
compare: frontend
```

### 23.5 Criar feature de back nesse modelo

```bash
git fetch origin
git switch backend
git pull --rebase origin backend

git switch -c feature/backend/autenticacao-jwt
```

PR:

```text
base: backend
compare: feature/backend/autenticacao-jwt
```

Depois, periodicamente:

```text
base: dev
compare: backend
```

### 23.6 Risco desse modelo

Esse modelo exige mais disciplina porque `frontend` e `backend` podem se afastar de `dev`.

Se for adotado, a equipe deve integrar em `dev` com frequencia, idealmente todos os dias ou a cada feature pequena finalizada.

---

## 24. Regras finais de ouro

1. `main` deve estar sempre estavel.
2. `dev` deve representar a integracao atual do projeto.
3. Toda mudanca entra por PR.
4. Branch temporaria deve nascer da branch correta.
5. Branch temporaria deve ser apagada apos merge.
6. Commit deve ser pequeno e claro.
7. PR deve ter descricao e forma de teste.
8. Nao subir segredo, senha, token ou `.env`.
9. Hotfix nasce de `main` e volta para `dev`.
10. O fluxo deve ajudar a equipe, nao virar burocracia sem sentido.
