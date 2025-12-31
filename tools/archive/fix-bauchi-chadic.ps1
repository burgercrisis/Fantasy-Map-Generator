# Fix Bauchi Chadic entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'Tafawa Balewa', 'Tafawa,Balewa'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Bauchi Chadic entry fixed successfully"
