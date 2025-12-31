# Extract exact Juhoan Click entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$juhoanEntry = $entries | Where-Object { $_ -match '"i":\s*46' } | Select-Object -First 1
Write-Host "Exact Juhoan Click entry:"
Write-Host $juhoanEntry
