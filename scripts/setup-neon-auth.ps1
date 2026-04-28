# Neon Auth Setup Script
# This script helps enable and configure Neon Auth for your project

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Neon Auth Setup for Code Guardian" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Project Configuration
$projectId = "red-shadow-25985809"
$branchId = "br-winter-river-aoxd2oae"
$region = "ap-southeast-1"
$databaseName = "neondb"

# Construct Neon Auth URL
$neonAuthUrl = "https://$branchId.neonauth.$region.aws.neon.tech/$databaseName/"

Write-Host "Project ID: $projectId" -ForegroundColor Green
Write-Host "Branch ID: $branchId" -ForegroundColor Green
Write-Host "Neon Auth URL: $neonAuthUrl" -ForegroundColor Yellow
Write-Host ""

# Check if neonctl is installed
try {
    $neonVersion = neonctl --version 2>&1
    Write-Host "Neon CLI found: $neonVersion" -ForegroundColor Green
} catch {
    Write-Host "Neon CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g neonctl
}

# Update .env.local
$envLocalPath = ".\.env.local"
if (Test-Path $envLocalPath) {
    $content = Get-Content $envLocalPath -Raw
    
    # Check if NEON_AUTH_URL is already set
    if ($content -match 'NEON_AUTH_URL="[^"]*"') {
        # Update existing
        $content = $content -replace 'NEON_AUTH_URL="[^"]*"', "NEON_AUTH_URL=`"$neonAuthUrl`""
        $content = $content -replace 'NEXT_PUBLIC_NEON_AUTH_URL="[^"]*"', "NEXT_PUBLIC_NEON_AUTH_URL=`"$neonAuthUrl`""
        Write-Host "Updated existing NEON_AUTH_URL in .env.local" -ForegroundColor Green
    } else {
        # Add new - find the NEON AUTH section
        $content = $content -replace '(NEON_AUTH_URL="")', "NEON_AUTH_URL=`"$neonAuthUrl`""
        $content = $content -replace '(NEXT_PUBLIC_NEON_AUTH_URL="")', "NEXT_PUBLIC_NEON_AUTH_URL=`"$neonAuthUrl`""
        Write-Host "Added NEON_AUTH_URL to .env.local" -ForegroundColor Green
    }
    
    Set-Content $envLocalPath $content -NoNewline
    Write-Host ".env.local updated successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: .env.local not found at $envLocalPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Enable Neon Auth in Console:" -ForegroundColor Yellow
Write-Host "   https://console.neon.tech/project/$projectId/branches/$branchId/auth" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Create GitHub OAuth App:" -ForegroundColor Yellow
Write-Host "   https://github.com/settings/applications/new" -ForegroundColor Cyan
Write-Host "   Authorization callback URL:" -ForegroundColor White
Write-Host "   ${neonAuthUrl}self-service/methods/oidc/callback/github" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy GitHub Client ID & Secret to Neon Auth settings" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Restart your application:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Neon Auth URL configured: $neonAuthUrl" -ForegroundColor Green
Write-Host ""
