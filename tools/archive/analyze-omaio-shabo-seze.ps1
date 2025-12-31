# Extract and analyze Omaio-Shabo-Seze names (i: 63)
$omaioShaboSezeEntry = '{"name":"Omaio-Shabo-Seze","i":63,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Gambela,Itang,Gog,Abobo,Jikawo,Lare,Akobo,Pochalla,Pagak,Nasir,Mading,Raik,Asosa,Metekel,Guba,Kamashi,Tepi,Godere"}'

# Parse the JSON and extract names
$data = $omaioShaboSezeEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Omaio-Shabo-Seze (i: 63) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
