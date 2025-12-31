# Extract exact Sandawe Click entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$sandaweEntry = $entries | Where-Object { $_ -match '"i":\s*48' } | Select-Object -First 1
Write-Host "Exact Sandawe Click entry:"
Write-Host $sandaweEntry
