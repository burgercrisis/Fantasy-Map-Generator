# Extract entry at i: 38
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry38 = $entries | Where-Object { $_ -match '"i":\s*38' } | Select-Object -First 1
Write-Host "Entry at i: 38 found:"
Write-Host $entry38
