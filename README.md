# BookMyShow Backend

A RESTful API backend for a movie ticket booking platform built with **Go** and **Gin** framework. Inspired by BookMyShow, it supports user authentication, movie management, venue booking, seat selection, and order processing.

## Features

- **User Management** – Signup, login with JWT authentication, OTP verification (Twilio)
- **Movies** – CRUD operations, poster uploads to AWS S3, search by name, pagination
- **Venues** – Create venues, add movies, manage show timings
- **Seats** – Reserve and book seats (10-minute reservation window)
- **Orders** – View booking history

## Tech Stack

- **Backend:** Go 1.22, Gin
- **Database:** PostgreSQL with GORM
- **Auth:** JWT (golang-jwt/jwt)
- **Storage:** AWS S3 (movie posters)
- **SMS/OTP:** Twilio

## Prerequisites

- Go 1.22+
- PostgreSQL 15+
- (Optional) Docker for PostgreSQL

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Snehil208001/BookMyShowApp.git
cd BookMyShowApp
```

### 2. Environment setup

Copy the example env file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL connection string |
| `SECRET` | JWT secret (min 32 chars) |
| `TWILIO_*` | Twilio credentials (for OTP) |
| `AWS_*` | AWS S3 credentials (for poster uploads) |

### 3. Database

**Option A – Local PostgreSQL**

```bash
psql -U postgres -c "CREATE DATABASE bookmyshow;"
```

**Option B – Docker**

```bash
docker-compose up -d
```

### 4. Run the server

```bash
go run .
```

Server runs at `http://localhost:8080`.

## API Overview

| Resource | Endpoints |
|----------|-----------|
| **User** | `/user/signup`, `/user/login` |
| **Movies** | `/movies/`, `/movies/:id`, `/movies/venues/:id`, `/movies/upload/poster/:id` |
| **Venues** | `/venues/`, `/venues/:id`, `/venues/:id/movies/add`, `/venues/:id/timings/add` |
| **Seats** | `/seats/showtime/:id`, `/seats/showtime/reserve`, `/seats/showtime/book` |
| **Orders** | `/orders/` |

See [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) for detailed API documentation and examples.

## Project Structure

```
├── cmd/              # Application entry points
├── controllers/      # HTTP handlers
├── initializers/     # DB, env, AWS setup
├── middleware/       # Auth middleware
├── models/           # GORM models
├── routes/           # Route definitions
├── helpers/          # Utility functions
├── frontend/         # User-facing frontend
├── frontend-admin/   # Admin panel
└── docker-compose.yml
```

## Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) – Local development setup
- [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) – API usage with Postman
- [TESTING.md](TESTING.md) – Testing guide

## License

MIT
