# Extract entry at i: 48
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry48 = $entries | Where-Object { $_ -match '"i":\s*48' } | Select-Object -First 1
Write-Host "Entry at i: 48 found:"
Write-Host $entry48
