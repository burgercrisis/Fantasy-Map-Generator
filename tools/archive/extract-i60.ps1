# Extract entry at i: 60
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry60 = $entries | Where-Object { $_ -match '"i":\s*60' } | Select-Object -First 1
Write-Host "Entry at i: 60 found:"
Write-Host $entry60
