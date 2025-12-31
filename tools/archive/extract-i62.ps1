# Extract entry at i: 62
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry62 = $entries | Where-Object { $_ -match '"i":\s*62' } | Select-Object -First 1
Write-Host "Entry at i: 62 found:"
Write-Host $entry62
