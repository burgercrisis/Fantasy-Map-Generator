# Extract entry at i: 22
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry22 = $entries | Where-Object { $_ -match '"i":\s*22' } | Select-Object -First 1
Write-Host "Entry at i: 22 found:"
Write-Host $entry22
