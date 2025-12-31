# Extract and analyze Bulgarian names (i: 56)
$bulgarianEntry = '{"name":"Bulgarian","i":56,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Sofia,Plovdiv,Varna,Burgas,Ruse,Stara Zagora,Pleven,Sliven,Dobrich,Shumen,Pernik,Haskovo,Yambol,Pazardzhik,Blagoevgrad,Elhovo Tarnovo,Vratsa,Gabrovo,Kardzhali,Kyustendil,Lovech,Montana,Razgrad,Silistra,Smolyan,Targovishte,Vidin,Asenovgrad,Kazanlak,Svishtov,Dimitrovgrad,Sevlievo,Omurtag,Gotse Delchev,Panagyurishte,Botevgrad,Sandanski,Khaskovo,Troyan,Gorna Oryahovitsa,Dupnitsa"}'

# Parse the JSON and extract names
$data = $bulgarianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Bulgarian (i: 56) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
