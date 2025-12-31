# Extract and analyze Ukrainian names (i: 57)
$ukrainianEntry = '{"name":"Ukrainian","i":57,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Kyiv,Kharkiv,Odesa,Dnipro,Donetsk,Zaporizhzhia,Lviv,Kyiv,Mykolaiv,Mariupol,Vinnytsia,Kherson,Chernihiv,Poltava,Cherkasy,Sumy,Zhytomyr,Rivne,Khmelnytskyi,Chernivtsi,Ivano-Frankivsk,Ternopil,Lutsk,Uzhhorod,Bila Tserkva,Kamianets-Podilskyi,Brovary,Boryspil,Melitopol,Berdiansk,Nikopol,Kramatorsk,Sloviansk,Pavlohrad,Severodonetsk,Konotop,Shostka,Nizhyn,Kremenchuk"}'

# Parse the JSON and extract names
$data = $ukrainianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Ukrainian (i: 57) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
