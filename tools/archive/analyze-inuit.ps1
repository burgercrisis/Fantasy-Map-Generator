# Extract and analyze Inuit names (i: 18)
$inuitEntry = '{"name":"Inuit","i":18,"min":5,"max":15,"d":"alutsn","m":0,"b":"Aaluik,Aappilattoq,Aasiaat,Agissat,Agssausat,Akuliarutsip,Akunnaaq,Alluitsup,Alluttoq,Amitorsuaq,Ammassalik,Anarusuk,Anguniartarfik,Annertussoq,Annikitsoq,Apparsuit,Apusiaajik,Arsivik,Arsuk,Atammik,Ateqanaq,Atilissuaq,Attu,Augpalugtoq,Aukarnersuaq,Aumat,Auvilkikavsaup,Avadlek,Avallersuaq,Bjornesk,Blabaerdalen,Blomsterdalen,Brattalhid,Bredebrae,Brededal,Claushavn,Edderfulegoer,Egger,Eqalualinnguit,Eqalugarssuit,Eqaluit,Eqqua,Etah,Graah,Hakluyt,Haredalen,Hareoen,Hundeo,Igaliku,Igdlorssuit,Igdluluarssuk,Iginniafik,Ikamiut,Ikarissat,Ikateq,Ikermiut,Ikermissoq,Ikissuaq,Ikorfarssuit,Ilimanaq,Illorsuit,Illunnguit,Iluileq,Ilulissat,Imartunarssuk,Immikkoortukajik,Innaarsuit,Inneruulalik,Inussillissuaq,Iperaq,Ippik,Iqek,Isortok,Isungartussoq,Itilleq,Itissaalik,Itivdleq,Ittit,Ittoqqortoormiit,Ivingmiut,Ivittuut,Kanajoorartuut,Kangaamiut,Kangeq,Kangerluk,Kangerlussuaq,Kanglinnguit,Kapisillit,Kekertamiut,Kitatak,Kitaussaq,Kigatak,Kinaussak,Kingittorsuaq,Kitak,Kitsissuarsuit,Kitsissut,Klenczner,Kook,Kraulshavn,Kujalleq,Kullorsuaq,Kulusuk,Kuurmiut,Kuusuaq,Laksedalen,Maniitsoq,Marrakajik,Mattangassut,Mernaq,Mittivakkat,Moriusaq,Myggbukta,Najaat,Nangissat,Nanuseq,Nappassoq,Narsarmijt,Narsarsuaq,Narsaq,Natsifik,Nordfjordspasset,Nugatsiaq,Nunarsit,Nunarsuaq,Nunataq,Nunatakvs,Nutaarmiut,Nuugaatsiaq,Nuuk,Nuukullak,Olonkinbyen,Oodaaq,Oqaatsut,Oqaitsunguit,Oqonermiut,Paagussat,Paamiut,Paatuut,Palungataq,Pamialluk,Perserajoq,Pituffik,Puugutaa,Puulkuip,Qaanaq,Qaasuitsup,Qaersut,Qajartalik,Qallunaat,Qaneq,Qaartok,Qaasigiannguit,Qassimiut,Qeertartivaq,Qeqertaq,Qeqertasussuk,Qeqqata,Qernertoq,Qernertunnguit,Qianarreq,Qingagssat,Qoornuup,Qorlortorsuaq,Qullikorsuit,Qunnerit,Qutdleq,Ravnedalen,Ritenbenk,Rypedalen,Saarloq,Saatorsuaq,Saattut,Salliaruseq,Sammeqqat,Sammisoq,Sanningassoq,Saqqaq,Saqqarlersuaq,Saqqarliit,Sarfannguit,Sattiaatteq,Savissivik,Serfanguaq,Sermersooq,Sermiligaaq,Sermilik,Sermitsiaq,Simitakaja,Simiutaq,Singamaq,Siorapaluk,Sisimiut,Sisuarsuit,Sullorsuaq,Suunikajik,Sverdrup,Taartoq,Takiseeq,Tasirliaq,Tasiusak,Tiilerilaaq,Timilersuaq,Timmiarmiut,Tukingassoq,Tussaaq,Tuttulissuup,Tup,Tuujuk,Uiivaq,Uilortussoq,Ujuaakajiip,Ukkusissat,Upernavik,Uttorsiutit,Uumannaq,Uunartoq,Uvkusigssat,Ymer"}'

# Parse the JSON and extract names
$data = $inuitEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Inuit (i: 18) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
