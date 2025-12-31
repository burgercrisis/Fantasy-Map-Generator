# Extract and analyze Hadza Click names (i: 47)
$hadzaClickEntry = '{"name":"Hadza Click","i":47,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Yumbi,yanga,nega,miko,hadza,kila,tesha,dooma,salama"}'

# Parse the JSON and extract names
$data = $hadzaClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Hadza Click (i: 47) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
