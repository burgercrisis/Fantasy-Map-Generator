# Extract exact Hadza Click entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$hadzaEntry = $entries | Where-Object { $_ -match '"i":\s*47' } | Select-Object -First 1
Write-Host "Exact Hadza Click entry:"
Write-Host $hadzaEntry
