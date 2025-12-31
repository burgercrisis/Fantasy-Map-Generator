# Fix Kwaza-Xoc Amazonian entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'Aracaju,Propri', 'Manaus,Porto Velho'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Kwaza-Xoc Amazonian entry fixed successfully"
