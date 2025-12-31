# Extract and analyze Portuguese names (i: 12)
$portugueseEntry = '{"name":"Portuguese","i":12,"min":5,"max":11,"d":"","m":0.1,"b":"Abrigada,Afonsoeiro,Agueda,Aguilada,Alagoas,Alagoinhas,Albufeira,Alcanhoes,Alcobaca,Alcoutim,Aldoar,Alenquer,Alfeizerao,Algarve,Almada,Almagreira,Almeirim,Alpalhao,Alpedrinha,Alvorada,Amieira,Anapolis,Apelacao,Aranhas,Arganil,Armacao,Assenceira,Aveiro,Avelar,Balsas,Barcarena,Barreiras,Barretos,Batalha,Beira,Benavente,Betim,Braga,Braganca,Brasilia,Brejo,Cabeceiras,Cabedelo,Cachoeiras,Cadafais,Calhandriz,Calheta,Caminha,Campinas,Canidelo,Caninhas,Capinha,Carmoes,Cartaxo,Carvalhal,Carvoeiro,Cascavel,Castanhal,Caxias,Chapadinha,Chaves,Cocais,Coentral,Coimbra,Comporta,Conde,Coqueirinho,Coruche,Damaia,Dourados,Enxames,Ericeira,Ermidel,Escalhao,Esmoriz,Espinhal,Estela,Estoril,Eunapolis,Evora,Famalicao,Fanhoes,Faro,Fatima,Felgueiras,Ferreira,Figueira,Flecheiras,Florianopolis,Fornalhas,Fortaleza,Freiria,Freixeira,Fronteira,Fundao,Gracas,Gradil,Grainho,Gralheira,Guimaraes,Horta,Ilhavo,Ilheus,Lages,Lagos,Laranjeiras,Lavacolhos,Leiria,Limoeiro,Linhares,Lisboa,Lomba,Lorvao,Lourical,Lourinha,Luziania,Macedo,Machava,Malveira,Marinhas,Maxial,Mealhada,Milharado,Mira,Mirandela,Mogadouro,Montalegre,Mourao,Nespereira,Nilopolis,Obidos,Odemira,Odivelas,Oeiras,Oleiros,Olhalvo,Olinda,Olival,Oliveira,Oliveirinha,Palheiros,Palmeira,Palmital,Pampilhosa,Pantanal,Paradinha,Paralheiros,Pedrosinho,Pegoes,Penafiel,Peniche,Pinhao,Pinheiro,Pombal,Pontinha,Quarteira,Queluz,Ramalhal,Reboleira,Recife,Redinha,Ribadouro,Ribeira,Ribeirao,Rosais,Sabugal,Sacavem,Sagres,Sandim,Sangalhos,Santarem,Santos,Sarilhos,Seixas,Seixezelo,Seixo,Silvares,Silveira,Sinhaem,Sintra,Sobral,Sobralinho,Tabuaco,Tabuleiro,Taveiro,Teixoso,Telhado,Telheiro,Tomar,Torreira,Trancoso,Troviscal,Vagos,Varzea,Velas,Viamao,Viana,Vidigal,Vidigueira,Vidual,Vilamar,Vimeiro,Vinhais,Vitoria,vora,Setbal,Viseu,Guarda"}'

# Parse the JSON and extract names
$data = $portugueseEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Portuguese (i: 12) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
