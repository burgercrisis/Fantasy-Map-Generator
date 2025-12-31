# Extract and analyze Sandawe Click names (i: 48)
$sandaweClickEntry = '{"name":"Sandawe Click","i":48,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Bahi,Gumbi,Kigwe,Nyambwa,Mbete,Sandawe,Tumbi,Kwamtili,Ilunde,Ngongwa,Ndolela"}'

# Parse the JSON and extract names
$data = $sandaweClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Sandawe Click (i: 48) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
