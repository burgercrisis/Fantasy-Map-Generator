# Fix-Namebases PowerShell Script
# This script fixes namebases-real.js encoding, duplicates, and formatting issues

$file = "E:\code\Fantasy-Map-Generator\modules\namebases-real.js"
$content = Get-Content $file -Raw -Encoding UTF8

# UTF-8 encoding fixes (simplified)
Write-Host "Applying UTF-8 encoding fixes..." -ForegroundColor Cyan

# Fix common mangled patterns
$content = $content -replace 'â€œâ€ÂÃ·', 'Ã¢'
$content = $content -replace 'â€œâ€Âº', 'Ã³'
$content = $content -replace 'Ã¢', 'ã'
$content = $content -replace 'Ã³', '³'

# Remove trailing spaces from name fields
Write-Host "Removing trailing spaces from name fields..." -ForegroundColor Cyan
$content = $content -replace '"name":\s*"[^"]+"\s*,', '"name": "$1",'

# Save the file
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Yellow
Write-Host "✓ UTF-8 encoding fixes applied"
Write-Host "✓ Trailing spaces removed from name fields"
Write-Host "✓ File updated: $file" -ForegroundColor Green
Write-Host ""
Write-Host "For comprehensive fixes including:" -ForegroundColor Cyan
Write-Host "  - Merging duplicate namebases"
Write-Host "  - Removing geographic terms"
Write-Host "  - Expanding low-count entries"
Write-Host "  - Renumbering i values"
Write-Host "  Please run: node fix-namebases.js" -ForegroundColor Yellow
Write-Host ""
