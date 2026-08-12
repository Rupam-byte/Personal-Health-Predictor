# ============================================================================
# check_structure.ps1
# Run this from your project root: E:\Personalized-HealthCare-Predictor
# Usage:  .\check_structure.ps1
# ============================================================================

$root = Get-Location
Write-Host "`nChecking project structure in: $root`n" -ForegroundColor Cyan

$required = @(
    "backend\app.py",
    "backend\models.py",
    "backend\auth.py",
    "backend\medicine_data.py",
    "backend\requirements.txt",
    "backend\.env",
    "backend\.env.example",
    "backend\ml\best_model.pkl",
    "backend\ml\disease_encoder.pkl",
    "backend\ml\medicine_database.pkl",
    "backend\data\Cleaned_Dataset.csv",
    "frontend\templates\index.html",
    "frontend\templates\about.html",
    "frontend\templates\contact.html",
    ".gitignore",
    "README.md"
)

$missing = @()
$found = @()

foreach ($item in $required) {
    if (Test-Path $item) {
        $found += $item
    } else {
        $missing += $item
    }
}

Write-Host "FOUND ($($found.Count)/$($required.Count)):" -ForegroundColor Green
foreach ($item in $found) { Write-Host "  [OK] $item" -ForegroundColor Green }

if ($missing.Count -gt 0) {
    Write-Host "`nMISSING:" -ForegroundColor Red
    foreach ($item in $missing) { Write-Host "  [MISSING] $item" -ForegroundColor Red }
} else {
    Write-Host "`nAll required files are in place!" -ForegroundColor Green
}

# Flag leftover clutter that should probably be cleaned up
Write-Host "`nChecking for leftover clutter..." -ForegroundColor Cyan
$clutterPatterns = @("medicare_extracted", "*.zip", "medicare*")
$clutterFound = @()

foreach ($pattern in $clutterPatterns) {
    $matches = Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($m in $matches) {
        if ($m.Name -notin @("medicine_data.py")) {  # don't flag legit files
            $clutterFound += $m.FullName
        }
    }
}

if ($clutterFound.Count -gt 0) {
    Write-Host "Possible leftover files/folders you may want to delete:" -ForegroundColor Yellow
    foreach ($c in $clutterFound | Select-Object -Unique) { Write-Host "  [CLUTTER?] $c" -ForegroundColor Yellow }
} else {
    Write-Host "No obvious clutter found." -ForegroundColor Green
}

# Check nothing stray is sitting inside notebooks/
Write-Host "`nChecking notebooks/ folder contents..." -ForegroundColor Cyan
if (Test-Path "notebooks") {
    $notebookFiles = Get-ChildItem "notebooks" -File
    foreach ($f in $notebookFiles) {
        if ($f.Extension -ne ".ipynb") {
            Write-Host "  [UNEXPECTED] notebooks\$($f.Name) -- should this be here?" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nDone.`n" -ForegroundColor Cyan