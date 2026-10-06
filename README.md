# RepoChat

RepoChat connects to your GitHub account, indexes your repositories into PostgreSQL using pgvector embeddings, and lets you chat with your codebase using retrieval-augmented answers and precise file citations.

## Tech Stack

- **Backend**: Spring Boot 4, Spring AI, Java 26, Gradle
- **Database**: PostgreSQL 16 with PGVector
- **Frontend**: Next.js 16 (Turbopack, React 19, Tailwind CSS)
- **AI Providers**: Decoupled routing supporting Google Gemini and OpenAI

## Setup & Running

### 1. Database
```bash
docker compose up -d
```

### 2. Backend
Configure your `.env` or `application.properties` with your credentials, then run:
```bash
cd backend
./gradlew bootRun
```

### 3. Frontend
```bash
cd client
npm run dev
```
