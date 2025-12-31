# Extract and analyze Czech-Slovak names (i: 35)
$czechSlovakEntry = '{"name":"Czech-Slovak","i":35,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Praha,Brno,Ostrava,Plzen,Olomouc,Liberec,Usti nad Labem,Hradec Kralove,Pardubice,Zlin,Jihlava,Ceske Budejovice,Karlovy Vary,Most,Opava,Chomutov,Trnava,Trencin,Nitra,Zilina,Banska Bystrica,Presov,Kosice,Poprad,Martin,Prievidza,Komarno,Spisska Nova Ves,Cesky Krumlov,Pisek,Kutna Hora"}'

# Parse the JSON and extract names
$data = $czechSlovakEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Czech-Slovak (i: 35) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
