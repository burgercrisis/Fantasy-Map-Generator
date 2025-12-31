# Extract and analyze Bemba-Bembe-Fwe names (i: 61)
$bembaBembeFweEntry = '{"name":"Bemba-Bembe-Fwe","i":61,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Lusaka,Ndola,Kitwe,Chingola,Mufulira,Luanshya,Kasama,Mbala,Mansa,Chipata,Solwezi,Mazabuka,Mpongwe,Kabwe,Serenje,Kapiri Mposhi,Mwinilunga,Mongu,Senanga,Kaoma,Livingstone,Victoria Falls,Siavonga,Katima Mulilo,Kalabo"}'

# Parse the JSON and extract names
$data = $bembaBembeFweEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Bemba-Bembe-Fwe (i: 61) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
