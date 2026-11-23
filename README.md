# E-Farmácia

Plataforma web para pesquisar medicamentos, consultar a bula organizada, comparar preços (incluindo genéricos e similares), encontrar farmácias próximas no mapa e usar cupons de farmácias parceiras.

Projeto Integrador I — Senac.

> O E-Farmácia informa, não substitui a orientação de médico ou farmacêutico.
> Farmácias, preços e cupons exibidos são **dados de demonstração**.

## Funcionalidades

- Cadastro e login (e-mail e senha)
- Busca por nome comercial ou princípio ativo (sem diferenciar acentos e maiúsculas) e filtro por categoria
- Página do medicamento: bula em seções (sem dosagem, com link para o Bulário da Anvisa), alternativas com o mesmo princípio ativo, preços por farmácia com data de atualização e selo de desatualizado (> 7 dias), cupons
- "Reportar preço incorreto" (usuário logado)
- Mapa de farmácias próximas (OpenStreetMap); sem localização, usa a Av. Paulista como referência
- Página de cupons vigentes
- Painel administrativo: medicamentos e bulas, preços, farmácias, cupons, categorias e reportes

## Arquitetura

Clean Architecture orientada a domínio, em TypeScript, num único projeto Next.js publicado na Vercel.

```
src/domain/          Entidades e regras de negócio puras (sem dependências externas)
src/application/     Casos de uso + interfaces de repositório (ports)
src/infrastructure/  Repositórios Supabase, mapeadores, composição (container), sessão
src/app/api/         WebApi — controllers REST (Route Handlers)
src/app/...          Telas (React / Next.js App Router)
tests/unit/          Testes de domínio e casos de uso (repositórios em memória)
tests/integration/   Testes da WebApi e dos repositórios contra o banco
supabase/migrations/ Esquema, regras de acesso (RLS), funções de busca e dados de demonstração
```

Regra de dependência: `domain` não depende de ninguém; `application` depende só de `domain`; Supabase e Next.js ficam em `infrastructure` e `app`.

### WebApi

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/medicamentos?q=&categoria=` | Busca |
| GET | `/api/medicamentos/:id` | Detalhe (bula, preços, alternativas, cupons) |
| GET | `/api/categorias` | Categorias |
| GET | `/api/farmacias/proximas?lat=&lng=` | Farmácias num raio de 15 km |
| GET | `/api/cupons` | Cupons vigentes |
| POST | `/api/reportes` | Reportar preço (exige login) |
| GET/POST | `/api/admin/:entidade` | Listar / criar ou atualizar (somente admin) |
| GET/DELETE | `/api/admin/:entidade/:id` | Detalhe / excluir (somente admin) |
| PATCH | `/api/admin/reportes/:id` | Marcar reporte como resolvido |

Erros respondem `{ "erro": "mensagem" }` com 400 (validação), 401 (sem login), 403 (sem permissão) ou 404.

## Tecnologias

Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL + PostGIS + Auth) · Leaflet + OpenStreetMap · Vitest · Vercel

## Como rodar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
cp .env.example .env.local   # preencha com os dados do projeto Supabase
npm run dev                  # http://localhost:3000
```

Variáveis em `.env.local` (nunca commitar):

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (publishable) |
| `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` | Migrações e configuração (CLI) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts administrativos (nunca no navegador) |

## Banco de dados

```bash
npx supabase link --project-ref <ref>
npx supabase db push --remote                                  # aplica as migrações
npx supabase db query --remote -f supabase/tests/verification.sql   # verifica busca, mapa e RLS
node --env-file=.env.local scripts/configure-auth.mjs <url-do-site>
node --env-file=.env.local scripts/create-admin.mjs <email-do-admin>  # imprime a senha
```

## Testes

```bash
npm test                         # unitários + integração (padrão AAA: Arrange, Act, Assert)
node --env-file=.env.local scripts/verify-flows.mjs http://localhost:3000   # ponta a ponta
```

## Equipe

Felipe Anderson Anacleto da Silva, João Paulo Vieira Henrique Rampcke Lopes, Pedro Augusto Ferreira Guimarães, Pablo Rosa de Jesus, Alex Santana da Rocha, Otavio Augusto Reis Almeida e Gilvan Oliveira Ramos.
