# Extract and analyze Hawaiian names (i: 24)
$hawaiianEntry = '{"name":"Hawaiian","i":24,"min":5,"max":10,"d":"auo","m":1,"b":"Aapueo,Ahoa,Ahuakaio,Ahupau,Alaakua,Alae,Alaeloa,Alamihi,Aleamai,Alena,Alio,Aupokopoko,Halakaa,Haleu,Haliimaile,Hamoa,Hanakaoo,Hanaulu,Hanawana,Hanehoi,Haou,Hikiaupea,Hokuula,Honohina,Honokahua,Honokeana,Honokohau,Honomaele,Hononana,Honopou,Hoolawa,Huelo,Kaalaea,Kaapahu,Kaeo,Kahalehili,Kahana,Kahuai,Kailua,Kainehe,Kakalahale,Kakanoni,Kalenanui,Kaleoaihe,Kalialinui,Kalihi,Kalimaohe,Kaloi,Kamani,Kamehame,Kanahena,Kaniaula,Kaonoulu,Kapaloa,Kapohue,Kapuaikini,Kapunakea,Kauau,Kaulalo,Kaulanamoa,Kauluohana,Kaumakani,Kaumanu,Kaunauhane,Kaupakulua,Kawaloa,Keaa,Keaaula,Keahua,Keahuapono,Kealahou,Keanae,Keauhou,Kelawea,Keokua,Keopuka,Kikoo,Kipapa,Koakupuna,Koali,Kolokolo,Kopili,Kou,Kualapa,Kuhiwa,Kuholilea,Kuhua,Kuia,Kuikui,Kukoae,Kukohia,Kukuiaeo,Kukuipuka,Kukuiula,Kulahuhu,Lapakea,Lapueo,Launiupoko,Lole,Maalo,Mahinahina,Mailepai,Makaakini,Makaalae,Makaehu,Makaiwa,Makaliua,Makapipi,Makapuu,Maluaka,Manawainui,Mehamenui,Moalii,Moanui,Mohopili,Mokae,Mokuia,Mokupapa,Mooiki,Mooloa,Moomuku,Muolea,Nakaaha,Nakalepo,Nakaohu,Nakapehu,Nakula,Napili,Niniau,Nuu,Oloewa,Olowalu,Omaopio,Onau,Onouli,Opaella,Opana,Opikoula,Paakea,Paeahu,Paehala,Paeohi,Pahoa,Paia,Pakakia,Palauea,Palemo,Paniau,Papaaea,Papaanui,Papaauhau,Papaka,Papauluana,Pauku,Paunau,Pauwalu,Pauwela,Pohakanele,Polaiki,Polanui,Polapola,Poopoo,Poponui,Poupouwela,Puahoowali,Puakea,Puako,Pualaea,Puehuehu,Pueokauiki,Pukauhuhu,Pukuilua,Pulehu,Puolua,Puou,Puuhaehae,Puuiki,Puuki,Puulani,Puunau,Puuomaile,Uaoa,Uhao,Ukumehame,Ulaino,Ulumalu,Wahikuli,Waianae,Waianu,Waiawa,Waiehu,Waieli,Waikapu,Wailamoa,Wailaulau,Wainee,Waiohole,Waiohonu,Waiohuli,Waiokama,Waiokila,Waiopai,Waiopua,Waipao,Waipionui,Waipouli,Hawaiian,Laie,Kaneohe,Maui,Molokai,Kauai,USA,Pacific Ocean"}'

# Parse the JSON and extract names
$data = $hawaiianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Hawaiian (i: 24) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
