# Extract and analyze Nahuatl names (i: 13)
$nahuatlEntry = '{"name":"Nahuatl","i":13,"min":6,"max":13,"d":"l","m":0,"bb":"Acapulco,Acatepec,Acatlan,Acaxochitlan,Acolman,Actopan,Acuamanala,Ahuacatlan,Almoloya,Amacuzac,Amanalco,Amaxac,Apaxco,Apetatitlan,Apizaco,Atenco,Atizapan,Atlacomulco,Atlapexco,Atotonilco,Axapusco,Axochiapan,Axocomanitla,Axutla,Azcapotzalco,Aztahuacan,Calimaya,Calnali,Calpulalpan,Camotlan,Capulhuac,Chalco,Chapulhuacan,Chapultepec,Chiapan,Chiautempan,Chiconautla,Chihuahua,Chilcuautla,Chimalhuacan,Cholollan,Cihuatlan,Coahuila,Coatepec,Coatetelco,Coatlan,Coatlinchan,Coatzacoalcos,Cocotitlan,Cohetzala,Colima,Colotlan,Coyoacan,Coyohuacan,Cuapiaxtla,Cuauhnahuac,Cuauhtemoc,Cuauhtitlan,Cuautepec,Cuautla,Cuaxomulco,Culhuacan,Ecatepec,Eloxochitlan,Epatlan,Epazoyucan,Huamantla,Huasczaloya,Huatlatlauca,Huautla,Huehuetlan,Huehuetoca,Huexotla,Hueyapan,Hueyotlipan,Hueypoxtla,Huichapan,Huimilpan,Huitzilac,Ixtapallocan,Iztacalco,Iztaccihuatl,Iztapalapa,Lolotla,Malinalco,Mapachtlan,Mazatepec,Mazatlan,Metepec,Metztitlan,Mexihco,Miacatlan,Michoacan,Minatitlan,Mixcoac,Mixtla,Molcaxac,Nancamilpa,Naucalpan,Naupan,Nextlalpan,Nezahualcoyotl,Nopalucan,Huaxyacac,Ocotepec,Ocotitlan,Ocotlan,Ocoyoacac,Ocuilan,Ocuituco,Omitlan,Otompan,Otzoloapan,Pacula,Pahuatlan,Panotla,Papalotla,Patlachican,Piaztla,Popocatepetl,Sultepec,Tecamac,Tecolotlan,Tecozautla,Temascalapa,Temixco,Temoac,Temoaya,Tenayuca,Tenochtitlan,Teocuitlatlan,Teotihuacan,Teotlalco,Tepeacac,Tepeapulco,Tepehuacan,Tepetitlan,Tepotzotlan,Tepoztlan,Tetecala,Tetlatlahuca,Texcalyacac,Texcoco,Tezontepec,Tezoyuca,Timilpan,Tizapan,Tizayuca,Tlacopan,Tlacotenco,Tlahuac,Tlahuelilpan,Tlahuiltepa,Tlalmanalco,Tlalnepantla,Tlalpan,Tlanchinol,Tlatelolco,Tlaxcala,Tlaxcoapan,Tlayacapan,Tocatlan,Tolcayuca,Toluca,Tonanitla,Tonantzintla,Tonatico,Totolac,Totolapan,Tototlan,Tuchtlan,Tulantepec,Tultepec,Tzompantepec,Xalatlaco,Xaloztoc,Xaltocan,Xiloxoxtla,Xochiatipan,Xochicoatlan,Xochimilco,Xochitepec,Xolotlan,Xonacatlan,Yahualica,Yautepec,Yecapixtla,Yehaultepec,Zacatecas,Zacazonapan,Zacoalco,Zacualpan,Zacualtipan,Zapoltan,Zimapan,Zinacantepec,Zoyaltepec,Zumpahuacan","b":"Nahuatl,Puebla,Tlaxcala,Hidalgo,Veracruz,Mexico,Central Mexico,Mesoamerica"}'

# Parse the JSON and extract names
$data = $nahuatlEntry | ConvertFrom-Json
$names = $data.bb -split ','

Write-Host "=== Nahuatl (i: 13) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
