# Extract exact Gondi entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$gondiEntry = $entries | Where-Object { $_ -match '"i":\s*58' } | Select-Object -First 1
Write-Host "Exact Gondi entry:"
Write-Host $gondiEntry
