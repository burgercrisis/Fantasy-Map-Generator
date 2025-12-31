# Extract exact Papuan entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$papuanEntry = $entries | Where-Object { $_ -match '"i":\s*44' } | Select-Object -First 1
Write-Host "Exact Papuan entry:"
Write-Host $papuanEntry
