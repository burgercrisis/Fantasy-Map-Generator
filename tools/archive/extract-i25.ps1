# Extract entry at i: 25
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry25 = $entries | Where-Object { $_ -match '"i":\s*25' } | Select-Object -First 1
Write-Host "Entry at i: 25 found:"
Write-Host $entry25
