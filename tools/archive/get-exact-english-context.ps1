# Get exact context around English entry
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$lines = $content -split "`n"

# Find the line with English entry
$englishLineIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"i":\s*1') {
        $englishLineIndex = $i
        break
    }
}

if ($englishLineIndex -ge 0) {
    Write-Host "English entry found at line $englishLineIndex"
    Write-Host "Line content:"
    Write-Host $lines[$englishLineIndex]
    Write-Host ""
    Write-Host "Previous line:"
    if ($englishLineIndex -gt 0) {
        Write-Host $lines[$englishLineIndex - 1]
    }
    Write-Host ""
    Write-Host "Next line:"
    if ($englishLineIndex -lt $lines.Count - 1) {
        Write-Host $lines[$englishLineIndex + 1]
    }
} else {
    Write-Host "English entry not found"
}
