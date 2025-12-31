# Extract and analyze Berber names (i: 16)
$berberEntry = '{"name":"Berber","i":16,"min":4,"max":10,"d":"s","m":0.2,"b":"Abkhouch,Adrar,Aeraysh,Afrag,Agadir,Agelman,Agmat,Agrakal,Agulmam,Ahaggar,Ait Baha,Ajdir,Akka,Almou,Amegdul,Amizmiz,Amknas,Amlil,Amurakush,Anfa,Annaba,Aousja,Arbat,Arfud,Argoub,Arif,Asfi,Asfru,Ashawen,Assamer,Assif,Awlluz,Ayt Melel,Azaghar,Azila,Azilal,Azmour,Azro,Azrou,Beccar,Beja,Bennour,Benslimane,Berkane,Berrechid,Bizerte,Bjaed,Bouayach,Boudenib,Boufrah,Bouskoura,Boutferda,Darallouch,Dar Bouazza,Darchaabane,Dcheira,Demnat,Denden,Djebel,Djedeida,Drargua,Elhusima,Essaouira,Ezzahra,Fas,Fnideq,Ghezeze,Goubelat,Grisaffen,Guelmim,Guercif,Hammamet,Harrouda,Hdifa,Hoceima,Houara,Idhan,Idurar,Ifendassen,Ifoghas,Ifrane,Ighoud,Ikbir,Imilchil,Imzuren,Inezgane,Irherm,Izoughar,Jendouba,Kacem,Kelibia,Kenitra,Kerrando,Khalidia,Khemisset,Khenifra,Khouribga,Khourigba,Kidal,Korba,Korbous,Lahraouyine,Larache,Leyun,Lqliaa,Manouba,Martil,Mazagan,Mcherga,Mdiq,Megrine,Mellal,Melloul,Midelt,Misur,Mohammedia,Mornag,Mrirt,Nabeul,Nadhour,Nador,Nawaksut,Nefza,Ouarzazate,Ouazzane,Oued Zem,Oujda,Ouladteima,Qsentina,Rades,Rafraf,Safi,Sefrou,Sejnane,Settat,Sijilmassa,Skhirat,Slimane,Somaa,Sraghna,Susa,Tabarka,Tadrart,Taferka,Tafilalt,Tafrawt,Tafza,Tagbalut,Tagherdayt,Takelsa,Taliouine,Tanja,Tantan,Taourirt,Targuist,Taroudant,Tasfelalayt,Tassort,Tata,Tattiwin,Tawrnat,Taza,Tazagurt,Tazerka,Tazizawt,Taznakht,Tebourba,Teboursouk,Temara,Testour,Tetouan,Tibeskert,Tifelt,Tijdit,Tinariwen,Tinduf,Tinja,Tittawan,Tiznit,Toubkal,Trables,Tubqal,Tunes,Ultasila,Urup,Wagguten,Wararni,Warzazat,Watlas,Wehran,Wejda,Xamida,Yedder,Youssoufia,Zaghouan,Zahret,Zemmour,Zriba,Casablanca,Rabat,Fes,Sale,Meknes,Marrakech,ElJadida"}'

# Parse the JSON and extract names
$data = $berberEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Berber (i: 16) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
