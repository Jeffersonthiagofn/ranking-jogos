# Steam Data Ingestion Engine

A highly resilient, automated backend pipeline designed to fetch, store, and continuously enrich data for the entire Steam catalog using Node.js, Express, and MongoDB.


## Overview
This service operates in two main phases:
1. **Initial Seeding:** Detects if the database is empty or partially populated, then dynamically pages through the Steam API to ingest all existing application IDs (150,000+ records) with built-in crash recovery.
2. **Continuous Enrichment:** A background worker iteratively processes batches of pending games, communicating with multiple Steam endpoints to fetch pricing, live player counts, achievements, and review scores, while strictly adhering to API rate limits.

## Core Features
* **Self-Healing Ingestion:** Uses threshold checks and unordered MongoDB bulk inserts to seamlessly resume operations if the server crashes mid-ingestion.
* **Fault-Tolerant Enrichment:** Wraps external API calls in granular `try/catch` blocks ensuring that partial data (e.g., missing reviews) does not halt the processing of other valid data (e.g., pricing).
* **Rate Limit Management:** Implements asynchronous delays and batch limits to prevent IP blacklisting from Valve's servers.
* **Secured Endpoints:** Protects administrative triggers using custom header-based middleware.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **HTTP Client:** Axios
* **Infrastructure:** Docker & Docker Compose

## Environment Variables
Create a `.env` file in the root directory with the following variables:

STEAM_API_KEY=your_steam_api_key_here
ADMIN_SECRET=your_secure_admin_password
JWT_SECRET=your_jwt_signing_secret_here
MONGO_URI=mongodb://mongo:27017/steam_db
PORT=3000

## API Endpoints

### Administrative Routes
Requires the `x-admin-secret` header to match the `ADMIN_SECRET` environment variable.

* `GET /admin/ingest-steam-ids`
  * **Description:** Manually triggers the database health check and ingestion process.
  * **Response:** JSON object detailing the status (skipped or completed) and the number of processed records.

## Running the Application

The application is fully containerized. To start the database and the Node.js server, run:

docker compose up --build

The server will automatically detect an empty database and begin the seeding process upon initialization.