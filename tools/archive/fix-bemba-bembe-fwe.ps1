# Fix Bemba-Bembe-Fwe entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'Victoria Falls', 'Kafue'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Bemba-Bembe-Fwe entry fixed successfully"
