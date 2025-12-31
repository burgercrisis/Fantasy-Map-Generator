# Extract entry at i: 46
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry46 = $entries | Where-Object { $_ -match '"i":\s*46' } | Select-Object -First 1
Write-Host "Entry at i: 46 found:"
Write-Host $entry46
