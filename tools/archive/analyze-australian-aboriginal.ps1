# Extract and analyze Australian Aboriginal names (i: 33)
$australianAboriginalEntry = '{"name":"Australian Aboriginal","i":33,"min":4,"max":11,"d":"pam-AU","m":0,"b":"Maningrida,Yirrkala,Galiwinku,Gunbalanya,Nhulunbuy,Borroloola,Yuendumu,Papunya,Jabiru,Kununurra,Yulara,Arnhem"}'

# Parse the JSON and extract names
$data = $australianAboriginalEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Australian Aboriginal (i: 33) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
