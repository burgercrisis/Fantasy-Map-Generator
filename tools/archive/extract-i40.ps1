# Extract entry at i: 40
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry40 = $entries | Where-Object { $_ -match '"i":\s*40' } | Select-Object -First 1
Write-Host "Entry at i: 40 found:"
Write-Host $entry40
