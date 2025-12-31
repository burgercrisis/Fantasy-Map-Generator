# Extract entry at i: 30
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry30 = $entries | Where-Object { $_ -match '"i":\s*30' } | Select-Object -First 1
Write-Host "Entry at i: 30 found:"
Write-Host $entry30
