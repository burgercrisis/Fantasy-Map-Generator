# Extract Arabic entry (i: 18)
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$arabicEntry = $entries | Where-Object { $_ -match '"i":\s*18' } | Select-Object -First 1
Write-Host "Arabic entry found:"
Write-Host $arabicEntry
