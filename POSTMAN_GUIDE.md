# Postman API Guide - BookMyShow Backend

**Base URL (local):** `http://localhost:8080`  
**Base URL (AWS):** `http://ec2-13-232-146-41.ap-south-1.compute.amazonaws.com:8080`

> **Auth:** Login/Signup sets an `Authorization` cookie. For protected endpoints, enable "Send cookies" in Postman or use the cookie from the login response.

---

## 1. User

### Signup
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/user/signup` |
| **Body (raw JSON)** | |
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/user/login` |
| **Body (raw JSON)** | |
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
> Returns JWT in `Authorization` cookie for protected endpoints.

---

## 2. Movies

### Get All Movies
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/movies/` |
| **Query (optional)** | `limit=5`, `offset=0`, `name=batman`, `sort=asc` or `sort=desc` |

### Get Movie by ID
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/movies/1` |

### Get Venues by Movie ID
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/movies/venues/1` |

### Create Movie (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/movies/` |
| **Body (raw JSON)** | |
```json
{
  "title": "Inception",
  "desc": "A mind-bending thriller",
  "duration": "2h 28m"
}
```

### Upload Movie Poster (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/movies/upload/poster/1` |
| **Body** | form-data | Key: `poster`, Type: File |
| **Body** |  | Select file |

---

## 3. Venues

### Get All Venues
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/venues/` |
| **Query (optional)** | `limit=5`, `offset=0` |

### Get Venue by ID
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/venues/1` |

### Create Venue (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/venues/` |
| **Body (raw JSON)** | |
```json
{
  "name": "PVR Cinemas",
  "location": "Mumbai"
}
```

### Add Movies to Venue (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/venues/1/movies/add` |
| **Body (raw JSON)** | |
```json
{
  "movie_ids": [1, 2, 3]
}
```

### Add Show Timings (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/venues/1/timings/add` |
| **Body (raw JSON)** | |
```json
{
  "movie_id": 1,
  "show_timings": ["10:00", "14:00", "18:00"]
}
```

---

## 4. Seats

### Get Seat Layout
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/seats/showtime/1` |

### Reserve Seats (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/seats/showtime/reserve` |
| **Body (raw JSON)** | |
```json
{
  "show_id": 1,
  "seat_ids": [1, 2, 3]
}
```

### Book Seats (Auth)
| | |
|---|---|
| **Method** | POST |
| **URL** | `{{baseUrl}}/seats/showtime/book` |
| **Body (raw JSON)** | |
```json
{
  "show_id": 1,
  "seat_ids": [1, 2, 3]
}
```
> Only works for seats you reserved. Reserved for 10 minutes.

---

## 5. Orders

### Get My Orders (Auth)
| | |
|---|---|
| **Method** | GET |
| **URL** | `{{baseUrl}}/orders/` |

---

## Postman Setup

1. **Create Environment** with variable:
   - `baseUrl` = `http://localhost:8080`

2. **Auth flow:** Call Login → Postman will store the cookie. Use the same cookie for protected endpoints.

3. **Cookie:** If cookie isn't sent automatically, copy the `Authorization` cookie from the Login response and add it manually in Postman headers or Cookies.
