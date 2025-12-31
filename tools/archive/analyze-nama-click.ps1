# Extract and analyze Nama Click names (i: 42)
$namaClickEntry = '{"name":"Nama Click","i":42,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Keetmanshoop,Mariental,Luderitz,Oranjemund,Aus,Karasburg,Bethanie,Ausis,Gibeon,Helmeringhausen,Grnau,Holoog,Koes,Koeras,Gruenau,Kub"}'

# Parse the JSON and extract names
$data = $namaClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Nama Click (i: 42) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
