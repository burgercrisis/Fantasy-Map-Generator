# Extract and analyze Harari-Argobba names (i: 32)
$harariArgobbaEntry = '{"name":"Harari-Argobba","i":32,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Harar,Dire-Dawa,Alemaya,Babile,Gursum,Deder,Hirna,Chiro,Gelemso,Aweday,Metahara,Awash,Adama,Nazret,Asebe-Teferi,Kulubi,Aliyu-Amba,Shewa-Robit,Debre-Birhan,Awash-Sebat"}'

# Parse the JSON and extract names
$data = $harariArgobbaEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Harari-Argobba (i: 32) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
