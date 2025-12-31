# Extract entry at i: 37
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry37 = $entries | Where-Object { $_ -match '"i":\s*37' } | Select-Object -First 1
Write-Host "Entry at i: 37 found:"
Write-Host $entry37
