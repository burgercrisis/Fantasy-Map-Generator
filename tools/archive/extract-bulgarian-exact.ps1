# Extract exact Bulgarian entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$bulgarianEntry = $entries | Where-Object { $_ -match '"i":\s*56' } | Select-Object -First 1
Write-Host "Exact Bulgarian entry:"
Write-Host $bulgarianEntry
