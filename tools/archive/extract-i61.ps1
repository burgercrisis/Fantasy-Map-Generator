# Extract entry at i: 61
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry61 = $entries | Where-Object { $_ -match '"i":\s*61' } | Select-Object -First 1
Write-Host "Entry at i: 61 found:"
Write-Host $entry61
