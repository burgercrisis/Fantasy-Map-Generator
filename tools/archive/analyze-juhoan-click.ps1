# Extract and analyze Juhoan Click names (i: 46)
$juhoanClickEntry = '{"name":"Ju/\u0027hoan Click","i":46,"min":3,"max":9,"d":"lnrtkxgms","m":0,"b":"Ghanzi,Dekar,Kang,Tshane,Nata,Maun,Shakawe,Kasane,Gumare,Sebina,Matsiloje,Mogoditshane,Namagari,bokakwa,namapo"}'

# Parse the JSON and extract names
$data = $juhoanClickEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Juhoan Click (i: 46) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
