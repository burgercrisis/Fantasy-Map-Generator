# Extract and analyze Turkish names (i: 15)
$turkishEntry = '{"name":"Turkish","i":15,"min":4,"max":10,"d":"","m":0,"b":"Yelkaya,Buyrukkaya,Erdemtepe,Alakesen,Baharbeyli,Karaoklu,Altunbey,Yalkale,Yalkut,Akardere,Altayburnu,Esentepe,Okbelen,Derinsu,Alaoba,Yamanbeyli,Aykor,Ekinova,Saztepe,Baharkale,Devrekdibi,Alpseki,Ormanseki,Erkale,Yalbelen,Aytay,Yamanyaka,Altaydelen,Esen,Yedieli,Alpkor,Demirkor,Yediyol,Erdemkaya,Yayburnu,Ganiler,Kopuzteke,Aytepe,Deniz,Ayan,Ayazdere,Tepe,Kayra,Ayyaka,Deren,Adatepe,Kalkaneli,Bozkale,Yedidelen,Kocayolu,Sazdere,Bozkesen,Oguzeli,Yayladibi,Uluyol,Altay,Ayvar,Alazyaka,Yaloba,Suyaka,Baltaberi,Poyrazdelen,Eymir,Yediyuva,Kurt,Yeltepe,Oktar,Kara Ok,Ekinberi,Er Yurdu,Eren,Erenler,Ser,Oguz,Asay,Bozokeli,Aykut,Ormanyol,Yazkaya,Kalkanova,Yazbeyli,Dokuz Teke,Bilge,Ertensuyu,Kopuzyuva,Buyrukkut,Akardiken,Aybaray,Aslanbeyli,Altun Kaynak,Atikobasi,Yayla Eli,Kor Tepe,Salureli,Kor Kaya,Aybarberi,Kemerev,Yanaray,Beydileli,Buyrukoba,Yolduman,Tengri Tepe,Dokuzsu,Uzunkor,Erdem Yurdu,Kemer,Korteke,Bozokev,Bozoba,Ormankale,Askale,Oguztoprak,Yolberi,Kumseki,Esenobasi,Turkbelen,Ayazseki,Cereneli,Taykut,Beydilyaka,Boztepe,Uluoba,Yelyaka,Ulgardiken,Esensu,Cerenkor,Bozyol,Duranoba,Aladuman,Denizli,Bahar,Yarkesen,Dokuzer,Yamankaya,Kocatarla,Alayaka,Toprakeli,Sarptarla,Sarpkoy,Serkaynak,Adayaka,Ayazkaynak,Kopuz,Turk,Kart,Kum,Erten,Buyruk,Yel,Ada,Alazova,Ayvarduman,Buyrukok,Ayvartoprak,Uzuntepe,Binseki,Yedibey,Durankale,Alaztoprak,Sarp Ok,Yaparobasi,Yaytepe,Asberi,Kalkankor,Beydiltepe,Adaberi,Bilgeyolu,Ganiyurt,Alkanteke,Esenerler,Asbey,Erdemkale,Erenkaynak,Oguzkoyu,Ayazoba,Boynuztoprak,Okova,Yaloklu,Sivriberi,Yuladiken,Sazbey,Karakaynak,Kopuzkoyu,Buyrukay,Kocakaya,Tepeduman,Yanarseki,Atikyurt,Esenev,Akarbeyli,Yayteke,Devreksungur,Akseki,Kalkandere,Ulgarova,Devrekev,Yulabey,Yazsu,Vuraleli,Sivribeyli,Alaova,Alpobasi,Yalyurt,Elmatoprak,Alazkaynak,Esenay,Ertenev,Salurkor,Ekinok,Yalbey,Yeldere,Altaykut,Baltaboy,Ereli,Ayvarsu,Uzunsaz,Erenyol,Derintay,Ayazyol,Aslanoba,Esenkaynak,Ekinlik,Alpyolu,Alayunt,Bozeski,Erkil,Duransuyu,Yulak,Kut,Dodurga,Kutlubey,Kutluyurt,Boynuz,Alayol,Aybar,Aslaneli,Kemerseki,Baltasuyu,Akarer,Ayvarburnu,Boynuzbeyli,Adasungur,Esenkor,Yamanoba,Toprakkor,Uzunyurt,Sungur,Bozok,Kemerli,Alaz,Demirci,Kartepe,Istanbul,Ankara,Izmir,Bursa,Antalya,Konya,Adana,Sanliurfa,Gaziantep,Mersin,Diyarbakir,Kayseri"}'

# Parse the JSON and extract names
$data = $turkishEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Turkish (i: 15) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
