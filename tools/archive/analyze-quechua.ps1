# Extract and analyze Quechua names (i: 26)
$quechuaEntry = '{"name":"Quechua","i":26,"min":6,"max":12,"d":"l","m":0,"b":"Alpahuaycco,Anchihuay,Anqea,Apurimac,Arequipa,Atahuallpa,Atawalpa,Atico,Ayacucho,Ayahuanco,Ayllu,Cajamarca,Canayre,Canchacancha,Carapo,Carhuac,Carhuacatac,Cashan,Caullaraju,Caxamalca,Cayesh,Ccahuasno,Ccarhuaccc,Ccopayoc,Chacchapunta,Chacraraju,Challhuamayo,Champara,Chanchan,Chekiacraju,Chillihua,Chinchey,Chontah,Chopicalqui,Chucuito,Chuito,Chullo,Chumpi,Chuncho,Chupahuacho,Chuquiapo,Chuquisaca,Churup,Cocapata,Cochabamba,Cojup,Collota,Conococha,Corihuayrachina,Cuchoquesera,Cusichaca,Haika,Hanpiq,Hatun,Haywarisqa,Huaca,Huachinga,Hualcan,Hualchancca,Huamanga,Huamashraju,Huancarhuas,Huandoy,Huantsan,Huanupampa,Huarmihuanusca,Huascaran,Huaylas,Huayllabamba,Huayrana,Huaytara,Huichajanca,Huinayhuayna,Huinche,Huinioch,Illiasca,Intipunku,Iquicha,Ishinca,Jahuacocha,Jirishanca,Juli,Jurau,Kakananpunta,Kamasqa,Karpay,Kausay,Khuya,Kuelap,Lanccochayocc,Llaca,Llactapata,Llanganuco,Llaqta,Lloqllasca,Llupachayoc,Luricocha,Machu,Mallku,Matarraju,Mechecc,Mikhuy,Milluacocha,Morochuco,Munay,Ocshapalca,Ollantaytambo,Oroccahua,Oronccoy,Oyolo,Pacamayo,Pacaycasa,Paccharaju,Pachacamac,Pachakamaq,Pachakuteq,Pachakuti,Pachamama,Paititi,Pajaten,Palcaraju,Pallccas,Pampa,Panaka,Paqarina,Paqo,Parap,Paria,Patahuasi,Patallacta,Patibamba,Pisac,Pisco,Pongos,Pucacolpa,Pucahirca,Pucaranra,Pumatambo,Puscanturpa,Putaca,Puyupatamarca,Qawaq,Qayqa,Qochamoqo,Qollana,Qorihuayrachina,Qorimoqo,Qotupuquio,Quenuaracra,Queshque,Quillcayhuanca,Quillya,Quitaracsa,Quitaraju,Qusqu,Rajucolta,Rajutakanan,Rajutuna,Ranrahirca,Ranrapalca,Raria,Rasac,Rimarima,Riobamba,Runkuracay,Rurec,Sacsa,Sacsamarca,Saiwa,Sarapo,Sayacmarca,Sayripata,Sinakara,Sonccopa,Taripypacha,Taulliraju,Tawantinsuyu,Taytanchis,Tiwanaku,Tocllaraju,Tsacra,Tuco,Tucubamba,Tullparaju,Tumbes,Uchuraccay,Uchuraqay,Ulta,Urihuana,Uruashraju,Vallunaraju,Vilcabamba,Wacho,Wankawillka,Wayra,Yachay,Yahuarraju,Yanamarey,Yanaqucha,Yanesha,Yerupaja"}'

# Parse the JSON and extract names
$data = $quechuaEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Quechua (i: 26) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
