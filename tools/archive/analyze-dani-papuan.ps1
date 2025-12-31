# Extract and analyze Dani Papuan names (i: 50)
$daniPapuanEntry = '{"name":"Dani Papuan","i":50,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Wamena,Kurima,Pyramid,Asologaima,Usatfak,Elelim,Bokondini,Karubaga,Tiom,Ninia,Soba,Kurulu,Asolokobal,Welesi,Hubikosi,Huleka,Yiwika,Dugum,Hitigima,Sinakma"}'

# Parse the JSON and extract names
$data = $daniPapuanEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Dani Papuan (i: 50) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
