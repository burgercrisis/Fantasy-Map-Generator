# Extract and analyze Gondi names (i: 58)
$gondiEntry = '{"name":"Gondi","i":58,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Gondia,Balaghat,Bastar,Jagdalpur,Bijapur,Kondagaon,Narayanpur,Dantewada,Sukma,Kanker,Dhamtari,Rajnandgaon,Nagpur,Chandrapur,Gadchiroli,Adilabad,Nirmal,Khammam,Bhadradri Kothagudem,Bhandara,Mandla,Dindori,Chhindwara,Seoni,Chhattisgarh,Madhya Pradesh,India,Central India"}'

# Parse the JSON and extract names
$data = $gondiEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Gondi (i: 58) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
