# Extract entry at i: 47
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry47 = $entries | Where-Object { $_ -match '"i":\s*47' } | Select-Object -First 1
Write-Host "Entry at i: 47 found:"
Write-Host $entry47
