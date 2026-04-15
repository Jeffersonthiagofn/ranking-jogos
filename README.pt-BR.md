# Ranking de Jogos Steam

Aplicação full stack para construir um ranking de jogos da Steam a partir de uma base própria, enriquecida automaticamente com dados públicos da plataforma. O projeto combina um **backend em Node.js + GraphQL + MongoDB** com um **frontend em React + Vite**, permitindo explorar jogos, filtrar rankings, comparar títulos, favoritar itens e sincronizar a biblioteca do usuário com a Steam.

---

## Sumário

- [Visão geral](#visão-geral)
- [Como o projeto funciona](#como-o-projeto-funciona)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Executando com Docker](#executando-com-docker)
- [Executando sem Docker](#executando-sem-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Fluxo de autenticação e integração com Steam](#fluxo-de-autenticação-e-integração-com-steam)
- [Operações de dados e ingestão](#operações-de-dados-e-ingestão)
- [GraphQL](#graphql)
- [Seção de mídia no README](#seção-de-mídia-no-readme)
- [Melhorias futuras](#melhorias-futuras)

---

## Visão geral

O objetivo do projeto é criar uma experiência de descoberta e análise de jogos da Steam em cima de uma base local. Em vez de depender apenas de chamadas pontuais em tempo real, o backend mantém uma coleção própria de jogos no MongoDB e atualiza esses dados de forma recorrente.

Na prática, o sistema:

- importa a lista base de aplicações da Steam;
- enriquece os jogos com detalhes adicionais;
- expõe tudo via GraphQL;
- entrega uma interface web para navegação, ranking, comparação e perfil do usuário.

---

## Como o projeto funciona

### 1. Ingestão inicial
Quando o backend sobe, ele verifica se a base está vazia ou abaixo do limite esperado. Se necessário, dispara uma ingestão automática da lista de apps da Steam e salva os registros no MongoDB.

### 2. Enriquecimento incremental
Após a ingestão base, um worker processa os jogos pendentes em lotes e busca informações adicionais, como:

- detalhes da loja;
- preço;
- quantidade de jogadores ativos;
- avaliações;
- conquistas.

### 3. Atualização recorrente
O projeto agenda tarefas periódicas para continuar enriquecendo os jogos e reprocessar registros antigos, mantendo os dados mais relevantes atualizados.

### 4. Camada GraphQL
O backend disponibiliza queries e mutations para que o frontend consulte a base, filtre rankings, pesquise jogos, recupere detalhes, faça login, sincronize a biblioteca e gerencie favoritos.

### 5. Experiência no frontend
O frontend consome a API GraphQL e os endpoints de autenticação para montar as páginas de dashboard, ranking, comparação, detalhes do jogo e perfil do usuário.

---

## Funcionalidades

### Dashboard
Página inicial com visão rápida da plataforma, incluindo jogos em destaque e indicadores agregados.

### Ranking de jogos
Permite navegar pela base com:

- ordenação por popularidade;
- ordenação por jogadores ativos;
- ordenação por lançamento;
- ordenação por maior e menor preço;
- filtro por gênero;
- paginação.

### Detalhes do jogo
Exibe informações enriquecidas de cada jogo, como descrição, imagens, desenvolvedor, data de lançamento, gêneros, jogadores ativos, preço, nota/ranking e conquistas.

### Comparação entre jogos
Tela dedicada para selecionar e comparar dois títulos lado a lado em métricas como jogadores ativos, classificação, preço e achievements.

### Autenticação
O sistema possui cadastro e login próprios.

### Perfil do usuário
Área protegida com foco no usuário autenticado, incluindo:

- favoritos;
- top jogos da biblioteca sincronizada;
- integração com a conta Steam.

### Integração com Steam
O usuário pode vincular a conta Steam e sincronizar sua biblioteca, permitindo que o sistema exiba jogos possuídos, tempo jogado e progresso relacionado às conquistas.

---

## Arquitetura

```text
[Steam APIs / Steam Store / Steam Profile]
                 |
                 v
        [Backend Node.js + Express]
                 |
      +----------+----------+
      |                     |
      v                     v
[Pipeline de ingestão]   [API GraphQL + Auth]
      |                     |
      +----------+----------+
                 |
                 v
            [MongoDB]
                 |
                 v
      [Frontend React + Vite]
```

### Backend
Responsável por:

- ingestão da base da Steam;
- enriquecimento dos jogos;
- autenticação;
- integração com Steam;
- API GraphQL;
- rotas auxiliares administrativas.

### Frontend
Responsável por:

- renderizar a interface;
- consumir GraphQL;
- autenticar usuários;
- exibir rankings, detalhes, comparação e perfil.

### Banco de dados
O MongoDB armazena tanto os dados dos jogos quanto os dados dos usuários.

---

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- Apollo Server
- GraphQL
- MongoDB + Mongoose
- Passport Steam
- JWT
- node-cron

### Frontend
- React
- React Router
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Infraestrutura
- Docker
- Docker Compose

---

## Estrutura do projeto

```text
ranking-jogos/
├── backend/
│   ├── src/
│   │   ├── graphql/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Configuração do ambiente

### Pré-requisitos

Para executar o projeto, você vai precisar de:

- [Node.js](https://nodejs.org/) instalado;
- [npm](https://www.npmjs.com/);
- [MongoDB](https://www.mongodb.com/) local ou em container;
- uma chave da API da Steam;
- Docker e Docker Compose, caso queira subir tudo em containers.

---

## Executando com Docker

Essa é a forma mais prática para rodar o projeto.

### 1. Clone o repositório

```bash
git clone https://github.com/Jeffersonthiagofn/ranking-jogos.git
cd ranking-jogos
```

### 2. Crie os arquivos `.env`

Copie os exemplos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Depois, ajuste os valores necessários, principalmente a `STEAM_API_KEY`, `JWT_SECRET` e `ADMIN_SECRET`.

### 3. Suba os serviços

```bash
docker compose up --build
```

### 4. Acesse a aplicação

- Frontend: `http://localhost:5173`
- Backend / GraphQL: `http://localhost:8080/graphql`
- MongoDB: `mongodb://localhost:27017`

---

## Executando sem Docker

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

### Banco de dados

Garanta que o MongoDB esteja rodando e que a variável `MONGO_URL` esteja apontando corretamente para ele.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

Exemplo baseado no arquivo `.env.example`:

```env
STEAM_API_KEY=sua_chave_da_API_do_Steam_aqui
MONGO_URL=mongodb://database:27017/rankingDeJogos
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
PORT=8080
JWT_SECRET=sua_chave_secreta_aqui
ADMIN_SECRET=seu_segredo_de_administrador_aqui
STEAM_MAX_RESULTS=100000
STEAM_HEALTH_THRESHOLD=80000
STEAM_LANG=brazilian
STEAM_CC=br
```

### Frontend (`frontend/.env`)

```env
VITE_GRAPHQL_URL=http://localhost:8080/graphql
VITE_API_URL=http://localhost:8080
```

---

## Fluxo de autenticação e integração com Steam

O projeto trabalha com dois cenários principais:

### Login local
O usuário cria conta com nome, e-mail e senha. Após o login, o frontend salva o token JWT e consulta o usuário autenticado.

### Vincular conta Steam
O usuário autenticado pode iniciar o fluxo de autenticação Steam para conectar a conta. Quando a autenticação retorna com sucesso:

- o backend vincula o `steamId` ao usuário;
- sincroniza os dados da biblioteca;
- redireciona o usuário de volta ao frontend.

Também existe um fluxo de login via Steam, dependendo do uso definido na interface.

---

## Operações de dados e ingestão

### Ingestão automática
Ao iniciar, o backend executa uma checagem da base. Se a quantidade de registros estiver abaixo do limite configurado, o processo de ingestão base é acionado automaticamente.

### Enriquecimento em lotes
Depois disso, o serviço processa jogos pendentes e adiciona metadados relevantes para o ranking e para as páginas de detalhes.

### Atualização agendada
- a cada 2 minutos, o projeto busca o próximo lote de jogos para enriquecimento;
- diariamente, jogos antigos podem voltar para a fila de atualização.

### Importante
Na primeira execução, é normal que a base ainda esteja sendo preenchida. Por isso, a interface pode começar com dados parciais e ir ficando mais completa conforme o pipeline avança.

---

## GraphQL

A API principal está disponível em:

```txt
http://localhost:8080/graphql
```
### Mutações de autenticação

#### 1. Cadastre um novo usuário

Cria uma nova conta no MongoDB com uma senha criptografada.

```graphql
mutation Register {
  register(name: "John Doe", email: "john@test.com", password: "securepassword123")
}
```

#### 2. Login

##### Utilizando o token JWT

Inclua o token nas solicitações:

`Authorization: Bearer <your_jwt_token>`

Autentica o usuário e retorna um token JWT. Você deve incluir esse token no cabeçalho de Autorização para rotas protegidas.

```graphql
mutation Login {
  login(email: "john@test.com", password: "securepassword123") {
    msg
    token
  }
}
```

### Mutações de usuário protegidas
#### 3. Sincronizar Biblioteca Steam

Requer um JWT válido nos cabeçalhos HTTP.

Extrai os jogos base e o tempo de jogo do usuário a partir da API do Steam e atualiza seu perfil no banco de dados.

```graphql
mutation SyncLibrary {
  syncMyLibrary
}
```

### Consultas públicas
#### 4. Obtenha o perfil do usuário

Recupera o perfil do usuário pelo seu ID do MongoDB, incluindo seus jogos sincronizados e detalhes de jogos resolvidos dinamicamente.

```graphql
query GetFullProfile {
  getUser(id: "USER_MONGODB_ID_HERE") {
    name
    ownedGames {
      playtime_forever
      gameDetails {
        name
        thumb
      }
    }
  }
}
```

#### 5. Obtenha a lista global de jogos (paginada)

Obtém uma lista de todos os jogos armazenados no banco de dados global. Suporta limites e deslocamentos para paginação.

```graphql
query GetAllGames {
  getGames(limit: 20, offset: 0) {
    appid
    name
    thumb
  }
}
```

### Consultas de usuários protegidos
#### 6. Obtenha conquistas no jogo

Requer um JWT válido nos cabeçalhos HTTP.

Obtém diretamente da API do Steam as conquistas desbloqueadas do usuário para um jogo específico.

```graphql
query GetAchievements {
  getGameAchievements(appid: 730) {
    name
    description
    completion_percentage
  }
}
```
