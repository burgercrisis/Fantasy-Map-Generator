# Extract entry at i: 49
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry49 = $entries | Where-Object { $_ -match '"i":\s*49' } | Select-Object -First 1
Write-Host "Entry at i: 49 found:"
Write-Host $entry49
