# Steam Data Ingestion Engine & GraphQL API

A highly resilient backend pipeline designed to ingest and enrich the entire Steam catalog (100,000+ applications) using Node.js, Express, and MongoDB, with a fully integrated GraphQL API for user library synchronization.

## Table of Contents

- [Features](#features)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Ingestion Pipeline](#ingestion-pipeline)
- [Setup](#setup)
- [API Endpoints](#api-endpoints-and-operations)
- [GraphQL API](#graphql-api)

## Features

- Self-Healing Ingestion  
  Uses threshold checks and unordered MongoDB bulk inserts to seamlessly resume operations if the server crashes mid-ingestion.

- Fault-Tolerant Enrichment  
  Wraps external API calls in granular try/catch blocks ensuring that partial data (for example missing reviews) does not halt the processing of other valid data (for example pricing).

- Rate Limit Management  
  Implements asynchronous delays and batch limits to prevent IP blacklisting from Valve's servers.

- Secured Endpoints  
  Protects administrative triggers using custom header-based middleware.

- GraphQL API  
  Provides a strictly typed interface for user authentication, Steam profile linking, and library synchronization.

## Overview

This service operates in three main phases:

1. Initial Seeding  
   Detects if the database is empty or partially populated, then dynamically pages through the Steam API to ingest all existing application IDs (100,000+ records) with built-in crash recovery.

2. Continuous Enrichment  
   A background worker iteratively processes batches of pending games, communicating with multiple Steam endpoints to fetch pricing, live player counts, achievements, and review scores, while strictly adhering to API rate limits.

3. User Library Integration  
   Authenticated users can link their Steam accounts to seamlessly fetch and synchronize their personal game libraries, playtime data, and achievements via GraphQL.

## Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **API Layer:** GraphQL (Apollo Server)  
- **Database:** MongoDB (via Mongoose)  
- **HTTP Client:** Node Fetch / Axios  
- **Infrastructure:** Docker & Docker Compose

## Project Structure

```text
RANKING-JOGOS/
├── mongo-data/          # Local MongoDB data persistence (via Docker)
├── node_modules/        # Project dependencies
├── src/                 # Main application source code
│   ├── graphql/         # GraphQL schema and resolvers
│   │   ├── resolvers.js
│   │   └── typeDefs.js
│   ├── middlewares/     # Custom Express middlewares
│   │   ├── adminAuth.js
│   │   └── authMiddleware.js
│   ├── models/          # Mongoose database schemas
│   │   ├── Game.js
│   │   └── User.js
│   ├── routes/          # REST endpoints
│   │   ├── adminRoutes.js
│   │   └── steamAuth.js
│   ├── services/        # Steam API integration, ingestion logic, and enrichment workers
│   │   └── steamService.js
│   └── app.js           # Express/Apollo server entry point
├── .dockerignore
├── .env                 # Environment variables (not tracked in git)
├── .env.example         # Template for required environment variables
├── .gitignore
├── docker-compose.yml   # Docker configuration for app and database
├── Dockerfile           # Docker image instructions for Node app
├── package-lock.json
├── package.json
└── README.md
```

## Ingestion Pipeline

The ingestion system runs in two stages:

1. **Seeder**  
   Fetches the full list of Steam application IDs and inserts them into MongoDB.

2. **Enrichment Worker**  
   Processes pending games in batches and fetches additional metadata:
   - Store details
   - Pricing information
   - Player counts
   - Review scores
   - Achievements
     
---

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory of the project and add the following keys:

```env
STEAM_API_KEY=your_steam_api_key_here
ADMIN_SECRET=your_secure_admin_password
JWT_SECRET=your_super_secret_jwt_key
MONGO_URI=mongodb://mongo:27017/steam_db
PORT=3000
```

### Running the Application

#### 2. Start with Docker (Recommended)

The application is fully containerized. To start the database and the Node.js server simultaneously, run:

```bash
docker compose up --build
```

The server will automatically detect an empty database and begin the seeding process upon initialization.

The GraphQL Playground will be available at:

`http://localhost:3000/graphql`

## API Endpoints and Operations

### Administrative Routes (REST)

Requires the x-admin-secret header to match the ADMIN_SECRET environment variable.

#### GET /admin/ingest-steam-ids

**Description**

Manually triggers the database health check and ingestion process.

**Response**

Returns a JSON object detailing the status (skipped or completed) and the number of processed records.

## GraphQL API

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
