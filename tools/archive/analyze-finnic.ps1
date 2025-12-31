# Extract and analyze Finnic names (i: 8)
$finnicEntry = '{"name":"Finnic","i":8,"min":5,"max":11,"d":"akiut","m":0,"b":"Aanekoski,Ahlainen,Aholanvaara,Ahtari,Aijala,Akaa,Alajarvi,Antsla,Aspo,Bennas,Bjorkoby,Elva,Emasalo,Espoo,Esse,Evitskog,Forssa,Haapamaki,Haapavesi,Haapsalu,Hameenlinna,Hanko,Harjavalta,Hattuvaara,Hautajarvi,Havumaki,Heinola,Hetta,Hinkabole,Hirmula,Hossa,Huittinen,Husula,Hyryla,Hyvinkaa,Ikaalinen,Iskmo,Itakoski,Jamsa,Jarvenpaa,Jeppo,Jioesuu,Jiogeva,Joensuu,Jokikyla,Jungsund,Jyvaskyla,Kaamasmukka,Kajaani,Kalajoki,Kallaste,Kankaanpaa,Karkku,Karpankyla,Kaskinen,Kasnas,Kauhajoki,Kauhava,Kauniainen,Kauvatsa,Kehra,Kellokoski,Kelottijarvi,Kemi,Kemijarvi,Kerava,Keuruu,Kiljava,Kiuruvesi,Kivesjarvi,Kiviioli,Kivisuo,Klaukkala,Klovskog,Kohtlajarve,Kokemaki,Kokkola,Kolho,Koskue,Kotka,Kouva,Kaupunki,Kuhmo,Kunda,Kuopio,Kuressaare,Kurikka,Kuusamo,Kylmalankyla,Lahti,Laitila,Lankipohja,Lansikyla,Lapua,Laurila,Lautiosaari,Lempaala,Lepsama,Liedakkala,Lieksa,Littoinen,Lohja,Loimaa,Loksa,Loviisa,Malmi,Mantta,Matasvaara,Maula,Miiluranta,Mioisakula,Munapirtti,Mustvee,Muurahainen,Naantali,Nappa,Narpio,Niinimaa,Niinisalo,Nikkila,Nilsia,Nivala,Nokia,Nummela,Nuorgam,Nuvvus,Obbnas,Oitti,Ojakkala,Onninen,Orimattila,Orevesi,Otanmaki,Otava,Otepaa,Oulainen,Oulu,Paavola,Paide,Paimio,Pakankyla,Paldiski,Parainen,Parkumaki,Parola,Perttula,Pieksamaki,Pioltsamaa,Piolva,Pohjavaara,Porhola,Porrasa,Porvoo,Pudasjarvi,Purmo,Pyhajarvi,Raahe,Raasepori,Raisio,Rajamaki,Rakvere,Rapina,Rapla,Rauma,Rautio,Reposaari,Riihimaki,Rovaniemi,Roykka,Ruonala,Ruottala,Rutalahti,Saarijarvi,Salo,Sastamala,Saue,Savonlinna,Seinajoki,Sillamae,Siuntio,Sompujarvi,Suonenjoki,Suurejaani,Syrjantaka,Tamsalu,Tapa,Temmes,Tiorva,Tormasenvaara,Tornio,Tottijarvi,Tulppio,Turenki,Turi,Tuukkala,Tuurala,Tuuri,Tuuski,Tuusniemi,Ulvila,Unari,Upinniemi,Utti,Uusikaupunki,Vaaksy,Vaalimaa,Vaarinmaja,Vaasa,Vainikkala,Valga,Valkeakoski,Vantaa,Varkaus,Vehkapera,Vehnasmaki,Vieki,Vierumaki,Viitasaari,Viljandi,Vilppula,Viohma,Vioru,Virrat,Ylike,Ylivieska,Ylojarvi"}'

# Parse the JSON and extract names
$data = $finnicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Finnic (i: 8) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
