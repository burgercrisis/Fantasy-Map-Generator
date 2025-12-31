# Extract entry at i: 36
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry36 = $entries | Where-Object { $_ -match '"i":\s*36' } | Select-Object -First 1
Write-Host "Entry at i: 36 found:"
Write-Host $entry36
