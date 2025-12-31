# Extract entry at i: 54
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry54 = $entries | Where-Object { $_ -match '"i":\s*54' } | Select-Object -First 1
Write-Host "Entry at i: 54 found:"
Write-Host $entry54
