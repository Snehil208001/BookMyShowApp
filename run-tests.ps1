# Run all tests for BookMyShow backend
# Requires: Go 1.22+ in PATH

Write-Host "Running tests..." -ForegroundColor Cyan
$result = go test ./... -v 2>&1
$result | Write-Host

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed." -ForegroundColor Red
    exit 1
}
