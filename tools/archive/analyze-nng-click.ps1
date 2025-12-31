# Extract and analyze Nng Click names (i: 41)
$nngClickEntry = '{"name":"Nng Click","i":41,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet"}'

# Parse the JSON and extract names
$data = $nngClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Nng Click (i: 41) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
