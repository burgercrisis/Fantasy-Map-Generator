# Extract Basque entry (i: 19)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$basqueEntry = $entries | Where-Object { $_ -match '"i":\s*19' } | Select-Object -First 1
Write-Host "Basque entry found:"
Write-Host $basqueEntry
