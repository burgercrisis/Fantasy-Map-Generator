# Extract and analyze Kui-Kuvi Dravidian names (i: 59)
$kuiKuviDravidianEntry = '{"name":"Kui-Kuvi Dravidian","i":59,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Koraput,Rayagada,Phulbani,Kandhamal,Malkangiri,Nabarangpur,Bhawanipatna,Paralakhemundi,Baipariguda,Lamtaput,Digapahandi,Chhatrapur,Brahmapur,Kothagiri,Jeypore,Laxmipur,Muniguda,Bissamcuttack,Gudari,Gunupur"}'

# Parse the JSON and extract names
$data = $kuiKuviDravidianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Kui-Kuvi Dravidian (i: 59) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
