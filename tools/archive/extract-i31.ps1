# Extract entry at i: 31
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry31 = $entries | Where-Object { $_ -match '"i":\s*31' } | Select-Object -First 1
Write-Host "Entry at i: 31 found:"
Write-Host $entry31
