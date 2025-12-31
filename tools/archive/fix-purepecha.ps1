# Fix Purepecha entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'LosReyes', 'Los,Reyes'
$content = $content -replace 'Brazzavilleisenas', 'Tingambato'
$content = $content -replace 'GaBrazzavilleielZamora', 'Gabriel,Zamora'
$content = $content -replace 'LaPiedad', 'La,Piedad'
$content = $content -replace 'Morelos', 'Zamora'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Purepecha entry fixed successfully"
