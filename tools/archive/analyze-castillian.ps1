# Extract and analyze Castillian names
$castillianEntry = '{"name":"Castillian","i":4,"min":5,"max":11,"d":"lr","m":0,"b":"Ajofrin,Alameda,Alaminos,Albares,Albarreal,Albendiego,Alcanizo,Alcaudete,Alcoa,Aldea,Aldeanueva,Algar,Algora,Alhondiga,Almadrones,Almendral,Alovera,Anguita,Arbancon,Argecilla,Arges,Arroyo,Atanzon,Atienza,Azuqueca,Baides,Banos,Bargas,Barriopedro,Belvis,Berninches,Brihuega,Buenaventura,Burgos,Burguillos,Bustares,Cabanillas,Calzada,Camarena,Campillo,Cantalojas,Cardiel,Carmena,Casas,Castejon,Castellar,Castilforte,Castillo,Castilnuevo,Cazalegas,Centenera,Cervera,Checa,Chozas,Chueca,Cifuentes,Cincovillas,Ciruelas,Cogollor,Cogolludo,Consuegra,Copernal,Corral,Cuerva,Domingo,Dosbarrios,Driebes,Duron,Escalona,Escalonilla,Escamilla,Escopete,Espinosa,Esplegares,Esquivias,Estables,Estriegana,Fontanar,Fuembellida,Fuensalida,Fuentelsaz,Gajanejos,Galvez,Gascuena,Gerindote,Guadamur,Heras,Herreria,Herreruela,Hinojosa,Hita,Hombrados,Hontanar,Hormigos,Huecas,Huerta,Humanaes,Illana,Illescas,Iniestola,Irueste,Jadraque,Jirueque,Lagartera,Ledanca,Lillo,Lominchar,Loranca,Lucillos,Luzaga,Luzon,Madrid,Magan,Malaga,Malpica,Manzanares,Maqueda,Masegoso,Matillas,Medranda,Megina,Mejorada,Millana,Milmarcos,Mirabueno,Miralrio,Mocejon,Mochales,Molina,Mondejar,Montarron,Mora,Moratilla,Morenilla,Navas,Negredo,Noblejas,Numancia,Nuno,Ocana,Ocentejo,Olias,Olmeda,Ontigola,Orea,Orgaz,Oropesa,Otero,Palma,Pardos,Paredes,Pealver,Pepino,Peralejos,Pinilla,Pioz,Piqueras,Poveda,Pozo,Pradena,Prados,Puebla,Puerto,Quero,Quintanar,Rebollosa,Retamoso,Riba,Riofrio,Robledo,Romanillos,Romanones,Rueda,Salmeron,Santiuste,Santo,Sauca,Segura,Selas,Semillas,Sesena,Setiles,Sevilla,Siguenza,Solanillos,Somolinos,Sonseca,Sotillo,Talavera,Taravilla,Tembleque,Tendilla,Tierzo,Torralba,Torre,Torrejon,Torrijos,Tortola,Tortuera,Totanes,Trillo,Uceda,Ugena,Urda,Utande,Valdesotos,Valhermoso,Valtablado,Valverde,Velada,Viana,Yebra,Yuncos,Yunquera,Zaorejas,Zarzuela,Zorita"}'

# Parse the JSON and extract names
$data = $castillianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Castillian (i: 4) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
