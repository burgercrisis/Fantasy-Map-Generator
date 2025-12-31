# Extract English entry (i: 1)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$englishEntry = $entries | Where-Object { $_ -match '"i":\s*1' } | Select-Object -First 1
Write-Host "English entry found:"
Write-Host $englishEntry
