# Extract exact Micronesian entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$micronesianEntry = $entries | Where-Object { $_ -match '"i":\s*53' } | Select-Object -First 1
Write-Host "Exact Micronesian entry:"
Write-Host $micronesianEntry
