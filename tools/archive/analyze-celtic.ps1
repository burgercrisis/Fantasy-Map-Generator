# Extract and analyze Celtic names (i: 21)
$celticEntry = '{"name":"Celtic","i":21,"min":4,"max":12,"d":"nld","m":0,"b":"Aberaman,Aberangell,Aberarth,Aberavon,Aberbanc,Aberbargoed,Aberbeeg,Abercanaid,Abercarn,Abercastle,Abercegir,Abercraf,Abercregan,Abercych,Abercynon,Aberdare,Aberdaron,Aberdaugleddau,Aberdeen,Aberdulais,Aberdyfi,Aberedw,Abereiddy,Abererch,Abereron,Aberfan,Aberffraw,Aberffrwd,Abergavenny,Abergele,Aberglasslyn,Abergollech,Abergwaun,Abergwesyn,Abergwili,Abergwynfi,Abergwyngregyn,Abergynolwyn,Aberhafesp,Aberhonddu,Aberkenfig,Aberllefenni,Abermain,Abermaw,Abermorddu,Abermule,Abernant,Aberpennar,Aberporth,Aberriw,Abersoch,Abersychan,Abertawe,Aberteifi,Aberthin,Abertillery,Abertridwr,Aberystwyth,Achininver,Afonhafren,Alisaha,Anfosadh,Antinbhearmor,Ardenna,Attacon,Banwen,Beira,Bhrura,Bleddfa,Boioduro,Bona,Boskyny,Boslowenpolbrogh,Boudobriga,Bravon,Brigant,Briganta,Briva,Brosnach,Caersws,Cambodunum,Cambra,Caracta,Catumagos,Centobriga,Ceredigion,Chalain,Chearbhallain,Chlasaigh,Chormaic,Cuileannach,Dinn,Diwa,Dubingen,Duibhidighe,Duro,Ebora,Ebruac,Eburodunum,Eccles,Egloskuri,Eighe,Eireann,Elerghi,Ferkunos,Fhlaithnin,Gallbhuaile,Genua,Ghrainnse,Gwyles,Heartsease,Hebron,Hordh,Inbhear,Inbhir,Inbhirair,Innerleithen,Innerleven,Innerwick,Inver,Inveralide,Inverallan,Inveralmond,Inveramsay,Inveran,Inveraray,Inverarnan,Inverbervie,Inverclyde,Inverell,Inveresk,Inverfarigaing,Invergarry,Invergordon,Invergowrie,Inverhaddon,Inverkeilor,Inverkeithing,Inverkeithney,Inverkip,Inverleigh,Inverleith,Inverloch,Inverlochlarig,Inverlochy,Invermay,Invermoriston,Inverness,Inveroran,Invershin,Inversnaid,Invertrossachs,Inverugie,Inveruglas,Inverurie,Iubhrach,Karardhek,Kilninver,Kirkcaldy,Kirkintilloch,Krake,Lanngorrow,Latense,Leming,Lindomagos,Llanaber,Llandidiwg,Llandyrnog,Llanfarthyn,Llangadwaldr,Llansanwyr,Lochinver,Lugduno,Magoduro,Mheara,Monmouthshire,Nanshiryarth,Narann,Novioduno,Nowijonago,Octoduron,Penning,Pheofharain,Ponsmeur,Raithin,Ricomago,Rossinver,Salodurum,Seguia,Sentica,Theorsa,Tobargeal,Trealaw,Trefesgob,Trewedhenek,Trewythelan,Tuaisceart,Uige,Vitodurum,Windobona"}'

# Parse the JSON and extract names
$data = $celticEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Celtic (i: 21) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
