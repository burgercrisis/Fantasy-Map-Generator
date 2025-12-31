# Extract entry at i: 53
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry53 = $entries | Where-Object { $_ -match '"i":\s*53' } | Select-Object -First 1
Write-Host "Entry at i: 53 found:"
Write-Host $entry53
