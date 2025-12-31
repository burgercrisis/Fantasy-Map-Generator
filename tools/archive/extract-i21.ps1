# Extract entry at i: 21
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry21 = $entries | Where-Object { $_ -match '"i":\s*21' } | Select-Object -First 1
Write-Host "Entry at i: 21 found:"
Write-Host $entry21
