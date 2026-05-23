# Tribase — Setup Guide for New Developers

## What Your Friend Needs to Install First

| Software | Download Link | Required For |
|---|---|---|
| **Node.js** (v18+) | https://nodejs.org | Running the app |
| **PostgreSQL** (v14+) | https://postgresql.org/download | Auth, progress, leaderboard |
| **MongoDB** (Community) | https://www.mongodb.com/try/download/community | MongoDB sandbox lessons |
| **Neo4j Desktop** | https://neo4j.com/download | Neo4j graph lessons |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/TriBase.git
cd TriBase
```

---

## Step 2 — Install Dependencies

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

---

## Step 3 — Set Up PostgreSQL

Open **pgAdmin** or **psql** and run:

```sql
-- Create a user for the app
CREATE USER learndb_admin WITH PASSWORD 'learndb_password';

-- Create the database
CREATE DATABASE learndb OWNER learndb_admin;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE learndb TO learndb_admin;
```

---

## Step 4 — Set Up MongoDB

MongoDB usually works out of the box with no setup needed.
Just make sure the **MongoDB service is running** (check Windows Services or run `mongod`).

---

## Step 5 — Set Up Neo4j

1. Open **Neo4j Desktop**
2. Create a **New Project** → Add a **Local DBMS**
3. Set the password to whatever you want (you'll put it in `.env` next)
4. Click **Start** to run the database

---

## Step 6 — Create the `.env` File

In the **root of the project** (`TriBase/`), create a file named `.env`:

```env
PORT=5000

# PostgreSQL
POSTGRES_USER=learndb_admin
POSTGRES_PASSWORD=learndb_password
POSTGRES_DB=learndb
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# MongoDB (no auth needed for local install)
MONGO_URI=mongodb://localhost:27017/learndb_social

# Neo4j — use YOUR password set in Neo4j Desktop
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=YOUR_NEO4J_PASSWORD_HERE
NEO4J_ENABLED=true

# JWT
JWT_SECRET=any_random_secret_string_here
JWT_EXPIRES_IN=7d

# Redis (optional, disabled by default)
REDIS_ENABLED=false
```

> ⚠️ Change `YOUR_NEO4J_PASSWORD_HERE` to your actual Neo4j password!

---

## Step 7 — Seed the Databases (Creates All Tables + Sample Data)

```bash
cd server
npm run seed:all
```

This runs all three seeds:
- **PostgreSQL** → Creates tables (users, progress, leaderboard) + sample data
- **MongoDB** → Creates collections (users, posts, messages, notifications)
- **Neo4j** → Creates nodes (Person, Movie, Genre, Studio, Award) + relationships

---

## Step 8 — Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Wait for: `Tribase API running at http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Wait for: `Local: http://localhost:5173/`

---

## Step 9 — Open in Browser

```
http://localhost:5173
```

Register a new account and start learning!

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ECONNREFUSED 5432` | PostgreSQL is not running — start it in Services |
| `ECONNREFUSED 27017` | MongoDB is not running — start it or run `mongod` |
| `Neo4j connection failed` | Start the DB in Neo4j Desktop; check password in `.env` |
| `relation "platform_users" does not exist` | Run `npm run seed:postgres` again |
| `Cannot find module` | Run `npm install` in both `server/` and `client/` folders |
| Port 5000 already in use | Change `PORT=5001` in `.env` and update client API calls |
