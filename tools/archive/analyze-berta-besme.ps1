# Extract and analyze Berta-Besme names (i: 62)
$bertaBesmeEntry = '{"name":"Berta-Besme","i":62,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Asosa,Kurmuk,Komosha,Bambasi,Menge,Tongo,Gizan,SudanKurmuk,Rosaires,Damazin,Senar,Kosti,Ad-Damazin,Gadaref,Qallabat,Assosa,Metekel"}'

# Parse the JSON and extract names
$data = $bertaBesmeEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Berta-Besme (i: 62) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
