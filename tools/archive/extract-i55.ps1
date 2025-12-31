# Extract entry at i: 55
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry55 = $entries | Where-Object { $_ -match '"i":\s*55' } | Select-Object -First 1
Write-Host "Entry at i: 55 found:"
Write-Host $entry55
