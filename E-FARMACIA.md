# E-Farmácia — Documentação do Projeto

> Contexto do produto para orientar o desenvolvimento (Projeto Integrador I — 2ª entrega).
> Fonte: apresentação "Apresentação E-Farmácia — 2ª Entrega".

## 1. Visão geral

O **E-Farmácia** é uma plataforma web onde a pessoa pesquisa um medicamento e, em um só lugar:

- consulta a **bula organizada** (base oficial da Anvisa);
- **compara preços**, incluindo genéricos e similares;
- encontra **farmácias próximas no mapa**;
- usa **filtros, categorias e cupons** de farmácias parceiras.

O produto é **gratuito para o usuário**. A receita vem das farmácias e marcas que pagam por divulgação.

**Frase-guia:** facilitar o acesso à informação sobre medicamentos e tornar a busca por farmácias e preços mais rápida e prática.

- **Missão:** conectar clientes e farmácias por uma plataforma simples e transparente, para comparar preços, escolher a melhor opção e ter um acesso mais justo e econômico à saúde.
- **Visão:** ser a plataforma digital mais completa e confiável para quem busca medicamentos, reunindo consumidores, farmácias e marcas farmacêuticas.
- **Valores:** transparência, confiabilidade (dados sempre atualizados), acessibilidade, inovação e respeito à saúde e ao cliente.

**Equipe:** Felipe Anderson Anacleto da Silva, João Paulo Vieira Henrique Rampcke Lopes, Pedro Augusto Ferreira Guimarães, Pablo Rosa de Jesus, Alex Santana da Rocha, Otavio Augusto Reis Almeida e Gilvan Oliveira Ramos.

## 2. Problema e motivação

As informações sobre medicamentos estão espalhadas em bulas, sites de farmácias e buscadores:

- é difícil consultar uma bula rapidamente e de forma organizada;
- comparar preços e disponibilidade entre farmácias toma tempo;
- achar um medicamento específico, ou uma alternativa (genérico/similar), numa farmácia próxima pelo melhor preço é trabalhoso.

O E-Farmácia centraliza tudo numa única plataforma para economizar tempo e dinheiro.

## 3. Público-alvo e perfis de usuário

Público geral: quem precisa pesquisar um medicamento, entender a bula, comparar preços, achar descontos ou localizar uma farmácia próxima.

| Perfil | O que faz na plataforma | O que ganha |
| --- | --- | --- |
| **Usuário (cliente)** | Pesquisa medicamentos, lê a bula, compara preços, localiza farmácias | Informação rápida, cupons, economia |
| **Farmácia** | Divulga medicamentos, preços, localização e promoções | Novos clientes e presença digital |
| **Administrador** | Gerencia medicamentos, bulas, farmácias, categorias, preços e cupons | Dados centralizados e fáceis de atualizar |
| **Marca farmacêutica** | Divulga produtos e aparece na comparação entre marcas | Visibilidade e proximidade com o consumidor |

## 4. Escopo do MVP

Princípio: *"Começar pequeno: entregar o essencial para validar o uso com a comunidade antes de ampliar."*

### Entra no MVP

- Cadastro e login de usuários
- Busca por **nome comercial** ou **princípio ativo**
- Bula em formato organizado (base oficial da Anvisa)
- Comparação de preços, incluindo genéricos e similares
- Localização de farmácias próximas no mapa
- Filtros, categorias e cupons de farmácias parceiras
- Painel administrativo: medicamentos, bulas, farmácias, preços e cupons

### Fora do escopo

- Venda, pagamento ou checkout dentro do app
- Entrega (delivery)
- Diagnóstico, prescrição ou indicação de tratamento (o app **não substitui** médico ou farmacêutico)
- Venda de medicamentos controlados
- Telemedicina
- Integração automática com o sistema de todas as farmácias (no MVP, preços entram **pelo painel ou por planilha**)

## 5. Fluxo principal de uso

1. Usuário se cadastra ou faz login.
2. Pesquisa um medicamento (nome comercial ou princípio ativo), com filtros e categorias.
3. O sistema identifica o medicamento e mostra alternativas (genéricos e similares).
4. Usuário consulta a bula organizada.
5. Vê preços por farmácia, cupons e farmácias próximas no mapa.
6. Pode avaliar e usar **"reportar preço incorreto"**.

Em paralelo, o **administrador** mantém os dados pelo painel.

## 6. Requisitos técnicos e tecnologias

O sistema precisa de:

- aplicação **web responsiva** (celular e computador, sem instalação);
- **painel administrativo**;
- **API** para processar buscas;
- banco de dados com atualização em tempo real e **busca por localização** (farmácias próximas);
- **autenticação** de usuários;
- **mapas**;
- **importação de dados públicos** (bulas e preços);
- segurança dos dados conforme a **LGPD**.

| Camada | Opções avaliadas | Situação |
| --- | --- | --- |
| Front-end | React (web app) · React Native (app nativo) | Lançamento como **versão web** (React) |
| Back-end | Python (FastAPI) · Node.js (NestJS) | Plano prevê **Python** |
| Banco de dados | Firebase (Firestore + Auth) · PostgreSQL + PostGIS | **Em aberto** |
| Mapas | Google Maps Platform · OpenStreetMap (MapLibre) | **Em aberto** |

**Prós e contras resumidos:**

- **React web:** roda em qualquer navegador e atualiza na hora, mas tem menos acesso a recursos do aparelho.
- **React Native:** experiência nativa e presença nas lojas, mas exige instalação, publicação e mais testes.
- **FastAPI:** simples, rápido, tem SDK oficial do Firebase e é ótimo para tratar dados de bulas e preços, mas traz menos estrutura pronta.
- **NestJS:** mesma linguagem do front e ótimo para REST, mas tem menos bibliotecas de dados.
- **Firebase:** tempo real, login pronto e escala automática, mas as consultas relacionais são limitadas e o custo cresce com o uso.
- **PostgreSQL + PostGIS:** gratuito e com consultas geográficas avançadas, mas exige servidor próprio.
- **Google Maps:** preciso e com interface conhecida, mas cobra por requisição acima da cota.
- **MapLibre:** aberto e sem licença, mas tem menos recursos prontos.

### Fontes de dados

- **Bulas:** Bulário Eletrônico da Anvisa — https://consultas.anvisa.gov.br/#/bulario/
- **Preços de referência:** CMED/Anvisa — https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed
- **Preços das farmácias:** painel administrativo ou planilha (MVP)

### Entidades principais (derivadas do escopo)

Usuário · Medicamento (nome comercial, princípio ativo, genérico/similar) · Bula · Categoria · Farmácia (localização) · Preço (medicamento × farmácia, data de atualização) · Cupom · Avaliação / Reporte de preço incorreto · Administrador

## 7. Plano do projeto

| Período | Marco | Recursos |
| --- | --- | --- |
| Jan/2027 | Requisitos e entrevistas com usuários e farmácias | Analista de requisitos, UX, 2 farmácias parceiras |
| Fev/2027 | Modelagem do banco + importação de bulas (Anvisa) e preços (CMED) | Dev back-end, administrador de dados |
| Fev/2027 | Design das telas (UI/UX) e protótipo navegável | Designer + dev front-end |
| Mar–Mai/2027 | Desenvolvimento do MVP: busca, bula, preços e mapa | 2 devs front-end, 1 dev back-end (Python) |
| Mai/2027 | Painel administrativo e cadastro de farmácias | 1 dev web |
| Jun/2027 | Testes e piloto em uma região de São Paulo | Equipe, usuários e farmácias piloto |
| Jul/2027 | Lançamento da versão web e acompanhamento | Toda a equipe |

### Indicadores e acompanhamento

- **Indicadores:** usuários ativos/mês; % de buscas com resultado; % de farmácias com preços atualizados em até 7 dias; economia média estimada por busca.
- **Revisões:** sprints quinzenais com review (Scrum); reunião mensal de indicadores; revisão trimestral do roadmap.
- **Feedback:** avaliação e "reportar preço incorreto" no app; conversa mensal com farmácias; NPS trimestral; entrevistas com usuários do piloto.

## 8. Viabilidade e negócio

- **Técnica: alta.** Usa tecnologias convencionais de web e banco de dados.
- **Econômica: moderada/alta.** Exige investimento em desenvolvimento, hospedagem, manutenção e atualização de dados.
- **Modelo de receita:** o usuário não paga. A receita vem de planos para farmácias, publicidade, destaque patrocinado, parcerias, assinatura para empresas e comissão por encaminhamento.
- **Concorrentes diretos:** apps e plataformas que comparam preços de medicamentos.
- **Concorrentes indiretos:** sites de farmácias, buscadores, apps de grandes redes e a bula física/digital.
- **Diferencial:** reúne bula, busca, localização, comparação de preços e cupons numa única plataforma.
- **Desafios:** manter os dados atualizados, integrar farmácias (preço e disponibilidade) e garantir a confiabilidade dos dados.

## 9. Regras e princípios para o desenvolvimento

- O app **informa**, não orienta tratamento. Exibir aviso de que não substitui médico/farmacêutico.
- Sem venda, pagamento ou delivery no MVP.
- Todo preço deve ter **data de atualização** visível (meta: atualizado em até 7 dias).
- Bulas vêm da **fonte oficial da Anvisa**.
- Dados pessoais tratados conforme a **LGPD**.

## 10. Decisões em aberto

- [ ] Banco de dados: Firebase ou PostgreSQL + PostGIS
- [ ] Mapas: Google Maps Platform ou MapLibre
- [ ] Confirmar back-end (FastAPI vs NestJS) — o plano indica Python
