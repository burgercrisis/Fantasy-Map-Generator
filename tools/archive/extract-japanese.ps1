# Extract Japanese entry (i: 12)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$japaneseEntry = $entries | Where-Object { $_ -match '"i":\s*12' } | Select-Object -First 1
Write-Host "Japanese entry found:"
Write-Host $japaneseEntry
