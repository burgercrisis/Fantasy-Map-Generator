# Extract entry at i: 56
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry56 = $entries | Where-Object { $_ -match '"i":\s*56' } | Select-Object -First 1
Write-Host "Entry at i: 56 found:"
Write-Host $entry56
