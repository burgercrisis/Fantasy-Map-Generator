# Extract entry at i: 45
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry45 = $entries | Where-Object { $_ -match '"i":\s*45' } | Select-Object -First 1
Write-Host "Entry at i: 45 found:"
Write-Host $entry45
