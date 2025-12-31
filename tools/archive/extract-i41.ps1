# Extract entry at i: 41
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry41 = $entries | Where-Object { $_ -match '"i":\s*41' } | Select-Object -First 1
Write-Host "Entry at i: 41 found:"
Write-Host $entry41
