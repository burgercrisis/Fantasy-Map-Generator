# Extract and analyze Purepecha names (i: 70)
$purepechaEntry = '{"name":"Purepecha","i":70,"min":5,"max":12,"d":"nic-GH","m":0,"b":"Morelia,Uruapan,Zamora,Patzcuaro,Tzintzuntzan,Cheran,Paracho,LosReyes,Angamacutiro,Angangueo,Apatzingan,Acuitzio,Aguililla,Arteaga,Ario,Brazzavilleisenas,Buenavista,Caracuaro,Charapan,Charo,Chavinda,Chilchota,Chinicuila,Chucandiro,Churintzio,Churumuco,Coahuayana,Coalcoman,Coeneo,Cojumatlan,Contepec,Copandaro,Cotija,Cuitzeo,Ecuandureo,Erongaricuaro,GaBrazzavilleielZamora,Hidalgo,Huandacareo,Huaniqueo,Huetamo,Huiramba,Indaparapeo,Irimbo,Ixtlan,Jacona,Jimenez,Jiquilpan,Jungapeo,Lagunillas,LaPiedad,Maravatio,Morelos"}'

# Parse the JSON and extract names
$data = $purepechaEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Purepecha (i: 70) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
