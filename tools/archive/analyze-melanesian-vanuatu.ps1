# Extract and analyze Melanesian Vanuatu names (i: 52)
$melanesianVanuatuEntry = '{"name":"Melanesian Vanuatu","i":52,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Luganville,Norsup,Sola,Saratamata,Longana,Lakatoro,Norfolk,Isangel,Lenakel,Litzlitz,Loltong,Mota Lava,Louganville,Auki,Honiara,Gizo,Munda,Tulagi"}'

# Parse the JSON and extract names
$data = $melanesianVanuatuEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Melanesian Vanuatu (i: 52) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
