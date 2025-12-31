# Extract entry at i: 51
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry51 = $entries | Where-Object { $_ -match '"i":\s*51' } | Select-Object -First 1
Write-Host "Entry at i: 51 found:"
Write-Host $entry51
