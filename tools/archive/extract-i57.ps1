# Extract entry at i: 57
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry57 = $entries | Where-Object { $_ -match '"i":\s*57' } | Select-Object -First 1
Write-Host "Entry at i: 57 found:"
Write-Host $entry57
