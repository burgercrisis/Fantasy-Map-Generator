# Extract entry at i: 68
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry68 = $entries | Where-Object { $_ -match '"i":\s*68' } | Select-Object -First 1
Write-Host "Entry at i: 68 found:"
Write-Host $entry68
