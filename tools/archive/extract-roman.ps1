# Extract Roman entry (i: 8)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$romanEntry = $entries | Where-Object { $_ -match '"i":\s*8' } | Select-Object -First 1
Write-Host "Roman entry found:"
Write-Host $romanEntry
