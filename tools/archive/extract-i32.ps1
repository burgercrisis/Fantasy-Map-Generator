# Extract entry at i: 32
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry32 = $entries | Where-Object { $_ -match '"i":\s*32' } | Select-Object -First 1
Write-Host "Entry at i: 32 found:"
Write-Host $entry32
