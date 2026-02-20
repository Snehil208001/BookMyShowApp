# Local Setup - Fix ECONNREFUSED

## 1. Update database password in `.env`

Edit `.env` and set `DB_URL` with your PostgreSQL password:

```
DB_URL=postgres://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/bookmyshow?sslmode=disable
```

## 2. Create the database (if needed)

```powershell
psql -U postgres -c "CREATE DATABASE bookmyshow;"
```

Or in pgAdmin / any PostgreSQL client: create database `bookmyshow`.

## 3. Start the server

```powershell
.\scripts\start-server.ps1
```

Or:
```powershell
go run .
```

## 4. Test in Postman

- **URL:** `http://localhost:8080/user/signup`
- **Method:** POST
- **Body (JSON):**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123",
  "phone_number": "9876543216"
}
```

---

## Alternative: Use Docker for PostgreSQL

If you have Docker:

```powershell
docker-compose up -d
```

Then the default `.env` credentials (`postgres`/`postgres`) will work.
