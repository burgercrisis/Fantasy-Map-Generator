# Extract and analyze Nigerian names (i: 20)
$nigerianEntry = '{"name":"Nigerian","i":20,"min":4,"max":10,"d":"","m":0.3,"b":"Abadogo,Abafon,Adealesu,Adeto,Adyongo,Afaga,Afamju,Agigbigi,Agogoke,Ahute,Aiyelaboro,Ajebe,Ajola,Akarekwu,Akunuba,Alawode,Alkaijji,Amangam,Amgbaye,Amtasa,Amunigun,Animahun,Anyoko,Arapagi,Asande,Awgbagba,Awhum,Awodu,Babateduwa,Bandakwai,Bangdi,Bilikani,Birnindodo,Braidu,Bulakawa,Buriburi,Cainnan,Chakum,Chondugh,Dagwarga,Darpi,Dokatofa,Dozere,Ebelibri,Efem,Ekoku,Ekpe,Ewhoeviri,Galea,Gamen,Ganjin,Gantetudu,Gargar,Garinbode,Gbure,Gerti,Gidan,Gitabaremu,Giyagiri,Giyawa,Gmawa,Golakochi,Golumba,Gunji,Gwambula,Gwodoti,Hayinlere,Hayinmaialewa,Hirishi,Hombo,Ibefum,Iberekodo,Icharge,Idofin,Idofinoka,Igbogo,Ijoko,Ijuwa,Ikawga,Ikhin,Ikpakidout,Ikpeoniong,Imuogo,Ipawo,Ipinlerere,Isicha,Itakpa,Jangi,Jare,Jataudakum,Jaurogomki,Jepel,Kafinmalama,Katab,Katanga,Katinda,Katirije,Kaurakimba,Keffinshanu,Kellumiri,Kiagbodor,Kirbutu,Kita,Kogogo,Kopje,Korokorosei,Kotoku,Kuata,Kujum,Kukau,Kunboon,Kuonubogbene,Kurawe,Kushinahu,Kwaramakeri,Ladimeji,Lafiaro,Lahaga,Laindebajanle,Laindegoro,Lakati,Litenswa,Maba,Madarzai,Maianita,Malikansaa,Mata,Mekoyo,Meku,Miama,Modi,Mshi,Msugh,Muduvu,Murnachehu,Namnai,Ndamanma,Ndiwulunbe,Ndonutim,Ngbande,Nguengu,Ntoekpe,Nyajo,Nyior,Odajie,Ogbaga,Ogultu,Ogunbunmi,Ojopode,Okehin,Olugunna,Omotunde,Onipede,Onma,Orhere,Orya,Otukwang,Otunade,Rampa,Rimi,Rugan,Rumbukawa,Sabiu,Sangabama,Sarabe,Seboregetore,Shafar,Shagwa,Shata,Shengu,Sokoron,Sunnayu,Tafoki,Takula,Talonton,Tarhemba,Tayu,Ter,Timtim,Timyam,Tindirke,Tokunbo,Torlwam,Tseakaadza,Tseanongo,Tsebeeve,Tsepaegh,Tuba,Tumbo,Tungalombo,Tunganyakwe,Uhkirhi,Umoru,Umuabai,Umuajuju,Unchida,Ungua,Unguwar,Unngo,Usha,Utongbo,Vembera,Wuro,Yanbashi,Yanmedi,Yoku,Zarunkwari,Zilumo,Zulika"}'

# Parse the JSON and extract names
$data = $nigerianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Nigerian (i: 20) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
