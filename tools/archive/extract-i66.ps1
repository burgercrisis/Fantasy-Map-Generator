# Extract entry at i: 66
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry66 = $entries | Where-Object { $_ -match '"i":\s*66' } | Select-Object -First 1
Write-Host "Entry at i: 66 found:"
Write-Host $entry66
