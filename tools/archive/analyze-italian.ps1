# Extract and analyze Italian names
$italianEntry = '{"name":"Italian","i":3,"min":5,"max":12,"d":"cltr","m":0.1,"b":"Accumoli,Acquafondata,Acquapendente,Acuto,Affile,Agosta,Alatri,Albano,Allumiere,Alvito,Amaseno,Amatrice,Anagni,Anguillara,Anticoli,Antrodoco,Anzio,Aprilia,Aquino,Arcinazzo,Ariccia,Arpino,Arsoli,Ausonia,Bagnoregio,Bassiano,Bellegra,Belmonte,Bolsena,Bomarzo,Borgorose,Boracciano,Broccostella,Calcata,Camerata,Campagnano,Campoli,Canale,Canino,Cantalice,Cantalupo,Capranica,Caprarola,Carbognano,Casalattico,Casalvieri,Castelforte,Castelnuovo,Castiglione,Castrocielo,Ceccano,Celleno,Cellere,Cervara,Cervara,Ciampino,Ciciliano,Cittaducale,Cittareale,Civita,Civitella,Colfelice,Colleferro,Colonnello,Concerviano,Configni,Contigliano,Cori,Cottanello,Esperia,Faleria,Farnese,Ferentino,Fiamignano,Filacciano,Fiuggi,Fiumicino,Fondi,Fontana,Fonte,Fontechiari,Formia,Frascati,Frasso,Frosinone,Fumone,Gaeta,Gallese,Gavignano,Genazzano,Giuliano,Gorga,Gradoli,Grottaferrata,Grotte,Guarcino,Guidonia,Ischia,Isola,Labico,Labro,Ladispoli,Latera,Lenola,Leonessa,Licenza,Lonzone,Lubriano,Maenza,Magliano,Marano,Marcellina,Marcetelli,Marcino,Mazzano,Mentana,Micigliano,Minturno,Montalto,Montesola,Monteflavio,Monteleone,Montenero,Monterosi,Moricone,Morlupo,Nazzano,Nemi,Nerola,Nespolo,Neuvtuno,Nevoy,Nibelle,Nogent,Noyers,Ocre,Oison,Olivet,Ondreville,Onzerain,Orleans,Ormes,Orville,Oussoy,Outarville,Ouzouer,Pannecieres,Pannes,Patay,Paucourt,Pers,Pierrefitte,Pithiverais,Pithiviers,Poilly,Potier,Prefontaines,Presnoy,Pressigny,Puiseaux,Quiers,Ramoulu,Rebrechien,Rouvray,Rozieres,Rozoy,Ruan,Sandillon,Santeau,Saran,Sceaux,Seichebrieres,Semoy,Sennely,Sermaises,Sigloy,Solterre,Sougy,Sully,Sury,Tavers,Thignonville,Thimory,Thorailles,Thou,Tigy,Tivernon,Tournoisis,Treilles,Trigueres,Trinay,Vannes,Varennes,Vennecy,Vieilles,Vienne,Viglain,Vignes,Villamblain,Villemandeur,Villemurlin,Villeneuve,Villereau,Villevoques,Villorceau,Vimory,Vitry,Vrigny"}'

# Parse the JSON and extract names
$data = $italianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Italian (i: 3) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
