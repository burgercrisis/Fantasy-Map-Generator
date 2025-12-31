# Extract entry at i: 72
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry72 = $entries | Where-Object { $_ -match '"i":\s*72' } | Select-Object -First 1
Write-Host "Entry at i: 72 found:"
Write-Host $entry72
