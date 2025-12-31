# Extract and analyze Tungusic names (i: 64)
$tungusicEntry = '{"name":"Tungusic","i":64,"min":4,"max":11,"d":"nic-GH","m":0,"b":"Khabarovsk,Komsomolsk,Amursk,Solnechny,Nikolayevsk,Okhotsk,De-Kastri,Sovetskaya,Gavan,Vladivostok,Nakhodka,Magadan,Aldan,Blagoveshchensk,Birobidzhan,Tynda,Skovorodino,Belogorsk,Khandyga,Yakutsk,Tiksi"}'

# Parse the JSON and extract names
$data = $tungusicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Tungusic (i: 64) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
