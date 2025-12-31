# Extract entry at i: 65
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry65 = $entries | Where-Object { $_ -match '"i":\s*65' } | Select-Object -First 1
Write-Host "Entry at i: 65 found:"
Write-Host $entry65
