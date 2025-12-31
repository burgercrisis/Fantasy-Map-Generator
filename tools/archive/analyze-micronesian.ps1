# Extract and analyze Micronesian names (i: 53)
$micronesianEntry = '{"name":"Micronesian","i":53,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Palikir,Kolonia,Weno,Tofol,Yap,Colonia,Ebeye,Majuro,Jaluit,Tarawa,Betio,Bairiki,Saipan,Garapan,Tinian,Rota,Koror,Airai,Ngerulmud"}'

# Parse the JSON and extract names
$data = $micronesianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Micronesian (i: 53) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
