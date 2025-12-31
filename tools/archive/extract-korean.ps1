# Extract Korean entry (i: 10)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$koreanEntry = $entries | Where-Object { $_ -match '"i":\s*10' } | Select-Object -First 1
Write-Host "Korean entry found:"
Write-Host $koreanEntry
