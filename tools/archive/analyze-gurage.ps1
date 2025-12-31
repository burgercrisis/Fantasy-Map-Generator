# Extract and analyze Gurage names (i: 31)
$gurageEntry = '{"name":"Gurage","i":31,"min":4,"max":12,"d":"nic-GH","m":0,"b":"Butajira,Welkite,Imdibir,Worabe,Agena,Arekit,Endibir,Wolkite,Melga,Gunchire,Ottoro,Bue,Hosaena,Shone,Durame,Hadero,Doyogena,Soddo,Angacha,Gedeb,Ajora,Gumer,Endegagn,Inor,Ezha,Cheha,Geta,Meskane,Goro,Mohoni,Gunchi,Bozena,Wulbare,Zay,Lemen,Becho,Modjo,Dukem,Adama,Koka,Assela,Shashamane,Ambo,Buta,Jima,Bako,Metahara"}'

# Parse the JSON and extract names
$data = $gurageEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Gurage (i: 31) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
