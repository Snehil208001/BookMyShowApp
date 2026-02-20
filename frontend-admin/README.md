# BookMyShow Admin Panel

Separate admin frontend for managing movies and venues.

## Setup

```bash
cd frontend-admin
npm install
```

## Run

```bash
npm run dev
```

Runs at **http://localhost:5176**

## Login

- **Email:** admin@example.com
- **Password:** admin123

## Features

- **Dashboard** – Overview of movies and venues count
- **Movies** – Add new movies (title, description, duration, poster URL)
- **Venues** – Add venues, link movies to venues, add showtimes

## Environment

Create `.env` in frontend-admin (optional):

```
VITE_API_URL=http://localhost:8080
VITE_MAIN_SITE_URL=http://localhost:5173
```
