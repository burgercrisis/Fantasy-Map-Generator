# Extract and analyze Central Pacific names (i: 54)
$centralPacificEntry = '{"name":"Central Pacific","i":54,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Apia,Faleula,Vaitele,Siusega,Malie,Afega,Fasitoo,Uafato,Nuku\u0027alofa,Neiafu,Pangai,Hakahau,Matavai,Papeete,Punaauia,Faaa,Paopao,Uturoa,Taiohae,TaiohaeVillage"}'

# Parse the JSON and extract names
$data = $centralPacificEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Central Pacific (i: 54) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
