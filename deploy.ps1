# Vercel Direct API Deployment Script for BharatAI

$envPath = "C:\Users\HP\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "Credentials file .env not found at $envPath. Please save your token first."
    exit 1
}

$envFile = Get-Content $envPath
$tokenLine = $envFile | Select-String "^VERCEL_TOKEN="
if (-not $tokenLine) {
    Write-Error "VERCEL_TOKEN is not defined in your credentials file."
    exit 1
}

$token = $tokenLine.ToString().Split('=')[1].Trim()

$indexPath = "C:\Users\HP\.gemini\antigravity\scratch\bharatai\index.html"
if (-not (Test-Path $indexPath)) {
    Write-Error "index.html not found at $indexPath."
    exit 1
}

Write-Host "Reading index.html content..." -ForegroundColor Cyan
$content = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

Write-Host "Formatting content for JSON..." -ForegroundColor Cyan
# Safely escape backslashes, double quotes, and newlines for JSON compatibility
$escaped = $content.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", '\n')

Write-Host "Assembling payload..." -ForegroundColor Cyan
$body = "{`"name`":`"bharat-ai`",`"files`":[{`"file`":`"index.html`",`"data`":`"$escaped`"}],`"projectSettings`":{`"framework`":null}}"

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Deploying to Vercel via REST API..." -ForegroundColor Cyan
try {
    $res = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method Post -Headers $headers -Body $bodyBytes
    Write-Host "`n🎉 Deployment Successful!" -ForegroundColor Green
    Write-Host "Live URL: https://$($res.url)" -ForegroundColor Yellow
} catch {
    Write-Error "Deployment failed: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errResponse = $reader.ReadToEnd()
        Write-Host "Error Details: $errResponse" -ForegroundColor Red
    }
}
