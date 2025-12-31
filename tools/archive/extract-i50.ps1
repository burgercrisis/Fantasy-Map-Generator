# Extract entry at i: 50
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$entry50 = $entries | Where-Object { $_ -match '"i":\s*50' } | Select-Object -First 1
Write-Host "Entry at i: 50 found:"
Write-Host $entry50
