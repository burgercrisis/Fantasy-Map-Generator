# Extract and analyze Eastern Indonesian names (i: 51)
$easternIndonesianEntry = '{"name":"Eastern Indonesian","i":51,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Makassar,Kendari,Palopo,Parepare,Gorontalo,Manado,Bitung,Tolitoli,Poso,Luwuk,Mamuju,Kupang,Atambua,Kefamenanu,Soe,Maumere,Ende,Bajawa,Ruteng,Waingapu,Labuan Bajo"}'

# Parse the JSON and extract names
$data = $easternIndonesianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Eastern Indonesian (i: 51) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
