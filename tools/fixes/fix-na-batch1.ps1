$path = 'E:\code\Fantasy-Map-Generator\modules\namebases-northAmerica.js'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix Hopi (i:81) - remove duplicates and non-placenames, add authentic places
$old = '"b": "Walpi,Sichomovi,Hano,Tewa,Shungopavi,Mishongnovi,Sipaulovi,Kykotsmovi,Oraibi,Hotevilla,Bacavi,Moenkopi,Keams Canyon,Polacca,Pueblo of Hopi,First Mesa,Second Mesa,Third Mesa,Navajo,Kya''ka''mana,Tusayan,Mishongnovi,Songopavi,Sipayvi"'
$new = '"b": "Walpi,Sichomovi,Hano,Shungopavi,Mishongnovi,Sipaulovi,Kykotsmovi,Oraibi,Hotevilla,Bacavi,Moenkopi,Upper Moenkopi,Lower Moenkopi,Keams Canyon,Polacca,First Mesa,Second Mesa,Third Mesa,Kya''ka''mana,Tusayan,Sipayvi,Awatovi,Kawaika-A,Winslow West,Shipaulovi"'
$content = $content.Replace($old, $new)

Write-Output 'Done'
