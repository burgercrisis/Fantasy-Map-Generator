# Extract entry at i: 59
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry59 = $entries | Where-Object { $_ -match '"i":\s*59' } | Select-Object -First 1
Write-Host "Entry at i: 59 found:"
Write-Host $entry59
