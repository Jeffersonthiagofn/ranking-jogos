Steam Data Ingestion Engine

A highly resilient automated backend pipeline designed to fetch, store, and continuously enrich data for the entire Steam catalog.
Built with Node.js, Express, MongoDB, and GraphQL, the system supports large-scale ingestion (150k+ apps) and user Steam library synchronization.

Overview

The system operates in three main phases:

1. Initial Seeding

When the server starts, the system checks if the database is empty or partially populated.

If required, it:

Dynamically pages through the Steam API

Retrieves all available Steam application IDs (150,000+)

Inserts records in batches

Supports automatic crash recovery

2. Continuous Enrichment

A background worker continuously processes pending game records and enriches them with additional data from multiple Steam endpoints:

Pricing information

Live player counts

Achievements

Review scores

The system includes:

Strict API rate limit management

Fault-tolerant data collection

Batch processing to prevent request overload

3. User Library Integration

Authenticated users can link their Steam accounts to:

Fetch their owned games

Synchronize playtime data

Store their library inside the platform database

This enables user-specific analytics and profile features.

Core Features
Self-Healing Ingestion

Uses threshold checks to detect incomplete ingestion

Performs unordered MongoDB bulk inserts

Automatically resumes ingestion after server crashes

Fault-Tolerant Enrichment

External API requests are wrapped in granular try/catch blocks.

Example:

If the reviews endpoint fails, the system can still save:

pricing data

player counts

achievements

This ensures one failing endpoint does not halt the pipeline.

Rate Limit Management

To prevent Steam API throttling or IP bans:

Requests are processed in controlled batches

Asynchronous delays between calls

Worker queue limits are enforced

Secured Administrative Endpoints

Administrative triggers are protected using custom header-based authentication middleware.

Only requests containing the correct secret can execute ingestion commands.

GraphQL API

A fully typed GraphQL layer handles user-facing functionality:

Authentication

Steam profile linking

Library synchronization

User profile queries

Tech Stack
Layer	Technology
Runtime	Node.js
Framework	Express.js
API Layer	GraphQL (Apollo Server)
Database	MongoDB
ODM	Mongoose
HTTP Client	Axios / Node Fetch
Infrastructure	Docker + Docker Compose
Environment Variables

Create a .env file in the project root:

STEAM_API_KEY=your_steam_api_key_here
ADMIN_SECRET=your_secure_admin_password
JWT_SECRET=your_jwt_signing_secret_here
MONGO_URI=mongodb://mongo:27017/steam_db
PORT=3000
API Endpoints
Administrative Routes (REST)

These routes require the header:

x-admin-secret: ADMIN_SECRET
GET /admin/ingest-steam-ids

Description

Manually triggers the ingestion process.

The system:

Checks database health

Determines if ingestion is required

Processes Steam application IDs

Response Example

{
  "status": "completed",
  "processedRecords": 150432
}

Possible statuses:

completed

skipped (database already populated)

GraphQL Operations

The GraphQL API powers all user-facing functionality.

Mutation: SyncLibrary

Synchronizes a user's Steam library.

Requirements

Valid JWT in the Authorization header

Behavior

Calls Steam's GetOwnedGames

Fetches:

owned games

playtime

Updates the user profile in the database

Query: GetFullProfile

Fetches a public user profile.

Parameters

id: ID!

Returns

User information

Synced Steam library

Total playtime

Running the Application

The entire system is fully containerized.

Start all services with:

docker compose up --build

This will start:

MongoDB container

Node.js backend server

Automatic Startup Behavior

When the server launches, it automatically:

Checks the database state

Detects missing Steam data

Starts the initial seeding process

No manual ingestion is required if the database is empty.

System Design Principles

This project was built with the following goals:

Resilience — the pipeline recovers from crashes automatically

Scalability — handles 150k+ Steam applications

Fault tolerance — individual API failures do not break processing

Automation — ingestion and enrichment run continuously

Security — administrative actions are protected