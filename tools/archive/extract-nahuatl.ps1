# Extract Nahuatl entry (i: 14)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$nahuatlEntry = $entries | Where-Object { $_ -match '"i":\s*14' } | Select-Object -First 1
Write-Host "Nahuatl entry found:"
Write-Host $nahuatlEntry
