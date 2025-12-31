# Extract and analyze Lechitic names (i: 34)
$lechiticEntry = '{"name":"Lechitic","i":34,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Warszawa,Krakow,Gdansk,Poznan,Wroclaw,Szczecin,Lodz,Lublin,Bydgoszcz,Gdynia,Katowice,Bialystok,Rzeszow,Olsztyn,Bielsko-Biala,Kielce,Radom,Opole,Elblag,Plock,Torun,Zielona Gora,Gorzow Wielkopolski,Legnica,Glogow,Tarnow,Nowy Sacz,Przemysl,Suwalki,Inowroclaw,Kalisz"}'

# Parse the JSON and extract names
$data = $lechiticEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Lechitic (i: 34) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
