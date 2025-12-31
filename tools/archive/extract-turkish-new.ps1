# Extract Turkish entry (i: 15)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$turkishEntry = $entries | Where-Object { $_ -match '"i":\s*15' } | Select-Object -First 1
Write-Host "Turkish entry found:"
Write-Host $turkishEntry
