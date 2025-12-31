# Extract and analyze East Chadic names (i: 68)
$eastChadicEntry = '{"name":"East Chadic","i":68,"min":4,"max":11,"d":"nic-GH","m":0,"b":"N\u0027Djamena,Bol,Massakory,Mao,Mousoro,Massaguet,Bongor,Pala,Kelo,Lai,Sarh,Am Timan,Ati,Mongo,Biltine,Abch,Bitkine,Bousso,Fianga,Br,East Chadic,Nigeria,Chad,Cameroon,North East,North Central,West Africa,Maiduguri,Yola,Bauchi,Gombe,Mubi"}'

# Parse the JSON and extract names
$data = $eastChadicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== East Chadic (i: 68) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
