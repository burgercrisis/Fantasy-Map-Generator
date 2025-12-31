# Extract specific entries i: 5, 7, 13
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'

Write-Host "Entry at i: 5:"
$entry5 = $entries | Where-Object { $_ -match '"i":\s*5' } | Select-Object -First 1
Write-Host $entry5

Write-Host ""
Write-Host "Entry at i: 7:"
$entry7 = $entries | Where-Object { $_ -match '"i":\s*7' } | Select-Object -First 1
Write-Host $entry7

Write-Host ""
Write-Host "Entry at i: 13:"
$entry13 = $entries | Where-Object { $_ -match '"i":\s*13' } | Select-Object -First 1
Write-Host $entry13
