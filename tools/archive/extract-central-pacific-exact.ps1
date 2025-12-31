# Extract exact Central Pacific entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$centralPacificEntry = $entries | Where-Object { $_ -match '"i":\s*54' } | Select-Object -First 1
Write-Host "Exact Central Pacific entry:"
Write-Host $centralPacificEntry
