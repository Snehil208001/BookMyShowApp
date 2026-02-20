# Start BookMyShow backend server
# Prerequisites: .env file, PostgreSQL running (or: docker-compose up -d)

$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Starting server at http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

Set-Location $PSScriptRoot\..
go run .
