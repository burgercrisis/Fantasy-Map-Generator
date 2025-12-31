# Extract entry at i: 52
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry52 = $entries | Where-Object { $_ -match '"i":\s*52' } | Select-Object -First 1
Write-Host "Entry at i: 52 found:"
Write-Host $entry52
