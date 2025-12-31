# Extract entry at i: 28
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry28 = $entries | Where-Object { $_ -match '"i":\s*28' } | Select-Object -First 1
Write-Host "Entry at i: 28 found:"
Write-Host $entry28
