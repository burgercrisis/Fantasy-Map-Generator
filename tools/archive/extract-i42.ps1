# Extract entry at i: 42
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry42 = $entries | Where-Object { $_ -match '"i":\s*42' } | Select-Object -First 1
Write-Host "Entry at i: 42 found:"
Write-Host $entry42
