# Extract and analyze Taa Click names (i: 40)
$taaClickEntry = '{"name":"Taa Click","i":40,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Mariental,Kalahari,Tsumkwe,Blouputs"}'

# Parse the JSON and extract names
$data = $taaClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Taa Click (i: 40) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
