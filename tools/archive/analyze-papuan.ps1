# Extract and analyze Papuan names (i: 44)
$papuanEntry = '{"name":"Papuan","i":44,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Tari,Mendi,Wabag,Ialibu,Koroba,Kagua,Kundiawa,Kerowagi,Minj,Banz,Goroka,Kainantu,Henganofi,Chuave,Obura,Wapenamanda,Kompiam,Porgera,Enga,Okapa,Menyamya,Finschhafen,Kikori,Tapu,qabiao_20214_u1,qabiao_20214_u2,qabiao_20214_u3,qabiao_20214_u4,qabiao_20214_u5,qabiao_20214_u6,qabiao_20214_u7,qabiao_20214_u8,qabiao_20214_u9,qabiao_20214_u10,qabiao_20214_u11,qabiao_20214_u12"}'

# Parse the JSON and extract names
$data = $papuanEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Papuan (i: 44) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
