# Extract entry at i: 44
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry44 = $entries | Where-Object { $_ -match '"i":\s*44' } | Select-Object -First 1
Write-Host "Entry at i: 44 found:"
Write-Host $entry44
