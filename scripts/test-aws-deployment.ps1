# Test AWS deployment
# Usage: .\scripts\test-aws-deployment.ps1 -BaseUrl "http://ec2-XX-XX-XX-XX.compute.amazonaws.com:8080"

param(
    [Parameter(Mandatory=$true)]
    [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

Write-Host "Testing BookMyShow API at $BaseUrl" -ForegroundColor Cyan

$endpoints = @(
    @{ Name = "GET /movies/"; Url = "$BaseUrl/movies/" },
    @{ Name = "GET /venues/"; Url = "$BaseUrl/venues/" }
)

$passed = 0
$failed = 0

foreach ($ep in $endpoints) {
    Write-Host "`n--- $($ep.Name) ---" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $ep.Url -UseBasicParsing -TimeoutSec 10
        Write-Host "PASS - Status: $($response.StatusCode)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n--- Summary ---" -ForegroundColor Cyan
Write-Host "Passed: $passed | Failed: $failed"
if ($failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed." -ForegroundColor Red
    exit 1
}
