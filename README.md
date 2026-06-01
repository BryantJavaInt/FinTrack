# FinTrack

**A full-stack personal finance platform with multi-currency support, secure authentication and real-time exchange-rate integration.**

![Java 21](https://img.shields.io/badge/Java-21-007396?style=flat-square&logo=java)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.4.1-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)
![Testcontainers](https://img.shields.io/badge/Testcontainers-1.21-black?style=flat-square)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)

---

## Overview

FinTrack is a personal finance manager designed with a fintech and banking mindset. It allows users to register, manage accounts in multiple currencies (CHF, EUR, USD, GBP), track income and expenses, and view a live financial summary with real-time exchange-rate conversion via the Frankfurter API.

The project demonstrates clean backend architecture, DTO-first API design, database migration discipline, integration testing with real containers, and a modern React frontend — all wired together through Docker and validated by a CI pipeline.

---

## Key Features

- User registration and login with hashed passwords
- JWT-based stateless authentication
- Account management with currency selection
- Income and expense transaction tracking
- Multi-currency support: CHF, EUR, USD, GBP
- Real-time exchange-rate integration (Frankfurter API)
- Single-page dashboard: net worth card, balance-by-currency bar chart, accounts list, recent transactions table
- Inline forms to create accounts and transactions (modal) without leaving the dashboard
- Protected frontend routes (redirect to login when unauthenticated)
- PostgreSQL persistence with Flyway schema migrations
- Dockerized local environment via Docker Compose
- Unit and integration tests (Testcontainers + Mockito)
- GitHub Actions CI pipeline

---

## Why FinTrack

FinTrack was built to demonstrate the kind of engineering discipline expected in backend and full-stack roles in fintech and banking:

- **Secure API development** — Spring Security, stateless JWT, no session exposure
- **DTO-first API design** — entities are never serialised directly; every endpoint works with mapped records
- **Clean backend layering** — Controller → Service → Repository, each layer with a single responsibility
- **Database migration discipline** — Flyway owns the schema lifecycle; Hibernate only validates against it
- **Testable currency conversion logic** — `ExchangeRateService` is an interface, injected as a mock in unit tests
- **Integration testing with real containers** — Testcontainers spins up a real PostgreSQL 16 instance per test run
- **Frontend/backend integration** — Axios client with JWT interceptor, React Context for auth state
- **Infrastructure awareness** — Docker Compose, GitHub Actions, Nginx for the frontend container

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.4.1 |
| Spring Security | 6 |
| JWT (JJWT) | 0.12.6 |
| Spring Data JPA | included in Boot |
| PostgreSQL | 16 |
| Flyway | included in Boot |
| Lombok | included in Boot |
| Maven | 3.9 (wrapper) |
| Testcontainers | 1.21.4 |
| Mockito | included in Boot Test |
| OpenAPI / Swagger | springdoc 2.7.0 |

### Frontend
| Technology | Version / Notes |
|---|---|
| React | 18.3 |
| TypeScript | 5.7 |
| Vite | 6.0 |
| Axios | 1.7 — HTTP client with JWT interceptor |
| Recharts | 2.14 — balance bar chart |
| React Router | 6.28 — client-side routing |
| Context API | auth state management |

### Infrastructure
| Technology | Notes |
|---|---|
| Docker | containerisation |
| Docker Compose | local orchestration |
| GitHub Actions | CI pipeline |
| Nginx | frontend container server |

---

## Architecture

FinTrack uses a **package-by-feature** layout. Each domain concept (`user`, `auth`, `account`, `transaction`, `currency`, `security`, `config`, `exception`) owns its controller, service, repository and DTOs. Entities are never serialised to the API.

```
React UI
  ↓
Axios Client (JWT interceptor)
  ↓
Spring Boot REST API
  ↓
Service Layer
  ↓
Repository Layer (Spring Data JPA)
  ↓
PostgreSQL
```

Key design decisions:

- **`ExchangeRateService` interface** — decouples the Frankfurter HTTP call from business logic; injectable mock in unit tests
- **`GlobalExceptionHandler`** — produces a consistent `ApiError` record (timestamp, status, error, message, path) on every error
- **Bean Validation** — all request DTOs are annotated with `@Valid` and Jakarta constraints
- **Stateless JWT** — no `HttpSession`, no CSRF exposure on the API; token stored in memory on the frontend (never `localStorage`)
- **`ddl-auto=validate`** — Flyway owns schema changes; Hibernate validates the schema on startup and fails fast if there is a mismatch

---

## Testing

| Test | What it covers |
|---|---|
| `SummaryServiceTest` | Currency conversion logic, mocked `ExchangeRateService`, net-worth calculation |
| `AuthAndTransactionIT` | Full flow: register → login → create account → create transaction (201) |
| `AuthAndTransactionIT` (negative) | 401 on wrong password |

Integration tests use **Testcontainers** to spin up a real PostgreSQL 16 container. Flyway applies migrations automatically before Spring context starts. No mocked database.

---

## Local Development

### Prerequisites

- Java 21
- Node 24
- npm
- Docker Desktop
- Git

### Backend

```bash
cd fintrack/backend
./mvnw verify
```

Windows:
```powershell
cd fintrack\backend
.\mvnw.cmd verify
```

### Frontend

```bash
cd fintrack/frontend
npm install
npm run build
npm run dev
```

### Docker Compose (full stack)

```bash
cd fintrack
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8080
- Swagger UI → http://localhost:8080/swagger-ui/index.html

---

## Environment Variables

| Variable | Description |
|---|---|
| `DB_URL` | JDBC URL for PostgreSQL |
| `DB_USER` | Database username |
| `DB_PASS` | Database password |
| `JWT_SECRET` | HS256 signing secret (minimum 256 bits) |
| `VITE_API_URL` | Backend base URL for the frontend build |

Real secrets must never be committed. Use `.env` files locally (already in `.gitignore`) and GitHub Actions secrets for CI.

---

## API Documentation

Swagger UI is available when the backend is running:

```
http://localhost:8080/swagger-ui/index.html
```

---

## Project Structure

```
FinTrack/
  fintrack/
    backend/          Spring Boot application
    frontend/         React + TypeScript application
    docker-compose.yml
  .github/
    workflows/
      ci.yml
  README.md
  .gitignore
```

---

## Roadmap

- Live deployment (Railway / Render / VPS)
- Real screenshots and demo video
- Budget analytics and category breakdown
- CSV / PDF export
- Improved frontend code-splitting
- Refresh-token strategy
- Additional financial insights (monthly trends, savings rate)

---

## Author

Built by Bryant Giorgini
Junior Software Developer | Backend & Full-Stack oriented

---

## License

License to be defined.
