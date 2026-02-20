# Backend Testing Guide

## Prerequisites

- Go 1.22+ installed and in PATH
- PostgreSQL database (for integration tests)
- `.env` file configured (copy from `.env.example`)

## Running Tests

### Unit Tests (no external dependencies)

```bash
go test ./helpers/... -v
```

Tests the helper functions:
- `GenerateSeatsForShowTime` - seat layout generation
- `CreateSeatMatrix` - seat matrix formatting
- `FormatShowTime` - time formatting
- Edge case: empty seat number handling

### Controller Validation Tests

```bash
go test ./controllers/... -v -run "Validation"
```

Tests validation rules for:
- `MovieRequestBody`
- `VenueRequestBody`

### All Tests

```bash
go test ./... -v
```

### API Integration Tests (manual)

When the server is running (`go run .` or `air`):

```powershell
.\scripts\test-api.ps1 -BaseUrl "http://localhost:8080"
```

Or with curl:

```bash
# Get movies
curl http://localhost:8080/movies/

# Get venues
curl http://localhost:8080/venues/

# Signup
curl -X POST http://localhost:8080/user/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","phone_number":"9876543210"}'
```

## Fixes Applied During Testing

1. **Login flow**: Password is now verified before sending OTP (prevents unnecessary OTP sends and user enumeration)
2. **User model**: Password and OTP fields use `json:"-"` to prevent exposure in API responses
3. **CreateSeatMatrix**: Added safety check for empty `SeatNumber` to avoid panic
4. **GetVenuesByMovieID**: Safe type assertion when appending show times to venue map
5. **Reserve/Book flow**: Seats are now linked to the reserving user; only that user can book them
6. **Reservation window**: Aligned to 10 minutes (per README) instead of 5
7. **S3 upload**: Uses unique keys (timestamp + filename) to avoid overwriting files
