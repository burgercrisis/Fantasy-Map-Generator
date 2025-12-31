# Extract entry at i: 70
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry70 = $entries | Where-Object { $_ -match '"i":\s*70' } | Select-Object -First 1
Write-Host "Entry at i: 70 found:"
Write-Host $entry70
