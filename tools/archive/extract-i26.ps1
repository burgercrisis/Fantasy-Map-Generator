# Extract entry at i: 26
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry26 = $entries | Where-Object { $_ -match '"i":\s*26' } | Select-Object -First 1
Write-Host "Entry at i: 26 found:"
Write-Host $entry26
