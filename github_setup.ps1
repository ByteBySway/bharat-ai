# GitHub Automation Script for BharatAI

$envPath = "C:\Users\HP\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "Credentials file .env not found at $envPath."
    exit 1
}

$envFile = Get-Content $envPath
$token = ""
foreach ($line in $envFile) {
    if ($line -like "*GITHUB_TOKEN*") {
        $parts = $line.Split('=')
        if ($parts.Length -gt 1) {
            $token = $parts[1].Trim()
        }
    }
}

if (-not $token) {
    Write-Error "GITHUB_TOKEN is not defined in your credentials file."
    exit 1
}

# 1. Fetch GitHub Username from Token
Write-Host "Verifying GitHub token and fetching user profile..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "token $token"
    "User-Agent" = "PowerShell"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    $username = $user.login
    Write-Host "GitHub Username Authenticated: $username" -ForegroundColor Green
} catch {
    Write-Error "Failed to authenticate with GitHub. Check your GITHUB_TOKEN."
    exit 1
}

# 2. Create the Repository if it doesn't exist
Write-Host "Creating GitHub repository 'bharat-ai'..." -ForegroundColor Cyan
$repoBody = @{
    name = "bharat-ai"
    description = "BharatAI - A rural empowerment super app for crop diagnosis, study mentorship, health guide, digital ledger bookkeeping, job boards, and civic services."
    homepage = "https://bharat-l3ke1qs84-swaybytes-projects.vercel.app"
    private = $false
    has_issues = $true
    has_projects = $true
    has_wiki = $true
} | ConvertTo-Json

try {
    $createRes = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $repoBody -ContentType "application/json"
    Write-Host "Repository 'bharat-ai' successfully created!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 422) {
        Write-Host "Repository 'bharat-ai' already exists. Proceeding to push code..." -ForegroundColor Yellow
    } else {
        Write-Error "Failed to create repository: $_"
        exit 1
    }
}

# 3. Configure Local Git and Push
Write-Host "Initializing Git push pipeline..." -ForegroundColor Cyan
$gitPath = "C:\Users\HP\.gemini\antigravity\scratch\MinGit\cmd\git.exe"

# Configure local git user info if not present
& $gitPath config user.name "BharatAI Developer"
& $gitPath config user.email "dev@bharatai.org"

# Remove existing origin if set
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin "https://$token@github.com/$username/bharat-ai.git"

Write-Host "Pushing files to GitHub repository..." -ForegroundColor Cyan
& $gitPath add .
& $gitPath commit -m "Initial commit of BharatAI super app with README, Vercel deployments, and fixed JS initialization errors" 2>$null
& $gitPath branch -M master
& $gitPath push -u origin master --force

# 4. Set Repository Topics (Tags)
Write-Host "Adding tags and topics to the repository..." -ForegroundColor Cyan
$topicsHeaders = @{
    "Authorization" = "token $token"
    "User-Agent" = "PowerShell"
    "Accept" = "application/vnd.github.mercy-preview+json"
}
$topicsBody = @{
    names = @("rural-india", "farmer-ai", "education-portal", "voice-assist", "supabase", "accessibility")
} | ConvertTo-Json

try {
    $topicsRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/bharat-ai/topics" -Method Put -Headers $topicsHeaders -Body $topicsBody -ContentType "application/json"
    Write-Host "Tags successfully updated: $($topicsRes.names -join ', ')" -ForegroundColor Green
} catch {
    Write-Warning "Failed to set topics: $_"
}

# 5. Enable Branch Protection on master
Write-Host "Configuring Branch Protection for 'master'..." -ForegroundColor Cyan
$protectionBody = @{
    required_status_checks = $null
    enforce_admins = $true
    required_pull_request_reviews = @{
        dismissal_restrictions = @{}
        dismiss_stale_reviews = $true
        require_code_owner_reviews = $false
        required_approving_review_count = 1
    }
    restrictions = $null
} | ConvertTo-Json -Depth 5

try {
    $protectionRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$username/bharat-ai/branches/master/protection" -Method Put -Headers $headers -Body $protectionBody -ContentType "application/json"
    Write-Host "Branch protection successfully enabled on master branch!" -ForegroundColor Green
} catch {
    Write-Warning "Could not apply branch protection: $_"
}

Write-Host "GitHub setup completely successful!" -ForegroundColor Green
Write-Host "GitHub Repository Link: https://github.com/$username/bharat-ai" -ForegroundColor Yellow
