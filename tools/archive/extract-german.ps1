# Extract German entry
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$germanEntry = $entries | Where-Object { $_ -match '"i":\s*0' } | Select-Object -First 1
Write-Host "German entry found:"
Write-Host $germanEntry
