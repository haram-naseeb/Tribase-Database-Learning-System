# LearnDB

LearnDB is an interactive, gamified learning platform for mastering PostgreSQL, MongoDB, and Neo4j. It provides a modern, deep-space themed interface inspired by developer IDEs and premium learning platforms.

## Features

- **Multi-Database Support**: Learn relational (PostgreSQL), document (MongoDB), and graph (Neo4j) databases.
- **Interactive Sandboxes**: Execute real queries using an embedded Monaco Editor with custom Cypher syntax highlighting.
- **Gamified Progression**: Earn XP, level up, maintain streaks, and collect badges.
- **Quizzes**: Test your knowledge with interactive, multi-format quizzes.
- **Leaderboard**: Compete globally with other learners.
- **Certificates**: Generate beautiful, downloadable PDF certificates upon module completion.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Monaco Editor, Recharts, React-PDF
- **Backend**: Node.js, Express, JWT
- **Databases**: PostgreSQL, MongoDB, Neo4j, Redis

## Setup Instructions

### 1. Start Infrastructure

The application relies on PostgreSQL, MongoDB, Neo4j, and Redis. Start them using Docker:

```bash
docker compose up -d
```

### 2. Setup Backend

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and adjust if necessary:

```bash
cp .env.example .env
```

Seed the databases with sample data:

```bash
node seeds/postgresSeed.js
node seeds/mongoSeed.js
node seeds/neo4jSeed.js
```

Start the backend server:

```bash
npm run dev
# or
node index.js
```

### 3. Setup Frontend

Navigate to the `client` directory and install dependencies:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to start learning!

## Architecture Highlights

- **Security**: Application-layer filtering ensures write operations are blocked in practice sandboxes for MongoDB and Neo4j, while Postgres executes in read-only mode with strict timeouts.
- **Aesthetics**: Glassmorphism, tailored accent colors for each database type, and micro-animations deliver a premium feel.
