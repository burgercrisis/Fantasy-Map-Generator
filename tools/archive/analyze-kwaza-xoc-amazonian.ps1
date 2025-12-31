# Extract and analyze Kwaza-Xoc Amazonian names (i: 69)
$kwazaXocAmazonianEntry = '{"name":"Kwaza-Xoc Amazonian","i":69,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Ji-Paran,Cacoal,Vilhena,Guajar-Mirim,Ariquemes,Humait,Altamira,Santarm,Itaituba,Marab,Araguana,Palmas,Aracaju,Propri,Penedo,Paulo Afonso,Delmiro Gouveia"}'

# Parse the JSON and extract names
$data = $kwazaXocAmazonianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Kwaza-Xoc Amazonian (i: 69) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
