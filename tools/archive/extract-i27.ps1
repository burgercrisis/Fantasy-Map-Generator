# Extract entry at i: 27
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry27 = $entries | Where-Object { $_ -match '"i":\s*27' } | Select-Object -First 1
Write-Host "Entry at i: 27 found:"
Write-Host $entry27
