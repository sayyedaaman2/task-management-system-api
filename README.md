# Task Management System API

A production-ready RESTful API built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, and **Redis**.

🚀 **Live URL:** [https://task-management-system-api-c0j6.onrender.com](https://task-management-system-api-c0j6.onrender.com)

📖 **Swagger Docs:** [https://task-management-system-api-c0j6.onrender.com/api-docs](https://task-management-system-api-c0j6.onrender.com/api-docs)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Docker](#docker)
- [License](#license)

---

## Features

- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin / User)
- Task CRUD with pagination, filtering, sorting, and search
- Redis caching for performance optimization
- Rate limiting and security headers (Helmet, CORS)
- Request validation with Joi
- Structured logging with Pino
- Swagger UI API documentation
- 87 tests across unit and integration suites
- CI/CD via GitHub Actions

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Runtime    | Node.js 20                               |
| Language   | TypeScript                               |
| Framework  | Express 5                                |
| Database   | MongoDB Atlas                            |
| Cache      | Redis (RedisLabs)                        |
| Auth       | JWT (Access + Refresh Tokens)            |
| Validation | Joi                                      |
| Logging    | Pino                                     |
| Testing    | Jest + Supertest + mongodb-memory-server |
| Docs       | Swagger UI                               |
| CI/CD      | GitHub Actions                           |
| Container  | Docker                                   |
| Hosting    | Render                                   |

---

## Project Structure

```
src/
├── config/          # Environment config, Swagger setup
├── controller/      # Route handlers
├── lib/             # MongoDB and Redis connections
├── middleware/       # Auth, CORS, rate limit, cache, error handling
├── model/           # Mongoose models
├── routes/          # Express routers with Swagger annotations
├── seeders/         # Database seeders
├── service/         # Business logic
├── types/           # TypeScript type extensions
├── utils/           # JWT, hash, logger, error, cache utilities
├── validation/      # Joi validation schemas
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- Redis account (RedisLabs)

### Installation

```bash
git clone https://github.com/sayyedaaman2/task-management-system-api.git
cd task-management-system-api
npm install
```

### Development

```bash
cp .env.example .env.development
# Fill in your environment variables
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Seed Database

```bash
npm run seed
```

---

## Environment Variables

Create a `.env.development` file:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.fwudizk.mongodb.net/task-management?appName=Cluster0

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=redis-xxxxx.c98.us-east-1-4.ec2.cloud.redislabs.com
REDIS_PORT=10839
REDIS_TTL=300
```

---

## API Documentation

Swagger UI is available at:

```
https://task-management-system-api-c0j6.onrender.com/api-docs
```

### How to authenticate in Swagger

1. Register a user via `POST /api/v1/auth/register`
2. Login via `POST /api/v1/auth/login`
3. Copy the `accessToken` from the response
4. Click the **Authorize** button in Swagger UI
5. Paste the token and click **Authorize**

---

## Authentication

This API uses JWT-based authentication:

| Token         | Expiry | Storage         |
| ------------- | ------ | --------------- |
| Access Token  | 1 hour | Response body   |
| Refresh Token | 7 days | HttpOnly cookie |

All protected routes require the `Authorization: Bearer <accessToken>` header.

---

## API Endpoints

Base URL: `https://task-management-system-api-c0j6.onrender.com/api/v1`

### Auth — `/api/v1/auth`

| Method | Endpoint         | Access    | Description              |
| ------ | ---------------- | --------- | ------------------------ |
| POST   | `/register`      | Public    | Register new user        |
| POST   | `/login`         | Public    | Login user or admin      |
| GET    | `/refresh-token` | Protected | Refresh access token     |
| GET    | `/profile`       | Protected | Get current user profile |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Access | Description               |
| ------ | -------- | ------ | ------------------------- |
| POST   | `/`      | User   | Create task               |
| GET    | `/`      | User   | Get all tasks (paginated) |
| GET    | `/:id`   | User   | Get task by ID            |
| PUT    | `/:id`   | User   | Update task               |
| DELETE | `/:id`   | User   | Delete task               |

#### Query Parameters for GET `/tasks`

| Param    | Type    | Description                                           |
| -------- | ------- | ----------------------------------------------------- |
| page     | integer | Page number (default: 1)                              |
| limit    | integer | Items per page (default: 10, max: 100)                |
| search   | string  | Search by title                                       |
| status   | string  | `pending`, `in progress`, `completed`                 |
| priority | string  | `low`, `medium`, `high`                               |
| sortBy   | string  | `createdAt`, `title`, `priority`, `dueDate`, `status` |
| order    | string  | `asc`, `desc`                                         |

### Admin — `/api/v1/admin`

| Method | Endpoint           | Access | Description                 |
| ------ | ------------------ | ------ | --------------------------- |
| GET    | `/users`           | Admin  | Get all users (paginated)   |
| DELETE | `/users/:id`       | Admin  | Delete user                 |
| GET    | `/users/:id/tasks` | Admin  | Get tasks for specific user |
| GET    | `/tasks`           | Admin  | Get all tasks               |
| DELETE | `/tasks/:id`       | Admin  | Delete task                 |
| GET    | `/analytics`       | Admin  | Get system usage stats      |
| GET    | `/analytics/:id`   | Admin  | Get user activity stats     |

### Health

| Method | Endpoint  | Access | Description  |
| ------ | --------- | ------ | ------------ |
| GET    | `/health` | Public | Health check |

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- --testPathPatterns="auth.test.ts"
```

### Test Suites

| Suite                 | Tests  |
| --------------------- | ------ |
| auth.test.ts          | 11     |
| task.test.ts          | 11     |
| admin.test.ts         | 12     |
| hash.test.ts          | 4      |
| jwt.test.ts           | 13     |
| auth.service.test.ts  | 8      |
| task.service.test.ts  | 11     |
| admin.service.test.ts | 16     |
| **Total**             | **87** |

### Coverage Thresholds

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 80%       |
| Functions  | 80%       |
| Branches   | 60%       |
| Statements | 80%       |

---

## CI/CD

GitHub Actions pipeline runs on every push and pull request to `main`.

### CI Job

- Prettier format check
- Lint check
- Build app
- Run all tests with coverage
- Fail if coverage drops below threshold

### Required GitHub Secrets

```
JWT_SECRET
JWT_REFRESH_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
```

---

## Docker

### Build and run locally

```bash
docker build -t task-management-api .
docker run -p 3000:3000 --env-file .env.production task-management-api
```

### Deployed on Render

This API is containerized with Docker and deployed on [Render](https://render.com) using the `Dockerfile` at the root of the project.

Live: [https://task-management-system-api-c0j6.onrender.com](https://task-management-system-api-c0j6.onrender.com)

---

## Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start development server with hot reload |
| `npm run build`    | Compile TypeScript to JavaScript         |
| `npm start`        | Start production server                  |
| `npm test`         | Run test suite                           |
| `npm run lint`     | Run ESLint                               |
| `npm run lint:fix` | Fix ESLint errors                        |
| `npm run format`   | Format code with Prettier                |
| `npm run seed`     | Seed database with sample data           |

---

## License

ISC © [Sayyed Aaman](https://github.com/sayyedaaman2)
