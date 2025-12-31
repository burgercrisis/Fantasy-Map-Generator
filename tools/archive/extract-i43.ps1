# Extract entry at i: 43
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry43 = $entries | Where-Object { $_ -match '"i":\s*43' } | Select-Object -First 1
Write-Host "Entry at i: 43 found:"
Write-Host $entry43
