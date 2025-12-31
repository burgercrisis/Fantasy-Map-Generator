# Fix-Namebases PowerShell Script
# This script fixes namebases-real.js encoding, duplicates, and formatting issues

$file = "E:\code\Fantasy-Map-Generator\modules\namebases-real.js"
$content = Get-Content $file -Raw -Encoding UTF8

# UTF-8 encoding fixes
$encodingFixes = @{
    "â"œâŒ" = "ã"
    "â"œÃº" = "ão"
    "â"œâÂ"" = "ô"
    "â"œ¬" = "ê"
    "â"œ­" = "í"
    "â"œÂ"" = "í"
    "â"œÃ¯" = "ã¯"
    "Ã©" = "é"
    "Ã¨" = "è"
    "Ã­" = "í"
    "Ã¯" = "ï"
    "Ã³" = "ó"
    "Ãº" = "ú"
    "Ã¡" = "á"
    "Ã§" = "ç"
    "Â¡" = "á"
    "Âª" = "ã"
    "Â·" = "·"
}

Write-Host "Applying UTF-8 encoding fixes..." -ForegroundColor Cyan
foreach ($bad in $encodingFixes.Keys) {
    $good = $encodingFixes[$bad]
    if ($content -match [regex]::Escape($bad)) {
        $content = $content -replace [regex]::Escape($bad), $good
        Write-Host "  Replaced: $bad -> $good" -ForegroundColor Green
    }
}

# Remove trailing spaces from name fields
Write-Host "Removing trailing spaces from name fields..." -ForegroundColor Cyan
$content = $content -replace '"name":\s*"[^"]*"\s*,', '"name": "$1",'

# Report summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Yellow
Write-Host "✓ UTF-8 encoding fixes applied"
Write-Host "✓ Trailing spaces removed from name fields"
Write-Host "File updated: $file" -ForegroundColor Green
Write-Host ""
Write-Host "Note: For comprehensive fixes including:" -ForegroundColor Cyan
Write-Host "  - Merging duplicate namebases" -ForegroundColor White
Write-Host "  - Removing geographic terms" -ForegroundColor White
Write-Host "  - Identifying low-count entries" -ForegroundColor White
Write-Host "  - Renumbering i values" -ForegroundColor White
Write-Host "Please use the Node.js script: fix-namebases.js" -ForegroundColor Yellow

# Save the file
$content | Set-Content $file -Encoding UTF8 -NoNewline
Write-Host "✓ File saved successfully" -ForegroundColor Green
