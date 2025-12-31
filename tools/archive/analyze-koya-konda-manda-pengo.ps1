# Extract and analyze Koya-Konda-Manda-Pengo names (i: 60)
$koyaKondaMandaPengoEntry = '{"name":"Koya-Konda-Manda-Pengo","i":60,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Kothagudem,Bhadrachalam,Warangal,Mulugu,Aswaraopeta,Paloncha,Manuguru,Etapalli,Bijapur,Konta,Bhopalpatnam,Allapalli,Parvathipuram,Salur,Palakonda,Seethanagaram,Rampachodavaram,Chintor"}'

# Parse the JSON and extract names
$data = $koyaKondaMandaPengoEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Koya-Konda-Manda-Pengo (i: 60) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
