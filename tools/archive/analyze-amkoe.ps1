# Extract and analyze Amkoe names (i: 39)
$amkoeEntry = '{"name":"Amkoe","i":39,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Tsumkwe,Aroab,Blouputs,Gobabis,Kgalagadi,Kumune,Epukiro,Gxai,Karibib,Tsabis,Nossob,Leonardsville,Tses,Aminuis,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Mariental"}'

# Parse the JSON and extract names
$data = $amkoeEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Amkoe (i: 39) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
