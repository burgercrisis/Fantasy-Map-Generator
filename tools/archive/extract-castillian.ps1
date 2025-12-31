# Extract Castillian entry (i: 4)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$castillianEntry = $entries | Where-Object { $_ -match '"i":\s*4' } | Select-Object -First 1
Write-Host "Castillian entry found:"
Write-Host $castillianEntry
