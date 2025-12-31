# Fix Gondi entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$content = $content -replace 'Bhadradri Kothagudem', 'Bhadradri'
$content = $content -replace 'Chhattisgarh,Madhya Pradesh,India,Central India', 'Betul,Jabalpur,Amravati,Yavatmal'
Set-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" $content -NoNewline
Write-Host "Gondi entry fixed successfully"
