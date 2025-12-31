# Extract entry at i: 34
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry34 = $entries | Where-Object { $_ -match '"i":\s*34' } | Select-Object -First 1
Write-Host "Entry at i: 34 found:"
Write-Host $entry34
