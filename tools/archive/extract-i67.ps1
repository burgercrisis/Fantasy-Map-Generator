# Extract entry at i: 67
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry67 = $entries | Where-Object { $_ -match '"i":\s*67' } | Select-Object -First 1
Write-Host "Entry at i: 67 found:"
Write-Host $entry67
