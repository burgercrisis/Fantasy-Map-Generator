# Extract entry at i: 58
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry58 = $entries | Where-Object { $_ -match '"i":\s*58' } | Select-Object -First 1
Write-Host "Entry at i: 58 found:"
Write-Host $entry58
