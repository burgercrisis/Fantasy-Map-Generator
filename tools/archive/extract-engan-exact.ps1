# Extract exact Engan Papuan entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$enganEntry = $entries | Where-Object { $_ -match '"i":\s*49' } | Select-Object -First 1
Write-Host "Exact Engan Papuan entry:"
Write-Host $enganEntry
