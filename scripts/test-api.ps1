# API Test Script for BookMyShow Backend
# Run this when the server is running (e.g., go run . or air)
# Usage: .\scripts\test-api.ps1 -BaseUrl "http://localhost:8080"

param(
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param([string]$Name, [string]$Method, [string]$Url, [hashtable]$Body = $null, [hashtable]$Headers = @{})
    Write-Host "`n--- $Name ---" -ForegroundColor Cyan
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        Write-Host "Status: $($response.StatusCode) OK" -ForegroundColor Green
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
        return $true
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host $reader.ReadToEnd()
        }
        return $false
    }
}

Write-Host "Testing BookMyShow API at $BaseUrl" -ForegroundColor Yellow

# 1. Get all movies (no auth)
Test-Endpoint -Name "GET /movies/" -Method GET -Url "$BaseUrl/movies/"

# 2. Get all venues (no auth)
Test-Endpoint -Name "GET /venues/" -Method GET -Url "$BaseUrl/venues/"

# 3. Signup (creates user)
$signupBody = @{
    name = "Test User"
    email = "test$(Get-Random)@example.com"
    password = "password123"
    phone_number = "9876543210"
}
$signupResult = Test-Endpoint -Name "POST /user/signup" -Method POST -Url "$BaseUrl/user/signup" -Body $signupBody

# 4. Login (requires valid credentials - may fail if user doesn't exist)
# Test-Endpoint -Name "POST /user/login" -Method POST -Url "$BaseUrl/user/login" -Body @{ email = "test@example.com"; password = "password123" }

# 5. Get movie by ID (assumes movie with id 1 exists)
Test-Endpoint -Name "GET /movies/1" -Method GET -Url "$BaseUrl/movies/1"

# 6. Get venues by movie ID
Test-Endpoint -Name "GET /movies/venues/1" -Method GET -Url "$BaseUrl/movies/venues/1"

# 7. Get seat layout (assumes showtime with id 1 exists)
Test-Endpoint -Name "GET /seats/showtime/1" -Method GET -Url "$BaseUrl/seats/showtime/1"

Write-Host "`n--- Test run complete ---" -ForegroundColor Yellow
