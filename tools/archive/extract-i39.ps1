# Extract entry at i: 39
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry39 = $entries | Where-Object { $_ -match '"i":\s*39' } | Select-Object -First 1
Write-Host "Entry at i: 39 found:"
Write-Host $entry39
