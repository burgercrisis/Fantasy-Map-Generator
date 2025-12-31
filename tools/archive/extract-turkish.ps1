# Extract Turkish entry (i: 16)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$turkishEntry = $entries | Where-Object { $_ -match '"i":\s*16' } | Select-Object -First 1
Write-Host "Turkish entry found:"
Write-Host $turkishEntry
