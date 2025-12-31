# Extract exact Hawaiian entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$hawaiianEntry = $entries | Where-Object { $_ -match '"i":\s*24' } | Select-Object -First 1
Write-Host "Exact Hawaiian entry:"
Write-Host $hawaiianEntry
