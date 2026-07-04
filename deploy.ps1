# Vercel Direct API Deployment Script for BharatAI (Full Stack)

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
$baseDir = "C:\Users\HP\.gemini\antigravity\scratch\bharatai"

# Parse Supabase credentials
$supabaseUrl = ""
$supabaseAnon = ""
foreach ($line in $envFile) {
    if ($line -match "^SUPABASE_URL=(.*)") {
        $supabaseUrl = $Matches[1].Trim()
    }
    if ($line -match "^SUPABASE_ANON_KEY=(.*)") {
        $supabaseAnon = $Matches[1].Trim()
    }
}

# Files to deploy
$fileList = @("index.html", "server.js", "package.json", "vercel.json", "manifest.json", "sw.js")
$jsonFiles = @()

foreach ($fileName in $fileList) {
    $filePath = Join-Path $baseDir $fileName
    if (Test-Path $filePath) {
        Write-Host "Reading $fileName..." -ForegroundColor Cyan
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $escaped = $content.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", '\n')
        $jsonFiles += "{`"file`":`"$fileName`",`"data`":`"$escaped`"}"
      } else {
        Write-Warning "File $fileName not found. Skipping."
    }
}

$filesJoined = $jsonFiles -join ","
Write-Host "Assembling full-stack payload with Supabase config..." -ForegroundColor Cyan

$body = "{`"name`":`"bharat-ai`",`"files`":[$filesJoined],`"projectSettings`":{`"framework`":null},`"env`":{`"SUPABASE_URL`":`"$supabaseUrl`",`"SUPABASE_ANON_KEY`":`"$supabaseAnon`"}}"

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
