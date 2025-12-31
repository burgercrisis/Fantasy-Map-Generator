# Fix East Chadic entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'East Chadic,Nigeria,Chad,Cameroon,North East,North Central,West Africa', 'Doba,Moundou,Kousseri,Maroua,Yagoua,Guider,Zina'
$content = $content -replace 'Br', 'Brazzaville'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "East Chadic entry fixed successfully"
