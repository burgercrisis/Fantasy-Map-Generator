# Extract exact Melanesian Vanuatu entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$melanesianVanuatuEntry = $entries | Where-Object { $_ -match '"i":\s*52' } | Select-Object -First 1
Write-Host "Exact Melanesian Vanuatu entry:"
Write-Host $melanesianVanuatuEntry
