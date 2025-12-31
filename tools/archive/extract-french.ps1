# Extract French entry (i: 2)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$frenchEntry = $entries | Where-Object { $_ -match '"i":\s*2' } | Select-Object -First 1
Write-Host "French entry found:"
Write-Host $frenchEntry
