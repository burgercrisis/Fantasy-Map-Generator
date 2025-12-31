# Extract entry at i: 69
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry69 = $entries | Where-Object { $_ -match '"i":\s*69' } | Select-Object -First 1
Write-Host "Entry at i: 69 found:"
Write-Host $entry69
