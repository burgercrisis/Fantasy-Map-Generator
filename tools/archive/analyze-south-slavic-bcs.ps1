# Extract and analyze South Slavic BCS names (i: 36)
$southSlavicBCSEntry = '{"name":"South Slavic BCS","i":36,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Sarajevo,Banja Luka,Mostar,Tuzla,Zenica,Bihac,Brcko,Zagreb,Split,Rijeka,Osijek,Zadar,Pula,Sibenik,Varazdin,Slavonski Brod,Dubrovnik,Beograd,Novi Sad,Nis,Kragujevac,Subotica,Novi Pazar,Podgorica,Niksic,Herceg Novi,Bar,Budva,Kotor"}'

# Parse the JSON and extract names
$data = $southSlavicBCSEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== South Slavic BCS (i: 36) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
