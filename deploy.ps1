# Vercel Direct API Deployment Script for BharatAI (Full Stack)

$envPath = "C:\Users\HP\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "Credentials file .env not found at $envPath. Please save your token first."
    exit 1
}

$envFile = Get-Content $envPath
$token = ""
$supabaseUrl = ""
$supabaseAnon = ""

foreach ($line in $envFile) {
    if ($line -match "^VERCEL_TOKEN=(.*)") {
        $token = $Matches[1].Trim()
    }
    if ($line -match "^SUPABASE_URL=(.*)") {
        $supabaseUrl = $Matches[1].Trim()
    }
    if ($line -match "^SUPABASE_ANON_KEY=(.*)") {
        $supabaseAnon = $Matches[1].Trim()
    }
}

if (-not $token) {
    Write-Error "VERCEL_TOKEN is not defined in your credentials file."
    exit 1
}

$baseDir = "C:\Users\HP\.gemini\antigravity\scratch\bharatai"

# Files to deploy
$fileList = @("index.html", "server.js", "package.json", "vercel.json", "manifest.json", "sw.js", "api/ai.js", "api/data/[collection].js")
$filesArray = @()

foreach ($fileName in $fileList) {
    $filePath = Join-Path $baseDir $fileName
    if (Test-Path -LiteralPath $filePath) {
        Write-Host "Reading $fileName..." -ForegroundColor Cyan
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $fileObj = @{
            file = $fileName
            data = $content
        }
        $filesArray += $fileObj
    } else {
        Write-Warning "File $fileName not found. Skipping."
    }
}

Write-Host "Assembling full-stack payload with Supabase config..." -ForegroundColor Cyan

$payload = @{
    name = "bharat-ai"
    files = $filesArray
    projectSettings = @{
        framework = $null
    }
    env = @{
        SUPABASE_URL = $supabaseUrl
        SUPABASE_ANON_KEY = $supabaseAnon
    }
}

$body = $payload | ConvertTo-Json -Depth 10 -Compress
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
    
    # Automatically map production alias
    Write-Host "Routing production domain to new build..." -ForegroundColor Cyan
    $aliasBody = @{ alias = "bharat-ai-sway.vercel.app" } | ConvertTo-Json
    $aliasRes = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$($res.id)/aliases" -Method Post -Headers $headers -Body $aliasBody
    Write-Host "Production URL: https://bharat-ai-sway.vercel.app" -ForegroundColor Green
} catch {
    Write-Error "Deployment failed: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errResponse = $reader.ReadToEnd()
        Write-Host "Error Details: $errResponse" -ForegroundColor Red
    }
}
