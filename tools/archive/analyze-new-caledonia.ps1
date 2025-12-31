# Extract and analyze New Caledonia names (i: 55)
$newCaledoniaEntry = '{"name":"New Caledonia","i":55,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Noumea,Dumbea,Paita,Mont-Dore,Boulouparis,La Foa,Bourail,Kone,Koumac,Poindimie,Hienghene,Thio,Houailou,Pouebo,Poum,Lifou,We,Mare,Tadine,Ouvea,Fayaoue"}'

# Parse the JSON and extract names
$data = $newCaledoniaEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== New Caledonia (i: 55) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
