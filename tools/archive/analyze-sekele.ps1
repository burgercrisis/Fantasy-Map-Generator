# Extract and analyze Sekele names (i: 38)
$sekeleEntry = '{"name":"Sekele","i":38,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Kgalagadi,Kumune,Epukiro,Gxai,Gobabis,Karibib,Tsabis,Nossob,Leonardsville,Tses,Gaborone,Francistown,Maun,Molepolobe,Kasane,Mogoditshane,Serowe,Mahalapye,Lobatse,Palapye,Kanye,Mochudi"}'

# Parse the JSON and extract names
$data = $sekeleEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Sekele (i: 38) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
