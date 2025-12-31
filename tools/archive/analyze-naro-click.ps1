# Extract and analyze Naro Click names (i: 43)
$naroClickEntry = '{"name":"Naro Click","i":43,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Naro,Koro,Maru,Garo"}'

# Parse the JSON and extract names
$data = $naroClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Naro Click (i: 43) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
