# Extract and analyze Basque names (i: 19)
$basqueEntry = '{"name":"Basque","i":19,"min":4,"max":11,"d":"r","m":0.1,"b":"Agurain,Aia,Aiara,Albiztur,Alkiza,Altzaga,Amorebieta,Amurrio,Andoain,Anoeta,Antzuola,Arakaldo,Arantzazu,Arbatzegi,Areatza,Arratzua,Arrieta,Artea,Artziniega,Asteasu,Astigarraga,Ataun,Atxondo,Aulesti,Azkoitia,Azpeitia,Bakio,Baliarrain,Barakaldo,Barrika,Barrundia,Basauri,Beasain,Bedia,Beizama,Belauntza,Berastegi,Bergara,Bermeo,Bernedo,Berriatua,Berriz,Bidania,Bilar,Bilbao,Busturia,Deba,Derio,Donostia,Dulantzi,Durango,Ea,Eibar,Elantxobe,Elduain,Elgeta,Elgoibar,Elorrio,Erandio,Ergoitia,Ermua,Errenteria,Errezil,Eskoriatza,Eskuernaga,Etxebarri,Etxebarria,Ezkio,Foura,Gabiria,Gaintza,Galdakao,Gamiz,Garai,Gasteiz,Gatzaga,Gaubea,Gautegiz,Gaztelu,Gernika,Gerrikaitz,Getaria,Getxo,Gizaburaga,Goiatz,Gorliz,Gorriaga,Harana,Hernani,Hondarribia,Ibarra,Ibarrangelu,Idiazabal,Iekora,Igorre,Ikaztegieta,Irun,Irura,Iruraiz,Itsaso,Itsasondo,Iurreta,Izurtza,Jatabe,Kanpezu,Karrantza,Kortezubi,Kripan,Kuartango,Lanestosa,Lantziego,Larrabetzu,Lasarte,Laukiz,Lazkao,Leaburu,Legazpi,Legorreta,Legutio,Leintz,Leioa,Lekeitio,Lemoa,Lemoiz,Leza,Lezama,Lezo,Lizartza,Maeztu,Mallabia,Manaria,Markina,Maruri,Menaka,Mendaro,Mendeta,Mendexa,Morga,Mundaka,Mungia,Munitibar,Muruetxa,Muskiz,Mutiloa,Mutriku,Nabarniz,Oiartzun,Oion,Okondo,Olaberria,Onati,Ondarroa,Ordizia,Orendain,Orexa,Oria,Orio,Ormaiztegi,Orozko,Ortuella,Otegi,Otxandio,Pasaia,Plentzia,Santurtzi,Sestao,Sondika,Soraluze,Sukarrieta,Tolosa,Trapagaran,Turtzioz,Ubarrundia,Ubide,Ugao,Urdua,Urduliz,Urizaharra,Urkabustaiz,Urnieta,Urretxu,Usurbil,Xemein,Zabaleta,Zaia,Zaldibar,Zambrana,Zamudio,Zaratamo,Zarautz,Zeberio,Zegama,Zerain,Zestoa,Zierbena,Zigoitia,Ziortza,Zuia,Zumaia,Zumarraga,Irua,Vitoria-Gasteiz,Pamplona,Baiona,Basque Country"}'

# Parse the JSON and extract names
$data = $basqueEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Basque (i: 19) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
