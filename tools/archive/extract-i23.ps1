# Extract entry at i: 23
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry23 = $entries | Where-Object { $_ -match '"i":\s*23' } | Select-Object -First 1
Write-Host "Entry at i: 23 found:"
Write-Host $entry23
