# Extract exact Ukrainian entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$ukrainianEntry = $entries | Where-Object { $_ -match '"i":\s*57' } | Select-Object -First 1
Write-Host "Exact Ukrainian entry:"
Write-Host $ukrainianEntry
