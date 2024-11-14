# Stop on first error
$ErrorActionPreference = "Stop"

# Store current branch name
$currentBranch = git rev-parse --abbrev-ref HEAD

try {
    # Get timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Commit any pending changes
    git add .
    git commit -m "Committing current changes before deploy at $timestamp"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "No changes to commit"
    }
    
    # 1. Switch to gh-pages
    git checkout gh-pages
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to switch to gh-pages branch"
    }

    # Force merge from master, accepting master's changes for any conflicts
    git merge -X theirs master
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to merge from master"
    }

    # Run build
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }

    # 2. Copy dist folder contents to root
    Copy-Item -Path "dist/*" -Destination "." -Recurse -Force

    # 3. Add, commit and push
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git add .
    git commit -m "release $timestamp"
    git push origin gh-pages

} catch {
    Write-Error "Deployment failed: $_"
    $failed = $true
} finally {
    # 4. Switch back to original branch
    git checkout $currentBranch
    if ($failed) {
        exit 1
    }
} 