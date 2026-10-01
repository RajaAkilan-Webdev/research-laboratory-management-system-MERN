# Research Laboratory Management System

A MERN-based Research Laboratory Management System for digitally managing experiments, protocols, reactions, observations, results, and experiment history. It provides role-based access for researchers and laboratory admins with secure authentication and structured laboratory record management.

## Project Topic

Research laboratories require structured recording of reactions, observations, protocols, and experiment history.

## Objective

Provide a simple digital laboratory notebook for researchers to manage experiments and related records, and for a laboratory admin to review researchers and all experiment records.

## Features

- Researcher registration and login with hashed passwords and JWT authentication
- Role-protected researcher and administrator pages and APIs
- Experiment create, view, update, and delete, with title search, status filters, and date sorting
- Multiple protocols, reactions, and observations per experiment
- Experiment result/finding field
- Chronological experiment history, including creation, updates, record additions, result updates, and deletion
- Researcher profile updates
- Admin dashboard summary, researcher list, and read-only laboratory record review

## User Roles

- **Researcher:** manages their profile, experiments, protocols, reactions, observations, results, and experiment history.
- **Laboratory Admin:** views researchers and laboratory records, reviews experiment details/history, and sees a simple dashboard summary.

New public registrations are always assigned the `researcher` role. The administrator is created using the seed script.

## Technology Stack

- Frontend: React, Vite, JavaScript, React Router, Axios, plain CSS
- Backend: Node.js, Express, REST APIs, JWT, bcryptjs, dotenv, cors
- Database: MySQL, Sequelize

## Architecture

The React client sends JSON requests to the Express REST API using Axios. Protected requests include a JWT bearer token. Express middleware verifies the token and role, controllers enforce experiment ownership, and Sequelize reads and writes the MySQL tables. Experiment changes create related history rows.

## Folder Structure

```text
research-laboratory-management/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seedAdmin.js
│   └── server.js
└── README.md
```

## Database Tables

- `users`: name, email, password hash, role, createdAt
- `experiments`: title, description, researcherId, date, status, result, createdAt, updatedAt
- `protocols`: experimentId, steps, materials, createdAt
- `reactions`: experimentId, reactants, products, conditions, createdAt
- `observations`: experimentId, observation, date, createdAt
- `experimenthistories`: experimentId, action, timestamp

A user can own many experiments. Each experiment can have many protocols, reactions, observations, and history entries. Foreign keys remove dependent experiments and records when their parent rows are deleted. Tables are created automatically when the backend starts.

## API Endpoints

All endpoints other than registration, login, and health require `Authorization: Bearer <token>` unless indicated.

| Method             | Endpoint                                     | Access                                                                     |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| GET                | `/api/health`                                | Public health check                                                        |
| POST               | `/api/auth/register`                         | Public; creates researcher                                                 |
| POST               | `/api/auth/login`                            | Public                                                                     |
| GET                | `/api/users`                                 | Admin                                                                      |
| GET / PUT          | `/api/users/:id`                             | Own user; admin may view any user                                          |
| GET / POST         | `/api/experiments`                           | Authenticated / researcher                                                 |
| GET / PUT / DELETE | `/api/experiments/:id`                       | Owner; admin may view                                                      |
| GET                | `/api/experiments/:id/history`               | Owner or admin                                                             |
| POST               | `/api/protocols`                             | Researcher                                                                 |
| GET                | `/api/protocols/experiment/:experimentId`    | Owner                                                                      |
| PUT / DELETE       | `/api/protocols/:id`                         | Owner                                                                      |
| POST               | `/api/reactions`                             | Researcher                                                                 |
| GET                | `/api/reactions/experiment/:experimentId`    | Owner                                                                      |
| PUT / DELETE       | `/api/reactions/:id`                         | Owner                                                                      |
| POST               | `/api/observations`                          | Researcher                                                                 |
| GET                | `/api/observations/experiment/:experimentId` | Owner                                                                      |
| PUT / DELETE       | `/api/observations/:id`                      | Owner                                                                      |
| GET                | `/api/admin/researchers`                     | Admin                                                                      |
| DELETE             | `/api/admin/researchers/:id`                 | Admin; also deletes the researcher's experiments and related records       |
| GET                | `/api/admin/experiments`                     | Admin                                                                      |
| GET                | `/api/admin/experiments/:id`                 | Admin; experiment and linked records for review                            |
| DELETE             | `/api/admin/experiments/:id`                 | Admin; also deletes linked protocols, reactions, observations, and history |
| GET                | `/api/admin/dashboard`                       | Admin                                                                      |

Experiment list accepts optional `search`, `status`, and `sort` query parameters.

## Installation

Prerequisites: Node.js (18 or newer), npm, and a running MySQL 8.0+ server. Create the database named in `MYSQL_DATABASE` before starting the backend (the default is `research_laboratory`).

From the project directory, configure the backend environment, then install and start each part in separate terminals:

```powershell
Copy-Item server/.env.example server/.env
cd server
npm install
npm run dev
```

In another terminal:

```powershell
cd client
npm install
npm run dev
```

Vite prints the client URL (normally `http://localhost:5173`). The API listens on port `5000` by default.

## Environment Variables

Set these in `server/.env`:

| Variable         | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `PORT`           | Express port; defaults to 5000                               |
| `MYSQL_HOST`     | MySQL server host; defaults to `127.0.0.1`                   |
| `MYSQL_PORT`     | MySQL server port; defaults to `3306`                        |
| `MYSQL_DATABASE` | MySQL database name; defaults to `research_laboratory`       |
| `MYSQL_USER`     | MySQL user; defaults to `root`                               |
| `MYSQL_PASSWORD` | MySQL password; defaults to an empty string                  |
| `JWT_SECRET`     | Long random secret used to sign JWTs                         |
| `CLIENT_ORIGIN`  | Allowed frontend origin; defaults to `http://localhost:5173` |

Never commit `.env`. The frontend can optionally set `VITE_API_URL` in `client/.env` when the API is not at `http://localhost:5000/api`.

## Seed Admin

After setting `server/.env`, run:

```powershell
cd server
npm run seed
```

The seed is safe to run more than once; it does not create a duplicate admin account.

Default admin credentials:

- Email: `admin@lab.com`
- Password: `admin123`

Change the default password before using the system beyond a local demonstration.

## Testing Instructions

1. Start MySQL, create the configured database, and configure `server/.env` with your MySQL credentials.
2. Run the backend and seed the admin.
3. Run the frontend.
4. Register a researcher and log in.
5. Create an experiment, then add a protocol, reaction, and observation.
6. Save a result; check that each supported change appears in experiment history.
7. Edit and delete records and the experiment; verify researcher ownership by trying another account.
8. Log in as admin; check dashboard counts, researchers, records, experiment details, and history.
9. Search by experiment title and filter by status.

The project has no automated database integration suite. The API can also be exercised with Postman using the bearer token returned by login.

## Future Enhancements

Possible future work includes password reset, pagination for large laboratories, and automated API integration tests.
