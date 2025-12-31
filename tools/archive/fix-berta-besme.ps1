# Fix Berta-Besme entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'SudanKurmuk', 'Sudan'
$content = $content -replace 'Damazin,Senar,Kosti,Ad-Damazin', 'Damazin,Senar,Kosti,Fadasi'
$content = $content -replace 'Asosa,Kurmuk,Komosha,Bambasi,Menge', 'Asosa,Kurmuk,Komosha,Bambasi,Menge'
$content = $content -replace 'Assosa,Metekel', 'Gizen,Metekel'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Berta-Besme entry fixed successfully"
