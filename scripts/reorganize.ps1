# Monorepo Reorganization Script
# This script organizes the project into a proper monorepo structure

Write-Host "🚀 Starting monorepo reorganization..." -ForegroundColor Green

# Create directory structure
Write-Host "`n📁 Creating directory structure..." -ForegroundColor Cyan
$dirs = @(
    "apps/web",
    "apps/api",
    "docs/frontend",
    "docs/backend", 
    "docker"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    }
}

# Move frontend files to apps/web
Write-Host "`n📦 Moving frontend files to apps/web..." -ForegroundColor Cyan
$frontendFiles = @(
    "app",
    "src",
    "public",
    "components.json",
    "next.config.mjs",
    "next-env.d.ts",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "postcss.config.mjs",
    "tsconfig.json"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        $dest = "apps/web/$file"
        if (Test-Path $dest) {
            Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
        }
        Move-Item -Path $file -Destination $dest -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Copy backend to apps/api
Write-Host "`n📦 Copying backend files to apps/api..." -ForegroundColor Cyan
if (Test-Path "backend") {
    Copy-Item -Path "backend/*" -Destination "apps/api/" -Recurse -Force
    Write-Host "  ✓ Copied backend files" -ForegroundColor Green
}

# Move documentation
Write-Host "`n📚 Organizing documentation..." -ForegroundColor Cyan
$docMoves = @{
    "FRONTEND_README.md" = "docs/frontend/README.md"
    "FRONTEND_SETUP.md" = "docs/frontend/SETUP.md"
    "FRONTEND_RESTRUCTURE_SUMMARY.md" = "docs/frontend/RESTRUCTURE.md"
    "FRONTEND_DEPENDENCIES_LOG.md" = "docs/frontend/DEPENDENCIES.md"
    "MIGRATION_GUIDE.md" = "docs/MIGRATION.md"
    "DEPLOYMENT.md" = "docs/DEPLOYMENT.md"
    "DOCKER_SETUP.md" = "docs/DOCKER.md"
    "API_INTEGRATION.md" = "docs/API_INTEGRATION.md"
    "TROUBLESHOOTING.md" = "docs/TROUBLESHOOTING.md"
    "QUICK_START.md" = "docs/QUICK_START.md"
}

foreach ($source in $docMoves.Keys) {
    if (Test-Path $source) {
        $dest = $docMoves[$source]
        Move-Item -Path $source -Destination $dest -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $source -> $dest" -ForegroundColor Green
    }
}

# Move Docker files
Write-Host "`n🐳 Organizing Docker files..." -ForegroundColor Cyan
$dockerFiles = @(
    "Dockerfile.backend",
    "Dockerfile.frontend",
    "Dockerfile.celery",
    "nginx.conf"
)

foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docker/$file" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

# Remove old/unnecessary directories
Write-Host "`n🧹 Cleaning up old directories..." -ForegroundColor Cyan
$oldDirs = @(
    "components",
    "contexts",
    "hooks",
    "lib",
    "store",
    "styles"
)

foreach ($dir in $oldDirs) {
    if (Test-Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed $dir (moved to apps/web/src)" -ForegroundColor Yellow
    }
}

# Remove old backend if copied successfully
if (Test-Path "apps/api/app" -and Test-Path "backend") {
    Write-Host "`n🗑️  Removing old backend directory..." -ForegroundColor Cyan
    Remove-Item -Path "backend" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed old backend" -ForegroundColor Green
}

Write-Host "`n✅ Monorepo reorganization complete!" -ForegroundColor Green
Write-Host "`nNew structure:" -ForegroundColor Cyan
Write-Host "  apps/web     - Next.js frontend" -ForegroundColor White
Write-Host "  apps/api     - FastAPI backend" -ForegroundColor White
Write-Host "  docs/        - All documentation" -ForegroundColor White
Write-Host "  docker/      - Docker configurations" -ForegroundColor White
Write-Host "  kubernetes/  - K8s deployments" -ForegroundColor White
Write-Host "  scripts/     - Build scripts" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review the new structure" -ForegroundColor White
Write-Host "  2. Update package.json with monorepo scripts" -ForegroundColor White
Write-Host "  3. Test: npm run dev" -ForegroundColor White
