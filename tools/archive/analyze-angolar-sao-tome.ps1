# Extract and analyze Angolar Sao Tome names (i: 71)
$angolarSaoTomeEntry = '{"name":"Angolar Sao Tome","i":71,"min":5,"max":11,"d":"lnr","m":0,"b":"Sao Joao dos Angolares,Ribeira Peixe,Ilheu das Rolas,Praia Inhame,Praia Jale,Praia Cabana,Praia Miconde,Praia Messias Alves,Praia Pesqueira,Praia Vagre,Praia Negal,Praia Yepipa,Praia Umbugo,Praia Martim,Praia Leve,Praia Abade,Praia Cascata,Praia Erasmo,Angolares,Budo Budo,Vila Malanza,Cabaceira,Monte Carmo,Emolve,Uba Budo,Malanza,Praia Salema,Praia Barrosa,Praia Lozia,Praia Pesqueira Pequena,Praia Vermelha,Praia Viedade,Praia Camao,Praia Ihlo,Praia Caixao,Praia Margarida,Praia San Antonio,Praia Cabinda,Praia Boca de Inferno,Praia Santa Clara,Praia Santa Cruz,Praia Sao Joaquim"}'

# Parse the JSON and extract names
$data = $angolarSaoTomeEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Angolar Sao Tome (i: 71) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
