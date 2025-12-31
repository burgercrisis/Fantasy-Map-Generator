# Extract Italian entry (i: 3)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$italianEntry = $entries | Where-Object { $_ -match '"i":\s*3' } | Select-Object -First 1
Write-Host "Italian entry found:"
Write-Host $italianEntry
