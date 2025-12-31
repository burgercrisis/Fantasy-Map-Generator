# Fix Tungusic entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'Sovetskaya,Gavan', 'Sovetskaya Gavan'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Tungusic entry fixed successfully"
