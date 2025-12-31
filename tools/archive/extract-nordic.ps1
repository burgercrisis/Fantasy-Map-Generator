# Extract Nordic entry (i: 6)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$nordicEntry = $entries | Where-Object { $_ -match '"i":\s*6' } | Select-Object -First 1
Write-Host "Nordic entry found:"
Write-Host $nordicEntry
