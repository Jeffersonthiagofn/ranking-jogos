# Steam Games Ranking

A full-stack application designed to build a Steam games ranking based on a local database that is automatically enriched with public data from the platform. The project combines a **Node.js + GraphQL + MongoDB backend** with a **React + Vite frontend**, allowing users to explore games, filter rankings, compare titles, favorite items, and sync their Steam library.

---

## Table of Contents

- [Overview](#overview)
- [How the Project Works](#how-the-project-works)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running with Docker](#running-with-docker)
- [Running without Docker](#running-without-docker)
- [Environment Variables](#environment-variables)
- [Authentication Flow and Steam Integration](#authentication-flow-and-steam-integration)
- [Data Operations and Ingestion](#data-operations-and-ingestion)
- [GraphQL](#graphql)
- [README Media Section](#readme-media-section)
- [Future Improvements](#future-improvements)

---

## Overview

The goal of the project is to create a Steam game discovery and analysis experience on top of a local database. Instead of relying only on real-time point-in-time requests, the backend maintains its own game collection in MongoDB and updates this data periodically.

In practice, the system:

- imports the base list of Steam applications;
- enriches games with additional details;
- exposes everything through GraphQL;
- delivers a web interface for browsing, ranking, comparison, and user profile management.

---

## How the Project Works

### 1. Initial Ingestion
When the backend starts, it checks whether the database is empty or below the expected threshold. If necessary, it triggers an automatic ingestion of the Steam app list and stores the records in MongoDB.

### 2. Incremental Enrichment
After the base ingestion, a worker processes pending games in batches and fetches additional information, such as:

- store details;
- price;
- active player count;
- reviews;
- achievements.

### 3. Recurring Updates
The project schedules periodic tasks to continue enriching games and reprocess older records, keeping the most relevant data up to date.

### 4. GraphQL Layer
The backend exposes queries and mutations so the frontend can query the database, filter rankings, search games, retrieve details, log in, sync the library, and manage favorites.

### 5. Frontend Experience
The frontend consumes the GraphQL API and authentication endpoints to build the dashboard, ranking, comparison, game details, and user profile pages.

---

## Features

### Dashboard
A homepage with a quick overview of the platform, including featured games and aggregated indicators.

### Game Ranking
Lets users browse the database with:

- sorting by popularity;
- sorting by active players;
- sorting by release date;
- sorting by highest and lowest price;
- genre filtering;
- pagination.

### Game Details
Displays enriched information for each game, such as description, images, developer, release date, genres, active players, price, score/ranking, and achievements.

### Game Comparison
A dedicated screen to select and compare two titles side by side using metrics such as active players, rating, price, and achievements.

### Authentication
The system includes its own registration and login flow.

### User Profile
A protected area focused on the authenticated user, including:

- favorites;
- top games from the synced library;
- Steam account integration.

### Steam Integration
Users can link their Steam account and sync their library, allowing the system to display owned games, playtime, and achievement-related progress.

---

## Architecture

```text
[Steam APIs / Steam Store / Steam Profile]
                 |
                 v
        [Backend Node.js + Express]
                 |
      +----------+----------+
      |                     |
      v                     v
[Ingestion Pipeline]   [GraphQL API + Auth]
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
Responsible for:

- Steam data ingestion;
- game enrichment;
- authentication;
- Steam integration;
- GraphQL API;
- auxiliary administrative routes.

### Frontend
Responsible for:

- rendering the interface;
- consuming GraphQL;
- authenticating users;
- displaying rankings, details, comparison, and profile pages.

### Database
MongoDB stores both game data and user data.

---

## Technologies Used

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

### Infrastructure
- Docker
- Docker Compose

---

## Project Structure

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

## Environment Setup

### Prerequisites

To run the project, you will need:

- [Node.js](https://nodejs.org/) installed;
- [npm](https://www.npmjs.com/);
- [MongoDB](https://www.mongodb.com/) locally or in a container;
- a Steam API key;
- Docker and Docker Compose, if you want to run everything in containers.

---

## Running with Docker

This is the easiest way to run the project.

### 1. Clone the repository

```bash
git clone https://github.com/Jeffersonthiagofn/ranking-jogos.git
cd ranking-jogos
```

### 2. Create the `.env` files

Copy the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then adjust the required values, especially `STEAM_API_KEY`, `JWT_SECRET`, and `ADMIN_SECRET`.

### 3. Start the services

```bash
docker compose up --build
```

### 4. Access the application

- Frontend: `http://localhost:5173`
- Backend / GraphQL: `http://localhost:8080/graphql`
- MongoDB: `mongodb://localhost:27017`

---

## Running without Docker

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

### Database

Make sure MongoDB is running and that the `MONGO_URL` variable points to it correctly.

---

## Environment Variables

### Backend (`backend/.env`)

Example based on the `.env.example` file:

```env
STEAM_API_KEY=your_steam_api_key_here
MONGO_URL=mongodb://database:27017/rankingDeJogos
BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
PORT=8080
JWT_SECRET=your_secret_key_here
ADMIN_SECRET=your_admin_secret_here
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

## Authentication Flow and Steam Integration

The project works with two main scenarios:

### Local Login
Users create an account with name, email, and password. After logging in, the frontend stores the JWT token and queries the authenticated user.

### Link Steam Account
Authenticated users can start the Steam authentication flow to connect their account. When authentication returns successfully:

- the backend links the `steamId` to the user;
- syncs the library data;
- redirects the user back to the frontend.

There is also a Steam login flow, depending on how it is used in the interface.

---

## Data Operations and Ingestion

### Automatic Ingestion
At startup, the backend checks the database. If the number of records is below the configured threshold, the base ingestion process is automatically triggered.

### Batch Enrichment
After that, the service processes pending games and adds relevant metadata for the ranking and detail pages.

### Scheduled Updates
- every 2 minutes, the project fetches the next batch of games for enrichment;
- daily, older games may return to the update queue.

### Important
On the first run, it is normal for the database to still be filling up. Because of that, the interface may start with partial data and gradually become more complete as the pipeline progresses.

---

## GraphQL

The main API is available at:

```txt
http://localhost:8080/graphql
```

### Authentication Mutations

#### 1. Register a New User

Creates a new account in MongoDB with a hashed password.

```graphql
mutation Register {
  register(name: "John Doe", email: "john@test.com", password: "securepassword123")
}
```

#### 2. Login

##### Using the JWT Token

Include the token in requests:

`Authorization: Bearer <your_jwt_token>`

Authenticates the user and returns a JWT token. You must include this token in the Authorization header for protected routes.

```graphql
mutation Login {
  login(email: "john@test.com", password: "securepassword123") {
    msg
    token
  }
}
```

### Protected User Mutations

#### 3. Sync Steam Library

Requires a valid JWT in the HTTP headers.

Fetches the user's base games and playtime from the Steam API and updates their profile in the database.

```graphql
mutation SyncLibrary {
  syncMyLibrary
}
```

### Public Queries

#### 4. Get User Profile

Fetches a user profile by their MongoDB ID, including their synced games and dynamically resolved game details.

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

#### 5. Get Global Games List (Paginated)

Fetches a list of all games stored in the global database. Supports limit and offset for pagination.

```graphql
query GetAllGames {
  getGames(limit: 20, offset: 0) {
    appid
    name
    thumb
  }
}
```

### Protected User Queries

#### 6. Get Game Achievements

Requires a valid JWT in the HTTP headers.

Fetches the user's unlocked achievements for a single specific game directly from the Steam API.

```graphql
query GetAchievements {
  getGameAchievements(appid: 730) {
    name
    description
    completion_percentage
  }
}
```
