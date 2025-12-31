# Extract entry at i: 64
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry64 = $entries | Where-Object { $_ -match '"i":\s*64' } | Select-Object -First 1
Write-Host "Entry at i: 64 found:"
Write-Host $entry64
