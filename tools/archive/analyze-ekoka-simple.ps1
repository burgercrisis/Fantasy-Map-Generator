# Extract and analyze Ekoka Kung names (i: 37)
$ekokaKungEntry = '{"name":"Ekoka Kung","i":37,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Aminuis,Aroab,Grootfontein,Wilhelmstal,Araub,Witvlei,Stampriet,Marienthal,Kalahari,Tsumkwe,Blouputs"}'

# Parse the JSON and extract names
$data = $ekokaKungEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Ekoka Kung (i: 37) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
