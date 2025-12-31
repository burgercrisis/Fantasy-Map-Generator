# Extract and analyze Ggui Click names (i: 45)
$gguiClickEntry = '{"name":"Ggui Click","i":45,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Gase,Gai,Gasa,Gan,Gaixom,Gaiigas,Gaib,Gais,Gauida,GGai,GGaiim,GGauis"}'

# Parse the JSON and extract names
$data = $gguiClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Ggui Click (i: 45) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
