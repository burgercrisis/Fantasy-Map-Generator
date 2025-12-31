# Extract and analyze Bauchi Chadic names (i: 67)
$bauchiChadicEntry = '{"name":"Bauchi Chadic","i":67,"min":4,"max":11,"d":"nic-GH","m":0,"b":"Bauchi,Toro,Dass,Bogoro,Tafawa Balewa,Kirfi,Alkaleri,Shira,Giade,Katagum,Jama\u0027are,Itas,Ganjuwa,Warji,Ningi,Azare,Miyaa,Dogon Ruwa,Gombe,Kaltungo,Billiri,Dukku"}'

# Parse the JSON and extract names
$data = $bauchiChadicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Bauchi Chadic (i: 67) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
