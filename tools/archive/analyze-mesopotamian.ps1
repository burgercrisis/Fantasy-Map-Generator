# Extract and analyze Mesopotamian names (i: 22)
$mesopotamianEntry = '{"name":"Mesopotamian","i":22,"min":4,"max":9,"d":"srpl","m":0.1,"b":"Adab,Adamndun,Adma,Admatum,Agrab,Akkad,Akshak,Amnanum,Andarig,Anshan,Apiru,Apum,Arantu,Arbid,Arpachiyah,Arpad,Arrapha,Ashlakka,Assur,Awan,Babilim,Bad-Tibira,Balawat,Barsip,Birtu,Bit-Bunakki,Borsippa,Chuera,Dashrah,Der,Dilbat,Diniktum,Doura,Dur-Kurigalzu,Dur-Sharrukin,Dur-Untash,Dr-gurgurri,Ebla,Ekallatum,Ekalte,Emar,Erbil,Eresh,Eridu,Eshnunn,Eshnunna,Gargamish,Gasur,Gawra,Gibil,Girsu,Gizza,Habirun,Habur,Hadatu,Hakkulan,Halab,Halabit,Hamazi,Hamoukar,Haradum,Harbidum,Harran,Harranu,Hassuna,Hatarikka,Hatra,Hissar,Hiyawa,Hormirzad,Ida-Maras,Idamaraz,Idu,Imerishu,Imgur-Enlil,Irisagrig,Irnina,Irridu,Isin,Issinnitum,Iturungal,Izubitum,Jarmo,Jemdet,Kabnak,Kadesh,Kahat,Kalhu,Kar-Shulmanu-Asharedu,Kar-Tukulti-Ninurta,Kar-shulmanu-asharedu,Karana,Karatepe,Kartukulti,Kazallu,Kesh,Kidsha,Kinza,Kish,Kisiga,Kisurra,Kuara,Kurda,Kurruhanni,Kutha,Lagaba,Lagash,Larak,Larsa,Leilan,Malgium,Marad,Mardaman,Mari,Marlik,Mashkan,Mashkan-shapir,Matutem,Me-Turan,Meliddu,Mumbaqat,Nabada,Nagar,Nanagugal,Nerebtum,Nigin,Nimrud,Nina,Nineveh,Ninua,Nippur,Niru,Niya,Nuhashe,Nuhasse,Nuzi,Puzrish-Dagan,Qalatjarmo,Qatara,Qatna,Qattunan,Qidshu,Rapiqum,Rawda,Sagaz,Shaduppum,Shaggaratum,Shalbatu,Shanidar,Sharrukin,Shawwan,Shehna,Shekhna,Shemshara,Shibaniba,Shubat-Enlil,Shurkutir,Shuruppak,Shusharra,Shushin,Sikan,Sippar,Sippar-Amnanum,Sippar-sha-Annunitum,Subatum,Susuka,Tadmor,Tarbisu,Telul,Terqa,Tirazish,Tisbon,Tuba,Tushhan,Tuttul,Tutub,Ubaid,Umma,Ur,Urah,Urbilum,Urkes,Ursa\u0027um,Uruk,Urum,Uzarlulu,Warka,Washukanni,Zabalam,Zarri-Amnan"}'

# Parse the JSON and extract names
$data = $mesopotamianEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Mesopotamian (i: 22) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
