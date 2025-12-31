# Extract entry at i: 33
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry33 = $entries | Where-Object { $_ -match '"i":\s*33' } | Select-Object -First 1
Write-Host "Entry at i: 33 found:"
Write-Host $entry33
