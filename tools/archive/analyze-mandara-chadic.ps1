# Extract and analyze Mandara Chadic names (i: 66)
$mandaraChadicEntry = '{"name":"Mandara Chadic","i":66,"min":4,"max":11,"d":"nic-GH","m":0,"b":"Maroua,Mokolo,Mora,Kousseri,Yagoua,Garoua,Guider,Kaele,Pouss,Bogo,Fotokol,Tokombere,Hina,Bourrha,Koza,Zama,Kerawa,Gwoza,Mubi,Madagali,Bama,Banki"}'

# Parse the JSON and extract names
$data = $mandaraChadicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Mandara Chadic (i: 66) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
