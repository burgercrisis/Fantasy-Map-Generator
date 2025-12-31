# Extract and analyze Engan Papuan names (i: 49)
$enganPapuanEntry = '{"name":"Engan Papuan","i":49,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Wabag,Wapenamanda,Kandep,Laiagam,Kompiam,Porgera,Ambum,Lagaip,Wapi,Yengis,Maip,Muritaka,Pilikambi,Paela,Hewa,Tsak,Maramuni,Enga,Lai"}'

# Parse the JSON and extract names
$data = $enganPapuanEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Engan Papuan (i: 49) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
