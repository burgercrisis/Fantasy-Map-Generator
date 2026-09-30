"use strict";

/**
 * COUNTRY_CITIES - a curated country -> major settlements gazetteer.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A CURATED APPROXIMATION, NOT A GAZETTEER OF RECORD.
 * ---------------------------------------------------------------------------
 * There is no authoritative, machine-readable, licence-clean list of "the 50
 * biggest cities of every country" that ships with this repo, and no amount of
 * local cleverness substitutes for one. What this file is:
 *
 *   - 40-60 settlements per country, chosen for POPULATION RANK first, then
 *     capital / regional-capital prominence, then recognisability to someone
 *     who has never heard of the country. Ordering within a country follows
 *     that ranking, so the first entries are the ones a padded list is most
 *     likely to be built from.
 *   - a deliberately uneven ~50-200 country coverage, weighted towards the
 *     countries that actually appear in this namebase. The defect this file
 *     exists to detect - a language entry padded with a block of another
 *     country's real city names - is overwhelmingly between large, well-known
 *     populations, because that is what a padding list reaches for.
 *   - a precision instrument, not a recall one. A name in here is a CLAIM that
 *     the place exists in that country. A name absent from here is a claim of
 *     nothing at all.
 *
 * ---------------------------------------------------------------------------
 * DISAMBIGUATION IS THE POINT
 * ---------------------------------------------------------------------------
 * "San Jose" is a real settlement in well over a dozen countries, "Springfield"
 * in dozens, "Victoria" in six, "Georgetown" in five, "Santiago" in eight. A
 * gazetteer that quietly returns one of those as a confident answer is worse
 * than no gazetteer, because it manufactures evidence that was never there.
 *
 * So the rule enforced throughout this file is:
 *
 *   If a name exists in more than one country, it is listed in ALL of them.
 *
 * That makes resolveCountry return an ARRAY for those names, which the checker
 * treats as weak evidence and refuses to count. The cost is recall - some real
 * one-country evidence is thrown away - and that cost is paid deliberately.
 *
 * The converse rule is just as important:
 *
 *   Do NOT pad a country's list with "recognisable" filler.
 *
 * A list containing Springfield, Georgetown, Victoria, Cambridge and London
 * would resolve almost everything and flag almost everything. Concrete,
 * country-specific forms (Dayton, Akron, Roscommon, Ulaanbaatar, Kanpur) are
 * safe precisely because they are not shared.
 *
 * ---------------------------------------------------------------------------
 * HOW TO ADD A COUNTRY
 * ---------------------------------------------------------------------------
 * 1. Find the ISO 3166-1 alpha-2 code and add a key inside COUNTRY_CITIES, in
 *    alphabetical order within its continent block. Keys are quoted so the
 *    file stays legible next to tooling that reads the same list as data.
 * 2. Add 40-60 names, largest first, taken from that country's standard
 *    "list of cities" source. Include the capital first.
 * 3. CROSS-CHECK EVERY NAME. For each name, ask "which other countries has
 *    this too?" and add it to all of them. This is the step that keeps the
 *    whole instrument honest, and it is the step that gets skipped.
 * 4. If a name needs an old/colonial/alternate spelling, put it in ALIASES
 *    rather than adding a second entry under the same country.
 * 5. Re-run:  node tools/namebase-tools/check-cross-country-padding.js --verbose
 *    A new country that pushes the finding count from single digits into the
 *    dozens has introduced a false confidence; find the name that did it.
 *
 * ---------------------------------------------------------------------------
 * WHAT resolveCountry RETURNS
 * ---------------------------------------------------------------------------
 *   "NG"          exactly one country in this file has that place name -> STRONG
 *   ["ES","VE"]   genuinely ambiguous -> WEAK, callers must not count it
 *   null          no claim either way -> NO EVIDENCE
 */

const COUNTRY_CITIES = {
  // ===== AFRICA =====
  "AO": [
    "Luanda", "Huambo", "Lobito", "Benguela", "Kuito", "Cabinda", "Uige", "Malanje", "Menongue",
    "Caxito", "Ondjiva", "Dundo", "Luena", "N'dalatando", "Sumbe", "Port Amboim", "Cahama", "Caconda",
    "Ganda", "Mbanza Congo", "Soyo", "Sá", "Namibe", "Tomboco", "Bocoio", "Cuanza Sul", "Bicoio",
    "Quibala", "Quiminha", "Samba Cajú", "Waku Kungo", "Catchiungo", "Cubal", "Balombo", "Catumbela", "Camacupa",
    "Catabola", "Chibia", "Chicomba", "Chinguar", "Cuemba", "Cungamba", "Dala", "Ecunha", "Kalunga",
    "Kubinga", "Quilengues", "Caxito", "Mbanza Kongo",
  ],
  "BF": [
    "Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora", "Kaya", "Tenkodogo", "Fada Ngourma", "Dédougou",
    "Dori", "Boulsa", "Ziniaré", "Zorgho", "Réo", "Garango", "Bogandé", "Pouytenga", "Kongoussi",
    "Kouritenga", "Yako", "Orodara", "Batié", "Séguénga", "Sourou", "Sindou", "Diébougou", "Houndé",
    "Bondoukou", "Djibo", "Bouroum", "Po", "Tougan", "Guira", "Kossi", "Gorom-Gorom", "Manga",
    "Saponé", "Mégui", "Ioba", "Béguéné", "Bouna", "Dano", "Diapaga", "Kombissiri", "Boulsa",
    "Ziniaré", "Boulain", "Kouka", "Batié", "Kongoussi", "Garango",
  ],
  "BI": [
    "Gitega", "Bujumbura", "Ngozi", "Rumonge", "Cankuzo", "Makamba", "Muyinga", "Rutana", "Bururi",
    "Rusu", "Bugarama", "Muramvya", "Kayanza", "Kirundo", "Giheta", "Mugendo", "Mutambu", "Munyinya",
    "Ruhengeri", "Rusaka", "Kabezi", "Mukike", "Muri", "Mutsindito", "Isale", "Kareba", "Kavumu",
    "Mabayi", "Mugina", "Mukwege", "Mutimbuzi", "Nibombe", "Rwegura", "Ryambongo", "Ukorwe", "Butaganzwa",
    "Kagararo", "Kanyosha", "Kiganda", "Munyavyi", "Maramvya", "Mugina", "Ruvyiro", "Rugazi", "Rusambi",
    "Mukinwa", "Mutwaro", "Kayanza", "Ngozi", "Buhiga", "Bunyoni",
  ],
  "BJ": [
    "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Djougou", "Bohicon", "Natitingou", "Ouidah", "Lokossa",
    "Kandi", "Abengourou", "Doguitcha", "Daloa", "Zou", "Bové", "Covè", "Pobè", "Savalu",
    "Ségbana", "Malanville", "Banikoara", "Lalara", "Oualou", "Borgou", "Savalou", "Kérou", "Tchaourou",
    "Baribo", "Batia", "Lagbo", "Gouaro", "Sokpoto", "Ménacé", "Kotchakou", "Tchèmbè", "Béri",
    "Aplahoué", "Djakotomey", "Dogbo", "Kouarfa", "Ouinhi", "Sô-Ava", "Aguesso", "Houéy", "Adjarra",
    "Akpro", "Tchonvi", "Atchoukouma", "Banounon", "Kpoukpoumé", "Lobè", "Dandi", "Gbagbedji", "Sakété",
    "Banikoara", "Kouarfa", "Kérou", "Malonville", "Banounon", "Tchèmbè", "Porto Novo",
  ],
  "BW": [
    "Gaborone", "Francistown", "Mogoditshane", "Serowe", "Sebrink", "Molepolole", "Tlokweng", "Mahalapye", "Lobatse",
    "Palapye", "Gabane", "Ramotswa", "Moshupa", "Barolong", "Sua", "Tsumeb", "Grootfontein", "Maun",
    "Ghanzi", "Kokologo", "Chungu", "Kweneng", "Kgatla", "Bokspits", "Matsieng", "Bephotseng", "Mokopong",
    "Otse", "Letsheng", "Modimwe", "Sekoma", "Ramatokwata", "Mmathethe", "Mabapane", "Nkwe", "Mmegi",
    "Bumuna", "Maiteng", "Kgale", "Digawana", "Mankwe", "Sena", "Mababe", "Ramokgwebana", "Dqae Qare",
    "Gowu", "Lehavitlha", "Mokgalo", "Motswedi", "Nchuma", "Opara", "Tlokweng", "Letlhatlha", "Jang",
    "Moshupa", "Mokopong", "Ramokgwebana",
  ],
  "CD": [
    "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Lusambo", "Kisangani", "Bukavu", "Goma", "Uvira",
    "Boma", "Likasi", "Ilebo", "Isiro", "Bandundu", "Kabinda", "Kalemie", "Kamina", "Kolwezi",
    "Moba", "Nioki", "Zongo", "Kenge", "Lodja", "Lomela", "Luau", "Mahagi", "Manono",
    "Mbanza-Ngungu", "Miaga", "Mongala", "Monbasa", "Nachinga", "Nioka", "Ubundu", "Watsa", "Bunia",
    "Aketi", "Ango", "Bumba", "Bena", "Buli", "Buta", "Doko", "Fesenge", "Ileo",
    "Inongo", "Kanda", "Kasongo", "Kasumbalesa", "Katende", "Kibango", "Kinshasa", "Likasi", "Matadi",
    "Mbanza-Ngungu", "Moba", "Niozi", "Popokabaka", "Tshikapa", "Ubundu", "Wamba", "Zongo", "Bokoro",
  ],
  "CF": [
    "Bangui", "Bimbo", "Mobaye", "Bossangoa", "Carnot", "Sarh", "Berbérati", "Bambari", "Bozoum",
    "Nola", "Bouar", "Ippy", "Kaga Bandoro", "Ndélé", "Obo", "Ouadda", "Paoua", "Rébaya",
    "Sibut", "Garoua-Boulaï", "Birao", "Abé", "Bria", "Gambella", "Koui", "Koussé", "Lengo",
    "Lobaye", "Mbomou", "Ouham", "Ouham-Pendé", "Sangha-Mbaéré", "Sékoumé", "Yamboko", "Batangafo", "Bokanga",
    "Bouar", "Bria", "Bambari", "Bossangoa", "Bouca", "Bouca", "Gadzao", "Kaga Bandoro", "Ndélé",
    "Ndola", "Ouaka", "Paoua", "Sambou", "Sarh", "Sibut", "Yalinga", "Zoua", "Bakala",
  ],
  "CG": [
    "Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Owando", "Impfondo", "Loubomo", "Gamboma", "Madingou",
    "Sassou-Maguel", "Kinkala", "Makoua", "Maconge", "Boundjila", "Ké-Makoua", "Komono", "Mouindzi", "Oyo",
    "Dimbelenge", "Mbinda", "Loandjili", "Loutété", "Nzambi", "Buco-Zau", "Boukouanga", "Dzoumili", "Fatou",
    "Fort-Rousset", "Gamboma", "Kindamba", "Loutété", "Makabélé", "Mayé-Maye", "Mazinga", "Matsoua", "Mwanau",
    "Ndindi", "Ndzembi", "Ngambo", "Njilou", "Ntié", "Obouya", "Okoya", "Omissi", "Poto-Poto",
    "Sakété", "Owando", "Bambari", "Boundjila", "Makoua", "Ntié", "Dolisie", "Nkayi", "Impfondo",
    "Sassou", "Brazzaville", "Owando", "Podgorica",
  ],
  "CI": [
    "Abidjan", "Bouaké", "Daloa", "San-Pédro", "Yamoussoukro", "Korhogo", "Divo", "Gagnoa", "Abengourou",
    "Anyama", "Agboville", "Grand-Bassam", "Dabou", "Bondoukou", "Bouaflé", "Koumassi", "Duékoué", "Ferkessédougou",
    "Séguéla", "Sassandra", "Aboisso", "Adzopé", "Aguinzou", "Soubré", "Odienné", "Minignan", "Guiglo",
    "Boundiali", "Bouna", "Tengréla", "Béoumi", "Zuénoula", "Guémon", "Danané", "Sinfra", "Oumé",
    "Katiola", "Bocandé", "Dabakala", "Kani", "Tiassalé", "Tafiré", "Bongouanou", "Dimbokro", "Aboisso",
    "Adzopé", "Didiévi", "Daoukro", "Tanda", "Toumodi", "Dabou", "Grand-Bassam", "Soubré", "Buyobo",
    "Danané", "Guiglo", "Odienné", "Séguéla", "Ferkessédougou", "Boundiali", "San Pedro",
  ],
  "CM": [
    "Douala", "Yaoundé", "Garoua", "Maroua", "Bafoussam", "Bamenda", "Kribi", "Bafang", "Foumban",
    "Edéa", "Ebolowa", "Bertoua", "Ngaoundéré", "Buea", "Mbalmayo", "Dschang", "Limbe", "Loum",
    "Man", "Nkon", "Wum", "Bali", "Kaélé", "Mora", "Mokolo", "Kousséri", "Bongor",
    "Madingrin", "Batouri", "Belabo", "Bity", "Biyem-Assi", "Boffa", "Bonabéri", "Dibamba", "Dibombé",
    "Ding", "Djap", "Dombé", "Ebanga", "Ekok", "Essoum", "Gabou", "Gamaka", "Goulfey",
    "Gu Nkobo", "Kumba", "Mabanda", "Mamou", "Mbanga", "Mombou", "Mouka", "Ndianga", "Ndom",
    "Ngoumou", "Nkongsamba", "Nsafu", "Nyong", "Obala", "Okola", "Somié", "Tiko", "Tolo",
    "Wouri", "Yassa", "Zebala", "Zingana", "Magoum", "Mogodé", "Muri",
  ],
  "CV": [
    "Praia", "Mindelo", "Ribeira Grande", "Tarrafal", "Sal Rei", "Nova Sintra", "Vila do Maio", "Cidade Velha", "Santa Catarina",
    "Cova", "Ribeira Brava", "Paul", "Porto Novo", "Cidade das Pombas", "Pombas", "Tarrafal de São Nicolau", "Tarrafal de Santiago", "Mosteiros",
    "Sao Lourenco", "Sao Vicente", "Santa Luzia", "Santa Isabel", "Boa Vista", "Vila Franca", "Achada Grande", "Pedra Badejo", "Cacuaco",
    "Calhau", "Vale de Cavaleiros", "Mata Fonte", "Achada", "Cruzinha", "Ribeira de Calhau", "Fajã d'Água", "Furna", "Sao Filipe",
    "Vila Nova Sintra", "Maio", "Cidade das Pombas", "Ribeira Brava",
  ],
  "DZ": [
    "Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès",
    "Biskra", "Tlemcen", "Tiaret", "Béjaïa", "Tébessa", "Skikda", "Chlef", "El Oued", "Ouargla",
    "Mostaganem", "Médéa", "Bordj Bou Arréridj", "El Eulma", "Ghardaïa", "M'Sila", "Khenchela", "Aïn Témouchent", "Relizane",
    "Saïda", "Adrar", "Laghouat", "Oum El Bouaghi", "Béchar", "Boumerdès", "El Tarf", "Bordj Badji Mokhtar", "Ouled Djellal",
    "Tamanrasset", "Djanet", "In Salah", "In Guezzam", "Jijel", "Tipaza", "Mila", "Aïn Defla", "Naâma",
    "Tissemsilt", "El Bayadh", "Beni Isguen", "Oued R'hiou", "Aïn M'lila", "Aïn Beïda", "El Biar", "Birtouta", "Bologhine",
    "Bourouba", "Larbaâ", "Rouiba", "Berrouaghia", "Aïn Kermes",
  ],
  "DJ": [
    "Djibouti City", "Ali Sabieh", "Tadjourah", "Obock", "Dikhil", "Ali Sabieh", "Balbala", "Arta", "Randa",
    "Oueh", "Holhol", "Daddato", "Obock", "Tadjourah", "Loyada", "Guintour", "Sobot", "Asha",
    "Zeila",
  ],
  "EG": [
    "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta",
    "Asyut", "Ismailia", "Fayoum", "Zagazig", "Damietta", "Aswan", "Damanhur", "Benha", "Qena",
    "Sohag", "Hurghada", "Sharm El Sheikh", "Minya", "Mallawi", "Bilbeis", "Port Said", "Nag Hammadi", "Ibsway",
    "Mit Ghamr", "Banha", "Kafr El Sheikh", "Arish", "Sidi Bel Ali", "Shibin El Kom", "Tima", "Akhmim", "Al Minya",
    "Qalyub", "Khan El Khalili", "Ras Gharib", "Mallawi", "Bilbeis", "Alamein", "Dabaa", "Wadi El Natrun", "Faiyum",
    "Sinai", "Edfina", "Matrouh",
  ],
  "EH": [
    "Laayoune", "El Aaiun", "Dakhla", "Smara", "Boujdour", "Tifariti", "Es Semara", "Aousserd", "Tarfaya",
    "Dakhla", "Bir Moghrein", "Imlili", "Akhfenir", "Tindouf", "Laâyoune",
  ],
  "ER": [
    "Asmara", "Keren", "Massawa", "Assab", "Mendefera", "Adi Keyh", "Nefasitela", "Tseazega", "Segeneiti",
    "Bisha", "Gash", "Temesena", "Emba Derho", "Halhal", "Nalta", "Debub", "Akurdet", "Barentu",
    "Mendefera", "Adi Quala", "Asmara", "Dekemhare", "Ghinda", "Keren", "Massawa", "Edaga Ereg", "Arresaie",
    "Himberti", "Nefasitela", "Segeneiti", "Ailet", "Ghinda", "Areweig", "Mogareh", "Tsazega", "Shabad",
    "Senafe", "Geleb", "Metula", "Mille", "Berele", "Agarak", "Asmat", "Bayt Al Anbary", "Deman",
    "Tseazega", "Kulal", "Emba Derho", "Gheleb",
  ],
  "ES": [
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao",
    "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada", "A Coruña", "Vitoria", "Elche",
    "Oviedo", "Santa Cruz de Tenerife", "Badalona", "Cartagena", "Terrassa", "Jerez de la Frontera", "Sabadell", "Móstoles", "Alcalá de Henares",
    "Pamplona", "Fuenlabrada", "Almería", "San Sebastián", "Leganés", "Santander", "Castellón de la Plana", "Burgos", "Albacete",
    "Getafe", "Salamanca", "Logroño", "Huelva", "Marbella", "Lleida", "Tarragona", "León", "Cádiz",
    "Jaén", "Ourense", "Girona", "Toledo", "Cáceres", "A Coruña", "Pontevedra", "Gijón", "Alcalá de Henares",
    "San Cristóbal de La Laguna", "Santiago de Compostela", "Alcorcón", "Elche", "Cerdanyola del Vallès", "Teruel",
  ],
  "ET": [
    "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Adama", "Hawassa", "Bahir Dar", "Jimma", "Dessie",
    "Jijiga", "Shashamane", "Dire Dawa", "Arba Minch", "Hosaena", "Kembri", "Debre Markos", "Gebre Guracha", "Dembi Dolo",
    "Hossana", "Bonga", "Jinka", "Harar", "Bedele", "Asosa", "Mizan Teferi", "Maal", "Boditi",
    "Dolo", "Yabelo", "Debre Birhan", "Nazret", "Mendi", "Gido", "Agaro", "Shone", "Gore",
    "Arba Minch", "Sawla", "Welkait", "Bati", "Metu", "Ginir", "Goba", "Bedele", "Metu",
    "Dolo", "Goba", "Bonga", "Bonga", "Tepi", "Gambela", "Mieso", "Welkait",
  ],
  "GA": [
    "Libreville", "Port-Gentil", "Franceville", "Oyem", "Okandéké", "Nzangoumou", "Koulamoutou", "Lambaréné", "Mouila",
    "Moanda", "Mongomo", "Léwé", "Booué", "B-bitam", "Bifoun", "Mékambo", "Akon", "Ndjolé",
    "Ntoum", "Ogooué-Ivindo", "Booué", "Lastoursville", "Koulamoutou", "Pé", "Pé", "Mayumba", "Loubatsa",
    "Omboué", "Port-Gentil", "Tchouka", "Yimbi", "Nzangoumou", "Léwé", "Mongomo", "Oyem", "Mitzic",
    "Makokou", "Franceville", "Franceville", "Berbérati", "Gabon", "Ogooué-Lolo", "Lastoursville", "Kanda", "Franceville",
    "Kougouleu", "Mambouka", "Léwé", "Bitam", "Mveng", "Minkébé", "Ogooué-Ivindo", "Akon", "Makokou",
    "Mouila",
  ],
  "GH": [
    "Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Sunyani", "Obuasi", "Ho", "Techiman",
    "Koforidua", "Wa", "Hohoe", "Yendi", "Bawku", "Bolgatanga", "Tema", "Oda", "Swedru",
    "Goaso", "Nsuta", "Agogo", "Juaben", "Kintampo", "Berekum", "Winneba", "Tarkwa", "Prestea",
    "Bogoso", "Axim", "Bibiani", "Wenchi", "Nkwanta", "Kpandai", "Savelugu", "Mampong", "Asikuma",
    "Ejura", "Fomena", "Atewu", "Akim Oda", "Kade", "Nsawam", "Akropong", "Aburi", "Dome",
    "Somanya", "Akuse", "Kpandai", "Pokuase", "Gawu", "Drobo", "Akim Peki",
  ],
  "GM": [
    "Banjul", "Serekunda", "Brikama", "Kerewan", "Janjanbureh", "Basse", "Soma", "Gambia", "Georgetown",
    "Basse Santa Su", "Kerewan", "Janjanbureh", "Kanifing", "Bakau", "Serrekunda", "Brikama", "Gunjur", "Soma",
    "Basse", "Mansa Konko", "Kartong", "Buniadu Point", "Nimrany", "Gambia", "Yundum", "Lamin", "Banjul",
    "Brufo", "Daboya", "Berebona", "Pass", "Niani", "Fatoto", "Binti", "Ndabrila", "Freetown",
  ],
  "GN": [
    "Conakry", "Nzérékoré", "Kankan", "Labé", "Kindia", "Boké", "Siguiri", "Kouroussa", "Mamou",
    "Faranah", "Coyah", "Beyla", "Balanbaki", "Dinguiraye", "Dubréka", "Forécariah", "Guékédou", "Kérouané",
    "Kissidougou", "Lélouma", "Macenta", "Mandiana", "Pita", "Telimele", "Tougué", "Yomou", "Beyla",
    "Boola", "Boffa", "Dixinn", "Hamah", "Hafia", "Kassa", "Matam", "Ratoma", "Tamayo",
    "Yimbaya", "Balanbaki", "Boda", "Bougouni", "Dakola", "Dalaba", "Faranah", "Ganta", "Karamoya",
    "Koubia", "Marala", "Nimbakiri", "Sannoya",
  ],
  "GQ": [
    "Malabo", "Bata", "Ciudad de la Paz", "Luba", "Ebebiyín", "Mongomo", "Acurenam", "Anisok", "Ayange",
    "Añisok", "Niefang", "Nsok-Nsok", "Nsok", "Mitem", "Akon", "Bieuy", "Mico", "Lago",
    "Owande", "Sera", "Wele", "Mongomo", "Ebebiyin", "Acurenam", "Bata", "Malabo", "Luba",
    "Biyumu", "Bujdjah", "Evinayong", "Mongomo", "Mitem", "Milare", "Mueba", "Nkue", "Nanam",
    "Nsok", "Ntem", "Riaba", "Ripa", "Sheila", "Utamboni", "Mangan", "Mongomo", "Evinayong",
    "Cata", "Bachnaker", "Guma", "Acurenam", "Angondjé", "Ayens", "Bité", "Bubu", "Eyo",
    "Maman", "Mbinga",
  ],
  "GW": [
    "Bissau", "Bafatá", "Gabú", "Oio", "Cacheu", "Bubaque", "Baulé", "Bolama", "Biombo",
    "Gabú", "Bafatá", "Bissau", "Cacine", "Cacheu", "Bubaque", "Bijagós", "Bolama", "Bula",
    "Bafatá", "Gabú", "Oio", "Quinara", "Tombali", "Cumbija", "Gabú", "Bafatá", "Pirada",
    "Bissau", "Bubaque", "Cacine", "Gabú", "Gandu", "Bijagós", "Bafatá", "Cumbija", "Bula",
    "Canindé", "Contuboel", "Gabú", "Bijagós",
  ],
  "KE": [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa",
    "Nyeri", "Machakos", "Meru", "Kakamega", "Likoni", "Nanyuki", "Kilifi", "Wajir", "Embu",
    "Homa Bay", "Mumias", "Iten", "Bungoma", "Kericho", "Mtwapa", "Busia", "Voi", "Naivasha",
    "Narok", "Isiolo", "Maralal", "Kilifi", "Wajir", "Lamu", "Ukunda", "Diani Beach", "Malindi",
    "Watamu", "Kisii", "Kilgoris", "Mumias", "Bungoma", "Bomet", "Keino", "Marsabit", "Wote",
    "Makueni", "Mwingi", "Kabarnet", "Iten", "Kerio Valley", "Njambini", "Kajiado", "Loitokitok",
  ],
  "LR": [
    "Monrovia", "Gbarnga", "Ganta", "Zwedru", "Buchanan", "Gbeulieu", "Kakata", "Gbarnga", "Voinjama",
    "Gbarnga", "Sanniquellie", "Bong", "Fish Town", "Greenville", "Robertsport", "Paynesville", "Gbarnga", "Ganta",
    "Zwedru", "Buchanan", "Tappi", "Gbarnga", "Gbarnga", "Kolahun", "Lofa", "Kailahun", "Grand Bassa",
    "River Cess", "Sinoe", "Bomi", "Cape Mount", "Gbarpolu", "Grand Gedeh", "Grand Cape Mount", "Margibi", "Nimba",
    "Bong", "Gbarma", "Kleve", "Kolahun", "Buchanan", "Monrovia", "Gbarnga", "Tarloken", "Waterside",
    "West Point", "New Kru Town", "Cessis",
  ],
  "LS": [
    "Maseru", "Teyateyaneng", "Hlotse", "Leribe", "Butha-Buthe", "Mokhotlong", "Thaba-Tseka", "Mafeteng", "Mohale's Hoek",
    "Qacha's Nek", "Quthing", "Bereea", "Tebung", "Maputsoe", "Hlotse", "Mokopane", "Botshabelo", "Aliwal North",
    "Phuthaditjhaba", "Sani Pass", "Golden Gate", "Clarens", "Ficksburg", "Ladybrand", "Harrismith", "Wepener", "Ladybrand",
    "Kroonstad", "Bothavatsi", "Phuthaditjhaba", "Hobhouse", "Mokhotlong", "Mafeteng", "Quthing", "Maseru", "Butha-Buthe",
    "Teyateyaneng", "Leribe", "Thaba-Tseka", "Mokhotlong", "Qacha's Nek", "Bereea", "Mokhali", "Thetsane", "Khubetsoana",
    "Ha-Sekoana", "Roma", "Mokhothong", "Teboho",
  ],
  "LY": [
    "Tripoli", "Benghazi", "Syrte", "Misrata", "Bayout", "Zawiya", "Homs", "Khoms", "Zuwara",
    "Zliten", "Ajdabiya", "Shaab", "Derna", "Beida", "Jadu", "Nfoush", "Bayda", "Am Zigha",
    "Gharyan", "Tarhuna", "Sabil", "Sabha", "Brak", "Ghat", "Murzuq", "Ghadames", "Ubari",
    "Awjila", "Kufra", "Al Wahat", "Derna", "Al Bayda", "Marj", "Dabwa", "Al Qatrun", "Bujra",
    "Nalut", "Zintan", "Yefren", "Homs", "Misrata", "Gmida", "Zuwara", "Al Khums", "Al Bayda",
    "Tarhuna", "Gharyan", "Zintan", "Shatwan", "Tocra", "Sidret el Amer", "Nofilia", "Al Qaun", "Aresta",
  ],
  "MG": [
    "Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga", "Toliara", "Antsirabe", "Fianarantsoa", "Ambositra",
    "Morondava", "Manakara", "Ambatondrazaka", "Ambovombe", "Fenoarivo Atsinanana", "Mandritsara", "Miarinarivo", "Ifanadiana", "Ambalavao",
    "Vohitany", "Morondava", "Morondava", "Manakara", "Ambatondrazaka", "Tsiroanomandidy", "Ambalavao", "Antsohihy", "Ambatolaona",
    "Mampikony", "Ambatondrazaka", "Vondrozo", "Farafangana", "Manakara", "Ambositra", "Vangaindrano", "Ambalavao", "Antsirabe",
    "Fianarantsoa", "Ambatomarina", "Toliara", "Morondava", "Tolagnaro", "Mananjary", "Ambohimanga", "Antsiranana", "Antsirabe",
    "Mandritsara", "Marintsara", "Fenoarivo", "Ihosy", "Agnalazaha",
  ],
  "ML": [
    "Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes", "Ségou", "Bobo-Dioulasso", "Kati", "Bandiagara",
    "Ménaka", "Dioïla", "Tombouctou", "Kita", "Nioro", "Gao", "Douro", "Ténéré", "Ansongo",
    "Faya-Largeau", "Kidal", "Mopti", "Djenné", "Mopti", "Bandiagara", "Méguéta", "San", "Mouloudia",
    "Kéniéba", "Koumpouma", "Kati", "Koro", "Nara", "Ségou", "Sikasso", "Mopti", "Tombouctou",
    "Gao", "Bamako", "Ségou", "Kayes", "Koulikoro", "Kati", "Moribabougou", "Douliaba", "Kita",
    "Nioro du Sahel", "Diema", "Ténéré", "Ansongo", "Faya-Largeau", "Kidal", "In Guezzam", "Gourma", "Hombori",
    "Douentza", "Mopti", "Bandiagara", "Nara", "Ménaka", "Kouaga", "Pé", "San", "Kéniéba",
    "Bafoulabé",
  ],
  "MR": [
    "Nouakchott", "Nouadhibou", "Kaédi", "Zouerate", "Atar", "Néma", "Kiffa", "Sélibaby", "Rosso",
    "Boutilimit", "Nouakchott", "Aïr", "Akjoujt", "Chinguetti", "Tichitt", "Ouadane", "Oualata", "Néma",
    "Tidjikja", "Bir Moghrein", "Nouadhibou", "Rosso", "Zouerate", "Atar", "Aïr", "Akjoujt", "Boutilimit",
    "Kaédi", "Kiffa", "Sélibaby", "Néma", "Mrosso", "Gouritz", "R'Kiz", "Béchar", "Merchich",
    "Khenchla", "Monguel",
  ],
  "MU": [
    "Port Louis", "Vacoas", "Curepipe", "Quatre Bornes", "Rose Hill", "Moka", "Beau Bassin", "Bambous", "Rose Hill",
    "Beau Bassin-Rose Hill", "Vacoas", "Quatre Bornes", "Bagatelle", "Goodlands", "Flacq", "Pamplemousses", "Grand Baie", "Flic en Flac",
    "Rivière Noire", "Tamarin", "Mahébourg", "Rodrigues", "Port Mathurin", "Mount", "Piton", "Port Louis", "Pointe aux Sables",
    "Trou aux Cerfs", "Curepipe", "Moka", "Plaine Magnien", "Rose Hill", "Vacoas", "Bagatelle", "Flic en Flac", "Goodlands",
    "Victoria", "Port Mathurin", "Rodrigues", "Pointe aux Sables", "New Grove", "Cote d'Or", "Eureka", "Vieux", "Souillac",
    "Trois Roches", "Petite Rivière",
  ],
  "MA": [
    "Casablanca", "Fès", "Marrakesh", "Fquih Ben Salah", "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
    "Salé", "Temara", "Safi", "Khouribga", "El Jadida", "Béni Mellal", "Nador", "Taza", "Settat",
    "Kelaat Sraghna", "Laâyoune", "Khenifra", "Berrechid", "Berkane", "Ksar El Kébir", "Guelmim", "Errachidia", "Ouarzazate",
    "Essaouira", "Taroudant", "Tiznit", "Sidi Ifni", "Ifrane", "Azrou", "Midelt", "Azilal", "Taourirt",
    "Tinghir", "Youssoufia", "Martil", "Larache", "Khemisset", "Sefrou", "Boulemane", "Figuig", "Driouch",
    "Rabat", "Salé", "Témara", "Skhirat", "Ain Harrouda", "Sidi Bennour", "Sidi Kacem", "Sidi Slimane", "Sidi Yahya Zaer",
    "Tiznit", "Casablanca",
  ],
  "MW": [
    "Blantyre", "Lilongwe", "Mulanje", "Mzuzu", "Zomba", "Kasungu", "Mangochi", "Karonga", "Mangochi",
    "Nkhata Bay", "Chipoka", "Nsanji", "Machinga", "Dedza", "Mchinji", "Mwanza", "Balaka", "Ntcheu",
    "Balaka", "Ntcheu", "Rumphi", "Rumphi", "Nkhata Bay", "Mzimba", "Rumphi", "Likoma", "Mangochi",
    "Neno", "Machinga", "Rumphi", "Mulanje", "Thyolo", "Mwanza", "Neno", "Chikwawa", "Nansanga",
    "Machinga", "Lirangwe", "Phalombe", "Chimanga", "Kanyembe", "Mponda", "Mwalamba", "Domasi", "Muluzi",
    "Mponda", "Muzuru", "Chikwawa", "Nansanga", "Kaphatenga", "Lumbadzi", "Kasinje",
  ],
  "MZ": [
    "Maputo", "Matola", "Nampula", "Beira", "Chimoio", "Tete", "Xai-Xai", "Quelimane", "Pemba",
    "Quelimane", "Nacala", "Sumbe", "Ancuabe", "Balama", "Chiúzo", "Cabo Delgado", "Milange", "Mocuba",
    "Gorongosa", "Massingir", "Balama", "Mocambique", "Marracuene", "Matutuíne", "Vila Nova de Maputo", "Inharrime", "Inhassoro",
    "Cabo Delgado", "Quissico", "Massinga", "Xai-Xai", "Chibuto", "Chigubo", "Ganda", "Inharrime", "Maxixe",
    "Mandlakazi", "Zambézia", "Mueda", "Palma", "Mocambique", "Tete", "Chimoio", "Beira", "Nampula",
    "Pemba", "Ancuabe", "Ilha de Moçambique",
  ],
  "NA": [
    "Windhoek", "Rundu", "Walvis Bay", "Swakopmund", "Otjiwarongo", "Tsumeb", "Grootfontein", "Keetmanshoop", "Lüderitz",
    "Ongwediva", "Oshakati", "Rehoboth", "Katima Mulilo", "Gobabis", "Mariental", "Karibib", "Okahandja", "Omuthiya",
    "Eenhana", "Arandis", "Omaruru", "Otjiwarongo", "Ruacana", "Outapi", "Opuwo", "Sesfontein", "Ondangwa",
    "Henties Bay", "Aranos", "Okahandja", "Otjiwarongo", "Khorixas", "Usakos", "Kunene", "Kavango", "Hardap",
    "Omaheke", "Khomas", "Erongo", "Kunene", "Oshikoto", "Omusati", "Ohangwena", "Kavango East", "Zambezi",
    "Nakatonga", "Katima",
  ],
  "NE": [
    "Niamey", "Zinder", "Maradi", "Agadez", "Tahoua", "Dosso", "Tillabéri", "Diffa", "Ayorou",
    "Birni N'Konni", "N'Guigmi", "Arlit", "Aïr", "Ténéré", "Maïné-Soroa", "Tchintabaraden", "Say", "Guidimouni",
    "Filingué", "Boumous", "Koundara", "Ouallam", "Simbandi", "Dakoro", "Madarama", "Bagarama", "Loga",
    "Makéloan Mèda", "Moussa", "N'Dougga", "Téra", "Tibiri", "Zouar", "Aoukar", "Founkéké", "Gouré",
    "H.filters", "Kéita", "Laïdouma", "Moktar", "Niokkoku", "Ouro Gaidou", "Séguène", "Bankui", "Bazèbè",
    "Dango", "Goni", "Koutoumé", "Mangoumé", "Téri",
  ],
  "NG": [
    "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Kaduna", "Maiduguri", "Zaria",
    "Aba", "Jos", "Ilorin", "Oyo", "Enugu", "Abeokuta", "Onitsha", "Warri", "Calabar",
    "Uyo", "Akure", "Owerri", "Asaba", "Yola", "Gombe", "Jalingo", "Bauchi", "Lokoja",
    "Minna", "Makurdi", "Ube", "Osogbo", "Okitipupa", "Ado Ekiti", "Ikot Ekpene", "Umuahia", "Awka",
    "Nnewi", "Ogoja", "Ikom", "Ugep", "Eket", "Oron", "Bida", "Suleja", "Yelwa",
    "New Bussa", "Okene", "Idah", "Kabba", "Pategi", "Shendam", "Azare", "Misau", "Zaramfa",
    "Muri", "Gembu", "Bali", "Wukari", "Potiskum", "Damaturu", "Nguru", "Gashua", "Geidam",
    "Offa", "Omu Aran", "Ila Orangun", "Ede", "Ilesa", "Owo", "Ilesha", "Ipoti", "Ipole",
    "Ogbomoso", "Iseyin", "Saki", "Igboho", "Igbo-Ora", "Ogbomosho", "Odo-Owa", "Ijebu-Ode", "Iperu",
    "Ipokia", "Okeho", "Oka-Akoko", "Igbara-Oke", "Ige", "Bonny", "Okrika", "Degema", "Omoku",
    "Ahoada", "Oredo", "Ekpoma", "Uromi", "Auchi", "Sapele", "Abraka", "Agbor", "Orlu",
    "Okigwe", "Mbaise", "Aboh", "Uratta", "Ihunwo", "Ekwulobia", "Okoja", "Ohafia", "Isiala",
    "Arochukwu", "Bende", "Afikpo", "Obe", "Abule Egba", "Agege", "Ikorodu", "Badagry", "Epe",
    "Ise", "Igbogilan", "Apapa", "Tinapa", "Sagamu", "Ijebu", "Amuwo", "Mushin", "Surulere",
    "Yaba", "Ambo", "Numan", "Demsa", "Biu", "Gashaka", "Gembu", "Kaltungo", "Bama",
    "Monguno", "Kukawa", "Chibok", "Magaga", "Shuwa", "Rann", "Kano", "Katsina", "Daura",
    "Zaria", "Kazaure", "Birnin Kudu", "Dan Fodio", "Gusau", "Birnin Kebbi", "Yauri", "Argungu", "Aliero",
    "Jega", "Gawon", "Sokoto", "Tambuwal", "Illela", "Muri", "Keffi", "Karu", "Mangu",
    "Riyom", "Barkin Ladi", "Kaltungo", "Yola", "Mubi", "Fika", "Ashaka", "Gurin", "Song",
    "Lamido", "Gombe", "Akko", "Dukku", "Kaltungo", "Bauchi", "Katagum", "Darfin", "Alkaleri",
    "Ibi", "Gembu", "Jalingo", "Bali", "Wukari", "Ikom", "Bauchi", "Azare", "Misau",
    "Bauchi", "Darfin", "Katagum", "Alkaleri", "Biu", "Gashaka", "Bama", "Chibok", "Mubi",
    "Yola", "Bali", "Gembu", "Wukari", "Damaturu", "Potiskum", "Gashua", "Nguru", "Geidam",
    "Bade", "Lade", "Fika", "Hardebe", "Gabru",
  ],
  "RE": [
    "Saint-Denis", "Saint-Paul", "Saint-Leu", "Saint-Pierre", "Saint-Louis", "Le Tampon", "Saint-Joseph", "Saint-Philippe", "La Possession",
    "Le Port", "Saint-Leu", "Entre-Deux", "Saint-André", "Bras-Panon", "Sainte-Rose", "Salazie", "Saint-Louis", "Les Avirons",
    "Cilaos", "Entre-Deux", "Trois-Bassins", "Saint-Paul", "La Possession", "Le Port", "Saint-Joseph", "Saint-Pierre", "Saint-Denis",
    "Sainte-Marie", "Sainte-Suzanne", "Saint-André", "Bras-Panon", "Plaine-des-Palmistes", "Le Guillaume", "La Rivière",
  ],
  "RW": [
    "Kigali", "Butare", "Gitarama", "Gisenyi", "Kabale", "Kibuye", "Byumba", "Cyangugu", "Musanze",
    "Gicumbi", "Kigali", "Butare", "Gitarama", "Gisenyi", "Kabale", "Kibuye", "Byumba", "Cyangugu",
    "Musanze", "Gicumbi", "Nyanza", "Ruhengeri", "Ngozi", "Kayonza", "Kibingo", "Bugarama", "Kareba",
    "Borgokwe", "Gatare", "Nyagatare", "Rwamagana", "Mubende", "Luwero", "Kitovu", "Kavu", "Cyato",
    "Isale", "Tumba", "Kigali", "Gisenyi", "Nyamirambo", "Kimisagara", "Kacyiru", "Nyarutarama", "Gikondo",
    "Remera", "Bugesera",
  ],
  "SC": [
    "Victoria", "Anse Boileau", "Anse Royale", "Anse Lazio", "Anse Kerlan", "Bel Air", "Grand Anse", "Morbio", "Port Launay",
    "Praslin", "Pointe Larue", "Cascade", "La Digue", "La Passe", "Anse Intendance", "Anse Capus", "Anse Etoile", "Beau Vallon",
    "Victoria", "Anse Boileau", "Anse Royale", "Anse Lazio", "Mahé", "Silhouette", "Moyenne", "Perseverance", "Mont Fleuri",
    "Anse Intendance", "Anse Etoile", "Anse Royale", "Anse Lazio", "Anse Kerlan", "Anse Boileau", "Victoria",
  ],
  "SD": [
    "Khartoum", "Omdurman", "Bahir Dar", "Port Sudan", "Wad Madani", "El Obeid", "Kosti", "Kassala", "Atbara",
    "Roseires", "Nyala", "El Dueim", "Gedaref", "Gedaref", "Kafia", "Khartoum", "Omdurman", "Bahir Dar",
    "Gedaref", "Nyala", "Kosti", "Gezira", "Shendi", "Merowe", "Karima", "Wad Halfa", "Suakin",
    "Berber", "Babanusa", "Metema", "Kassala", "Gedaref", "New Halfa", "Halfa", "Shuwak", "Kide",
    "Kawgele",
  ],
  "SH": [
    "Jamestown", "Half Tree Hollow", "Long Beach", "Largo", "Chubbar", "Pond",
  ],
  "SL": [
    "Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar", "Port Loko", "Bai Kamara", "Kabala",
    "Moyamba", "Bumbuna", "Kailahun", "Kambia", "Tonkolili", "Kono", "Kailahun", "Pujehun", "Mattru Jong",
    "Kambia", "Bombali", "Kailahun", "Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar",
    "Port Loko", "Bai Kamara", "Kabala", "Moyamba", "Bumbuna", "Pendembu", "Kailahun", "Kambia", "Bunumbu",
    "Yele", "Koinadugu", "Mattru Jong", "Kabala", "Kamabai", "Makeni", "Kambia", "Moyamba", "Segbema",
    "Daru", "Kailahun",
  ],
  "SN": [
    "Dakar", "Touba", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor", "Kaédi", "Kolda", "Mbour",
    "Louga", "Kaffrine", "Kédougou", "Fatick", "Diourbel", "Tambacounda", "Matam", "Kédougou", "Kaffrine",
    "Sédhiou", "Ziguinchor", "Cap Skirring", "Bakel", "Podor", "Dagana", "Bambey", "Nioro du Rip", "Ndioum",
    "Nioro", "Foundiougne", "Mbour", "Joal-Fadiouth", "Kayar", "Sokone", "Bignona", "Bougane", "Ourossogui",
    "Podor", "Matam", "Ranérou", "Bakel", "Kanel", "Sokone", "Diane", "Sindia", "Tambacounda",
    "Koumpentoum", "Nioro du Rip", "Mbacké", "Touba", "Diourbel",
  ],
  "SO": [
    "Mogadishu", "Hargeisa", "Kismayo", "Berbera", "Baidoa", "Burao", "Bosaso", "Galkayo", "Garowe",
    "Hudur", "Garbaharey", "Eyl", "Belet Weyne", "Jowhar", "Merca", "Gedo", "Laasqoray", "Buuhoodle",
    "Eldere", "El Wak", "Bardera", "Dhuso", "Lashawno", "Buur Dhexe", "Bayir", "Tawfiiq", "Xuddun",
    "Dhana", "Cadaado", "Buur Dhexe", "Baydhaba", "Wajid", "Togdheer", "Boo", "Buuhoodle", "Dabid",
    "Buraa", "Qandala", "Lasqoray", "Gedo", "Bayir", "Bardera", "El Wak", "Buuhoodle", "Bardera",
    "Qardho", "CeeBaar", "Dhoob", "El Dhexe", "Garbahaarey", "Godob Jiraan", "Toh",
  ],
  "SS": [
    "Juba", "Yei", "Wau", "Malakal", "Rumbek", "Bor", "Aweil", "Yambio", "Bentiu",
    "Kapoeta", "Torit", "Gogrial", "Kwajala", "Kafia", "Tonj", "Amadi", "Nimule", "Bor",
    "Mundri", "Yei", "Kajo-Keji", "Maridi", "Lainya", "Bulia", "Morobo", "Lokichoggio", "Lokwa",
    "Pajij", "Matan", "Kapoeta", "Talata", "Yei", "Kinyeti", "Kapoeta East", "Khor Wau", "Moussan",
    "Awerial", "Yirol", "Longe", "Tulia", "Kapoeta", "Torit", "Kinyeti", "Kokwe",
  ],
  "ST": [
    "São Tomé", "Santo António", "Dzaúdi", "Guantã", "Macapá", "Lembá", "Madalena", "Trindade", "Cauã",
    "Biletá", "Ponta do Sol", "Santo Amaro", "Dioogo", "Sambú", "Ribeira Afonso", "Bafatá", "Nova Olinda", "Água Izé",
    "Mé-Zóchi", "Vila Praia", "Madalena", "Vila Vitória", "Fogo", "Mação",
  ],
  "SZ": [
    "Mbabane", "Manzini", "Lobamba", "Ezulwini", "Big Bend", "Piggs Peak", "Hlatikulu", "Bulembu", "Mhlume",
    "Mhlathuze", "Ngwenya", "Mankhontjini", "Ntfungeni", "Siphofaneni", "Sibebe", "Msangeni", "Dempsa", "Matsapha",
    "Malandela", "Sidwashaw", "Kwaluseni", "Luve", "Bhayi", "Nsangwane", "Kubus", "Komati", "Manzini",
    "Mbabane", "Mhlume", "Nhlangano", "Piggs Peak", "Ngwenya",
  ],
  "TD": [
    "N'Djamena", "Sarh", "Moundou", "Abéché", "Doba", "Faya-Largeau", "Bongor", "Béré", "Ati",
    "Oum Hadjer", "Fada", "Gao", "Mao", "Bol", "Adré", "Bama", "Amdjamena", "Am Timan",
    "Bambari", "Doba", "Goulfey", "Guéra", "Haraze Mangueigne", "Kousséri", "Léré", "Massenya", "Moaï",
    "Mokolo", "Mongo", "Nguidilim", "Sarh", "Timia", "Oum Hadjer", "Abéché", "Faya-Largeau", "Bardai",
    "Borh", "Am Cadjra", "Amsougui", "Baga-Soba", "Bebel", "Beso", "Bongor", "Dalatlé", "Dardé",
    "Goulfey", "Gueré", "Koumarkar", "Kyabé", "Léré", "Mouka", "Sidoumaya", "Timia", "Yalinga",
    "Abé", "Amdjamena", "Amsougui", "Bama", "Bardai", "Bitrimi", "Bokoro", "Fika",
  ],
  "TG": [
    "Lomé", "Sokodé", "Kara", "Atakpamé", "Tsévié", "Aného", "Dapaong", "Bafou", "Kpalimé",
    "Notsé", "Ségou", "Atakpame", "Womé", "Kégué", "Bassari", "Akomé", "Amou", "Aného",
    "Atakpamé", "Bafou", "Batié", "Blitohove", "Dapaong", "Gbomé", "Kara", "Kégué", "Kpalimé",
    "Lomé", "Momé", "Notsé", "Pagou", "Togo", "Womé", "Yékoumé", "Zéro", "Adomé",
    "Agbodrafo", "Agou", "Ahoamey", "Aizomé", "Akpomé", "Améton", "Aniabre", "Ayivi", "Djomé",
    "Dogou", "Gbo", "Gbandi", "Kagné", "Kadjèvi", "Kamtɔ", "Kessé", "Kloto", "Kougnam",
    "Kpalimé", "Kougla",
  ],
  "TN": [
    "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa", "Monastir",
    "Ben Arous", "Kasserine", "Medenine", "Gbeulieu", "Kebili", "Jendouba", "Mahdia", "Tataouine", "Tozeur",
    "Siliana", "Zaghouan", "Béja", "Jebel", "Kébili", "Bizerte", "Gabès", "Gafsa", "Kairouan",
    "Kasserine", "Kebili", "Kef", "Mahdia", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
    "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan", "Bizerte", "Ain Draham", "Bouzriba",
    "Chebika", "Douz", "El Kef", "Ksar", "Metlaoui", "Redeyef", "Sfax", "Sidi Bouzid",
  ],
  "TZ": [
    "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Arusha", "Zanzibar City",
    "Kahama", "Tabora", "Kigoma", "Sumbawanga", "Kasulu", "Songea", "Musoma", "Iringa", "Mtwara",
    "Bukoba", "Moshi", "Lindi", "Babati", "Mpanda", "Soko", "Korogwe", "Njombe", "Geita",
    "Mpanda", "Handeni", "Kilosa", "Mberea", "Mbinga", "Nachingora", "Makambako", "Tunduma", "Nungwi",
    "Paje", "Bukoba", "Muleba", "Ngara", "Bariadi", "Kishapu", "Mpanda", "Urambo", "Njombe",
    "Mahenge", "Ifakara", "Itumba", "Kigoma", "Wete", "Bamba Bay", "Kisiwani", "Amani",
  ],
  "UG": [
    "Kampala", "Gulu", "Mbale", "Mbarara", "Jinja", "Arua", "Hoima", "Masaka", "Mbarara",
    "Jinja", "Mbale", "Gulu", "Soroti", "Fort Portal", "Entebbe", "Mityana", "Kabale", "Arua",
    "Iganga", "Lira", "Bonthe", "Rakai", "Kabale", "Kisubi", "Ntungamo", "Jinja", "Buhweju",
    "Nakasongola", "Kaliro", "Kyenjojo", "Ntoroko", "Kyegegwa", "Amudat", "Mubende", "Nakasese", "Kasese",
    "Kabale", "Kyegegwa", "Kisoro", "Kapchorwa", "Kween", "Bukedea", "Ngora", "Kaberamaido", "Amolatar",
    "Patongo", "Oyam", "Lira", "Kitgum", "Pader", "Agago", "Omoro", "Gulu", "Pakwach",
    "Matala",
  ],
  "ZM": [
    "Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola", "Mufulira", "Livingstone", "Luanshya", "Kasama",
    "Chipata", "Solwezi", "Mongu", "Lusaka", "Chililabombwe", "Kafue", "Monze", "Mazabuka", "Kansanshi",
    "Kalulushi", "Chambishi", "Ndola", "Mpika", "Serenje", "Mkushi", "Kabwe", "Petauke", "Mumbwa",
    "Kapiri Mposhi", "Chinsali", "Shiwang'andu", "Chiluba", "Mbala", "Kapendwa", "Mumbwe", "Isoka", "Mpulungu",
    "Mangango", "Katete", "Siavonga", "Namwala", "Monze", "Gwembe", "Sinazongwe", "Zambezi", "Mongu",
    "Sesheke", "Kaoma", "Chinsali", "Mumbwa",
  ],
  "ZW": [
    "Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru", "Epworth", "Kwekwe", "Kadoma", "Masvingo",
    "Marondera", "Norton", "Chegutu", "Bindura", "Zvinavashe", "Zvishavane", "Redcliff", "Rusape", "Chiredzi",
    "Gokwe", "Glendale", "Mberengwa", "Chipinge", "Shurugwi", "Mount Darwin", "Gwanda", "Plumtree", "Karoi",
    "Chimanimani", "Beitbridge", "Hwange", "Victoria Falls", "Victoria", "Kariba", "Chirundu", "Beula", "Masvingo",
    "Nyahokande", "Mberengwa", "Gandanzara", "Penhalonga", "Odzi", "Marondera", "Mutasa", "Guzura", "Wedza",
    "Chatsworth", "Save", "Chimanimani", "Mutare", "Mutoko", "Nyanga", "Mhangura", "Mutoko", "Gokwe",
  ],
  "KM": [
    "Moroni", "Mutsamudu", "Fomboni", "Domoni", "Moya", "Iconi", "Bambao", "Bandroun", "Koni",
    "Mdé", "Male", "Mutsamudu", "Fomboni", "Iconi", "Domoni", "Bambao", "Bandroun", "Koni",
    "Moya", "Mdé", "Tséhé", "Mbambao", "Sima", "Mouhousa", "Wabahi", "Hamchumbo", "Moyeni",
    "Mwalimu Ngezi", "Chas",
  ],
  "AF": [
    "Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Kunduz", "Jalalabad", "Lashkargah", "Taloqan", "Gardez",
    "Ghazni", "Charikar", "Faizabad", "Pul-i-Khumri", "Khost", "Bamyan", "Baghlan", "Samangan", "Jowzjan",
    "Faryab", "Nimruz", "Zabul", "Logar", "Nangarhar", "Kunar", "Paktia", "Paktika", "Badakhshan",
    "Ghor", "Sar-e Pol", "Uruzgan", "Daykundi", "Arghandab", "Shibar", "Ghelj", "Dowlatdarreh", "Bagram",
    "Khulm", "Shaato", "Dawlat Yar", "Ghorak", "Chahar Dara", "Gizab", "Maruf", "Anjam", "Firozkoh",
    "Chitral", "Khost", "Rodaki", "Lalma", "Deh Salah", "Qala-e-Naw", "Zaranj", "Tarin Kowt", "Spin Boldak",
    "Nili", "Bost", "Zermat",
  ],
  "AM": [
    "Yerevan", "Gyumri", "Vanadzor", "Vagharshapat", "Abovyan", "Kapan", "Hrazdan", "Artashat", "Gavar",
    "Ijevan", "Charentsavan", "Masis", "Vedi", "Sisian", "Meghri", "Stepanavan", "Noyemberyan", "Tashir",
    "Spitak", "Yeghegnadzor", "Armavir", "Echmiadzin", "Aragats", "Kotayk", "Shirak", "Lori", "Tavush",
    "Gegharkunik", "Syunik", "Vayots Dzor", "Maragha", "Metsamor", "Ashtarak", "Ararat", "Aparan", "Dsegh",
    "Dilijan", "Ishkhan", "Sevan", "Gavar", "Lernantsk", "Lernarot", "Vardenis", "Talin", "Byureghavan",
    "Noratus",
  ],
  "AZ": [
    "Baku", "Ganja", "Sumqayit", "Mingachevir", "Nakhchivan", "Shaki", "Lankaran", "Yevlax", "Quba",
    "Qusar", "Qazax", "Salyan", "Masalli", "Aghjabadi", "Ismayilli", "Balakan", "Zaqatala", "Tovuz",
    "Goychay", "Kurdashi", "Agdam", "Fuzuli", "Xankandi", "Qobustan", "Ağdam", "Astara", "Fındıklı",
    "Şirvan", "Şamaxı", "Şəki", "Gəncə", "Sumqayıt", "Mingəçevir", "Naxçıvan", "Lənkəran", "Yevlax",
    "Salyan", "Masallı", "Ağcabadi", "İsmayıllı", "Xaçmaz", "Şabran", "Qusar", "Qazax", "Tovuz",
    "Göyçay", "Kürdəmir", "Tovuz", "Balakən", "Zaqatala", "Ağdam", "Füzuli", "Xankəndi", "Cəbrayıl",
    "Qobustan", "Masallı", "Salyan", "Binədi", "Naxçıvan", "Ordubad",
  ],
  "BH": [
    "Manama", "Riffa", "Muharraq", "Sitra", "Budaiya", "Juhar", "Karbabad", "Isa Town", "Sahlat",
    "Hidd", "Awali", "Arad", "Barbar", "Saar", "Karrana", "Bani Darwish", "Amwaj", "Diyar Al Muharraq",
    "Ghayran", "Janadriyah", "Markhiya", "Nuaim", "Qurtoba", "Reef", "Sama", "Sanad", "Shakhboot",
    "Shamsan", "Sharifa", "Shidwalka", "Abu Abeed", "Jidda", "Abu Sayyah", "Abu Sad", "Al Qatif", "Adhariya",
    "Al Budayri", "Al Jasra", "Al Malkiya", "Al Qala", "Al Shirkah", "Arad", "Asrar", "Awali", "Barbar",
    "Bawshar", "Bisa Bujray", "Bu Um Kas", "Dar Ishbaj", "Diyab", "Dilab", "Falaj", "Fidda",
  ],
  "BD": [
    "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Comilla", "Narayanganj",
    "Gazipur", "Mymensingh", "Cox's Bazar", "Bogra", "Dinajpur", "Faridpur", "Janjgir", "Narsingdi", "Kushtia",
    "Feni", "Noakhali", "Pabna", "Patuakhali", "Rangamati", "Sirajganj", "Tangail", "Thakurgaon", "Brahmanbaria",
    "Chandpur", "Chuadanga", "Gopalganj", "Habiganj", "Joypurhat", "Khagrachhari", "Lakshmipur", "Lalmonirhat", "Madaripur",
    "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Naogaon", "Narail", "Natore", "Netrokona",
    "Nilphamari", "Panchagarh", "Pirojpur", "Rajbari", "Shariatpur", "Sherpur", "Sunamganj", "Bandarban", "Jhalokati",
    "Bagerhat", "Bhola", "Lakshmipur", "Moulvibazar", "Panchagarh", "Rangpur", "Thakurgaon", "Kurigram",
  ],
  "BT": [
    "Thimphu", "Phuentsholing", "Paro", "Trashigang", "Haa", "Punakha", "Wangdue Phodrang", "Bumthang", "Trashiyangtse",
    "Samdrup Jongkhar", "Samtse", "Tsirang", "Gasa", "Zhemgang", "Trongsa", "Mongar", "Pemagatshel", "Lhuentse",
    "Chukha", "Bumthang", "Zhemgang", "Phuentsholing", "Thimphu", "Paro", "Haa", "Paro", "Thimphu",
    "Punakha", "Trashigang", "Mongar", "Samdrup Jongkhar", "Tsirang", "Gelephu", "Phuentsholing", "Laya", "Thimphu",
    "Samtse", "Sarpang", "Pemagatshel", "Trongsa", "Lhuentse", "Gasa", "Trashiyangtse",
  ],
  "BN": [
    "Bandar Seri Begawan", "Kuala Belait", "Tutong", "Seria", "Bangar", "Subok", "Seria", "Bandar Seri Begawan", "Tutong",
    "Kuala Belait", "Seria", "Subok", "Bangar", "Kiulap", "Bandar", "Temburong", "Tutong", "Jerudong",
    "Bukit Pagon", "Kuala Belait", "Serasa", "Sungai Liang", "Tutong", "Kampung Dato Kerin", "Muara", "Panaga", "Lumapas",
    "Bekang", "Sungai Petai", "Tutong", "Kuala Belait", "Bangar", "Subok", "Serasa", "Bandar", "Seria",
    "Kampung Ayer", "Tutong", "Bukit Pagon", "Jerudong", "Bandar Seri Begawan",
  ],
  "KH": [
    "Phnom Penh", "Siem Reap", "Sihanoukville", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Thom", "Kampong Speu", "Kampot",
    "Kratie", "Stung Treng", "Svay Rieng", "Takeo", "Banteay Meanchey", "Koh Kong", "Kandal", "Prey Veng", "Pursat",
    "Tboung Khmum", "Sampong", "Chachoengsao", "Chanthaburi", "Khanom", "Banlung", "Pailin", "Krong Kaeb", "Krong Pailin",
    "Krong Kampong", "Pheakdei", "Ou Chrov", "Skun", "Battambang", "Pailin", "Krong Stueng Saen", "Kampong Thom", "Krong Stueng Saen",
    "Preah Vihear", "Cheam", "Sraem", "Bakan", "Aural", "Khanh", "Prasat", "Oudom", "Sambor",
    "Kompong Cham", "Krong Russey", "Krong Stueng", "Kampong Speu", "Kampot", "Kampong Speu", "Krong Kong",
  ],
  "CN": [
    "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chongqing", "Tianjin", "Wuhan", "Chengdu", "Nanjing",
    "Xi'an", "Hangzhou", "Qingdao", "Zhengzhou", "Changsha", "Shenyang", "Jinan", "Dalian", "Fuzhou",
    "Kunming", "Harbin", "Changchun", "Hefei", "Nanning", "Nanchang", "Guiyang", "Urumqi", "Lanzhou",
    "Hohhot", "Haikou", "Sanya", "Yinchuan", "Xining", "Lhasa", "Taiyuan", "Shijiazhuang", "Tangshan",
    "Wuxi", "Ningbo", "Suzhou", "Xiamen", "Dongguan", "Foshan", "Zhanjiang", "Zhaoqing", "Huizhou",
    "Luoyang", "Anyang", "Xuzhou", "Nantong", "Wenzhou", "Jiaxing", "Shaoxing", "Huzhou", "Jinhua",
    "Yiwu", "Taizhou", "Yangzhou", "Zhenjiang", "Lianyungang", "Huai'an", "Suqian", "Yibin", "Nanchong",
    "Dazhou", "Mianyang", "Leshan", "Luzhou", "Zigong", "Guangan", "Meishan", "Ziyang", "Deyang",
    "Zhongshan", "Jiangmen", "Zhuhai", "Shantou", "Maoming", "Yangjiang", "Kunming", "Yunnan", "Jilin",
    "Baotou", "Hohhot", "Ordos", "Datong", "Yulin",
  ],
  "GE": [
    "Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Zugdidi", "Gori", "Poti", "Telavi", "Akhaltsikhe",
    "Ochamchire", "Sukhumi", "Gagra", "Kvariati", "Lanchkhuti", "Samtredia", "Senaki", "Kobuleti", "Tskaltubo",
    "Zestafoni", "Ambrolauri", "Oni", "Mestia", "Ushguli", "Chiatura", "Lagodekhi", "Dedoplistsqaro", "Dmanisi",
    "Lagodekhi", "Nakalakevi", "Batu", "Tsqaltubo", "Kharagauli", "Kvariati", "Nak'alevi", "Martvili", "Senaki",
    "Salkhino", "Tsageri", "Ambrolauri", "Khulo", "Shuakhevi", "Keda", "Kobuleti", "Gali", "Laituri",
    "Ureki", "Kvariati", "Batumi", "Kobuleti", "Kvariati", "Mskhalta",
  ],
  "IN": [
    "Mumbai", "Delhi", "New Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
    "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
    "Varanasi", "Ludhiana", "Agra", "Nashik", "Vadodara", "Rajkot", "Kochi", "Coimbatore", "Visakhapatnam",
    "Madurai", "Bhubaneswar", "Chandigarh", "Guwahati", "Thiruvananthapuram", "Ranchi", "Jabalpur", "Gwalior", "Vijayawada",
    "Jamshedpur", "Raipur", "Kota", "Udaipur", "Jodhpur", "Mysuru", "Mysore", "Mangaluru", "Mangalore",
    "Hubli", "Dharwad", "Belgaum", "Hubballi", "Salem", "Tiruchirappalli", "Tiruchy", "Tirunelveli", "Thoothukudi",
    "Dindigul", "Thanjavur", "Erode", "Vellore", "Tiruppur", "Tirupur", "Durgapur", "Asansol", "Siliguri",
    "Bareilly", "Gaya", "Jamshedpur", "Dehradun", "Allahabad", "Gorakhpur", "Jhando", "Amritsar", "Ludhiana",
    "Amritsar", "Bikaner", "Jaisalmer", "Udaipur", "Kota", "Ajmer", "Pushkar", "Bundi", "Bikaner",
    "Kota", "Sri Ganganagar", "Fazilka",
  ],
  "ID": [
    "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Palembang", "Makassar", "Banda Aceh", "Balikpapan",
    "Pekanbaru", "Padang", "Manado", "Ambon", "Jayapura", "Kupang", "Samarinda", "Pontianak", "Palangkaraya",
    "Bengkulu", "Jambi", "Serang", "Bogor", "Cirebon", "Tegal", "Malang", "Sukabumi", "Tasikmalaya",
    "Binjai", "Palu", "Gorontalo", "Kendari", "Banda Aceh", "Lhokseumawe", "Langsa", "Tanjung Pinang", "Dumai",
    "Batu", "Pematangsiantar", "Tanjung Balai", "Binjai", "Tebing Tinggi", "Padangsidimpuan", "Bukittinggi", "Payakumbuh", "Solok",
    "Sibolga", "Dumai", "Pekanbaru", "Dumai", "Bengkalis", "Bagansiapiapi", "Jambi", "Sungai Penuh", "Muaro Jambi",
    "Baturaja", "Prabumulih", "Lahat", "Pagar Alam", "Banyuasin", "Palembang", "Prabumulih", "Baturaja", "Muara Enim",
    "Lubuklinggau", "Rejang Lebong", "Bandar Lampung", "Metro", "Kotabumi", "Pringsewu", "Sukabumi", "Cianjur", "Tasikmalaya",
  ],
  "IR": [
    "Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz", "Qom", "Ahvaz", "Kermanshah",
    "Urmia", "Rasht", "Zahedan", "Hamadan", "Kerman", "Yazd", "Ardabil", "Bandar Abbas", "Arak",
    "Zanjan", "Sanandaj", "Qazvin", "Khorramabad", "Gorgan", "Sari", "Bushehr", "Kashan", "Najafabad",
    "Saveh", "Khomeini Shahr", "Varamin", "Mahallat", "Minab", "Bojnord", "Birjand", "Sabzevar", "Khalilabad",
    "Malayer", "Marand", "Baneh", "Bajestan", "Neyshabur", "Semnan", "Shahrekord", "Yasuj", "Izeh",
    "Borujerd", "Golestan", "Qaemshahr", "Bam", "Torbat-e Jam", "Bandare Anzali", "Abadan", "Dezful", "Khorramshahr",
    "Omidiyeh", "Rafsanjan", "Jiroft", "Chabahar", "Kish", "Qeshm", "Ramsar", "Chalus", "Nowshahr",
    "Khorramshahr", "Abadan", "Shush", "Mahshahr", "Bandare Torkaman", "Bojnord", "Gorgan",
  ],
  "IQ": [
    "Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Kirkuk", "Sulaymaniyah", "Nasiriyah",
    "Amarah", "Diwaniyah", "Ramadi", "Kut", "Samawah", "Baqubah", "Zakho", "Halabja", "Ranya",
    "Duhok", "Aqrah", "Shaqlawa", "Chamchamal", "Tikrit", "Kufa", "Baqubah", "Kadhimiya", "Adhamiya",
    "Sadr City", "Mahmudiyah", "Al-Faw", "Fallujah", "Tal Afar", "Sinjar", "Habbaniyah", "Baqubah", "Az Zubayr",
    "Shaiba", "Badra", "Zubayr", "Shatrah", "Suq al-Shuyukh", "Badra", "Shahwan", "Qal'at Suq", "Hawiya",
    "Barzan", "Duhok", "Amedi", "Sheikhan", "Rawanduz", "Mergasur", "Taza Khurmatu", "Kifri", "Aqrah",
    "Chamchamal", "Ranya", "Halabja", "Koya", "Baqubah", "Khaniqin", "Jalula",
  ],
  "IL": [
    "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beer Sheva", "Holon",
    "Bnei Brak", "Ramat Gan", "Ashkelon", "Rehovot", "Bat Yam", "Herzliya", "Kfar Saba", "Modiin", "Nazareth",
    "Lod", "Ramla", "Ra'anana", "Givatayim", "Nahariya", "Eilat", "Acre", "Safed", "Tiberias",
    "Afula", "Jezreel", "Karmiel", "Ararot", "Yavne", "Sderot", "Sakhnin", "Nesher", "Or Yehuda",
    "Kiryat Malakhi", "Kiryat Gat", "Rosh Pina", "Migdal Haemek", "Kiryat Bialik", "Kiryat Motzkin", "Kiryat Ono", "Rosh HaAyin", "Gan Raveh",
    "Kiryat Tivon", "Iksitei", "Ofakim", "Beit Shemesh", "Afula", "Nabariya", "Karmiel", "Nahariya", "Safed",
    "Metula", "Kiryat Shmona", "Arad", "Dimona", "Mitzpe Ramon", "Eilat", "Sderot", "Kiryat Gat",
  ],
  "JP": [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki",
    "Saitama", "Hiroshima", "Sendai", "Chiba", "Kitakyushu", "Sakai", "Niigata", "Hamamatsu", "Shizuoka",
    "Kumamoto", "Okayama", "Kagoshima", "Funabashi", "Hachioji", "Matsuyama", "Utsunomiya", "Kanazawa", "Oita",
    "Nara", "Nagasaki", "Toyama", "Gifu", "Mito", "Takasaki", "Ibaraki", "Fukuyama", "Takamatsu",
    "Toyama", "Matsumoto", "Koriyama", "Kushiro", "Otsu", "Yokosuka", "Kawagoe", "Hirakata", "Morioka",
    "Maebashi", "Iwata", "Tokorozawa", "Tama", "Kasukabe", "Akita", "Aomori", "Yamagata", "Miyazaki",
    "Kochi", "Fukui", "Nagaoka", "Atsugi", "Ota", "Numazu", "Higashiosaka", "Hiratsuka", "Machida",
    "Kofu", "Kushiro", "Muroran", "Kitami", "Obihiro", "Asahikawa", "Nagasaki",
  ],
  "JO": [
    "Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba", "Madaba", "Mafraq", "Karak", "Tafilah",
    "Ma'an", "Ajloun", "Jerash", "Salt", "Azraq", "Fuheis", "Muwaffaq Salti", "Dhiban", "Rabia",
    "Qasabat", "Al-Salt", "Madaba", "Mafraq", "Azraq", "Karak", "Tafilah", "Shobak", "Wadi Musa",
    "Petra", "Dana", "At Tafilah", "Al-Aqaba", "Aqaba", "Ar-Ramtha", "Al-Salt", "Mahis", "Irbil",
    "Ruwayshid", "Al-Mafraq", "Al-Salt", "Azraq", "Khirbet al-Mafjar", "Suwayqah", "Al-Jawbathah", "Al-Quwayrah",
  ],
  "KZ": [
    "Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Taraz", "Pavlodar", "Oskemen", "Semey",
    "Atyrau", "Kostanay", "Petropavl", "Oral", "Aktau", "Aktogay", "Zhezkazgan", "Temirtau", "Kokshetau",
    "Rudny", "Ekibastuz", "Balkhash", "Saryozek", "Turkestan", "Baikonur", "Zaraysk", "Shu", "Katon-Karagai",
    "Darbandek", "Ridder", "Saryagash", "Kapsalagay", "Zhanibek", "Kenderli", "Ushu", "Kyzylorda", "Arkalyk",
    "Zhezkazgan", "Shakhan", "Shantobe", "Ekibastuz", "Pavlodar", "Kokshetau", "Petropavl", "Aksu", "Saryozek",
    "Baikonur", "Balkhash", "Taraz", "Shymkent", "Turkestan", "Kandagash", "Beyneu", "Zashchita", "Shalgar",
    "Katon-Karagai", "Ust-Kamenogorsk", "Ridder", "Ekibastuz", "Aksu", "Shymkent", "Kentau", "Zhezkazgan", "Balkhash",
    "Karyagash",
  ],
  "KP": [
    "Pyongyang", "Hamhung", "Chongjin", "Wonsan", "Nampo", "Sinuiju", "Hyesan", "Kanggye", "Hanchon",
    "Chongju", "Sariwon", "Kaesong", "Ryanggang", "Rason", "Tanchon", "Sinchon", "Pakchon", "Yonan",
    "Hujon", "Unggi", "Anju", "P'yongsan", "Ch'oeseong", "Kusong", "Sindok", "Hoeryong", "Kŭmgang",
    "Mŏkphŏm", "P'yŏngyang", "Ch'oeryŏng", "Sinan", "Yŭnggŭn", "Sinŭng", "Kangdong", "Yodok", "Sinpyong",
    "Pochon", "Kŭmya", "Kŭmp'o", "Ryonggang", "Ryongwon", "Kŭryŏng", "Hŭichon", "Sinŭng", "Paekchin",
    "Munchon", "Yŏnghŭ", "Paektu", "Ryanggang", "Kanggye", "Sinuiju", "Chongjin", "Rajin", "Sonbong",
  ],
  "KR": [
    "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon",
    "Seongnam", "Goyang", "Yongin", "Bucheon", "Ansan", "Cheongju", "Jeonju", "Anyang", "Cheonan",
    "Uijeongbu", "Siheung", "Hwaseong", "Namyangju", "Pyeongtaek", "Jeju", "Gimhae", "Pohang", "Miryang",
    "Gumi", "Gunsan", "Iksan", "Gangneung", "Wonju", "Yangsan", "Paju", "Mokpo", "Suncheon",
    "Gyeongju", "Gyeonggi", "Ganghwa", "Andong", "Yeongju", "Gimcheon", "Gokseong", "Hamyang", "Namyangju",
    "Yeongdeok", "Uljin", "Goheung", "Jangheung", "Jincheon", "Boseong", "Gochang", "Gangjin", "Muan",
    "Hwasun", "Gurye", "Damyang", "Gwangyang", "Sunchang", "Jeongeup", "Buan", "Seon", "Uiseong",
  ],
  "KW": [
    "Kuwait City", "Hawalli", "Salmiya", "Jahra", "Fahaheel", "Farwaniya", "Mangaf", "Jiddah", "Abdali",
    "Adailiya", "Bayan", "Jabriya", "Kaifan", "Mahboula", "Messila", "Mina Al-Ahmadi", "Mubarak Al-Kabeer", "Qibla",
    "Riqa", "Sabah Al-Ahmad", "Sahm", "Shamiya", "Shuwaikh", "Sulaibiya", "Surra", "Yahra", "Rawda",
    "Dahya", "Naim", "Faijah", "Isbaitiya", "Jahra", "Kabd", "Qadisiyah", "Salmiya", "Shamiya",
    "Sabriya", "Amghira", "Fardah", "Hala", "Jazira", "Rehmi", "Saad", "Sabah", "Salam",
    "Taqwa", "Wafra", "Waha", "Zoor", "Fahaheel", "Fardah", "Jahra", "Mina Al-Ahmadi",
  ],
  "KG": [
    "Bishkek", "Osh", "Karakol", "Jalal-Abad", "Naryn", "Talas", "Kyzyl-Kiya", "Kant", "Tokmok",
    "Sary-Tash", "At-Bashy", "Kochkor-Ata", "Chuy", "Issyk-Kul", "Batken", "Kara-Suu", "Kara-Kul", "Kochkor",
    "Jumgal", "Kemin", "Kant", "Kyzyl-Kiya", "Kara-Suu", "Balykchy", "Sokuluk", "Kant", "Ak-Suu",
    "Kochkor-Ata", "Ivanovka", "Chon-Kaz", "Kara-Suu", "At-Bashy", "Ak-Muz", "Barskoon", "Kashka-Suu", "Kochkor-Ata",
    "Tokmok", "Kant", "Talas", "Naryn", "Chuy", "Balykchy", "Karakol", "Osh", "Bishkek",
  ],
  "LA": [
    "Vientiane", "Savannakhet", "Pakse", "Luang Prabang", "Thakhek", "Xayaburi", "Muang Xay", "Houayxay", "Luang Namtha",
    "Oudomxay", "Phonsavan", "Salavan", "Attapeu", "Vangvieng", "Pakse", "Muang Khoun", "Champasak", "Xaignabouli",
    "Bokeo City", "Salavan", "Sekong", "Khammouane", "Bolikhamxai", "Xiang Khouang", "Vientiane", "Pakse", "Luang Prabang",
    "Thakhek", "Muang Xay", "Oudomxay", "Phonsavan", "Salavan", "Attapeu", "Houayxay", "Bokeo", "Luang Namtha",
    "Vangvieng", "Saysettha", "Kaysone", "Xepon", "Bak",
  ],
  "LB": [
    "Beirut", "Tripoli", "Sidon", "Tyre", "Zahle", "Jounieh", "Baabda", "Baalbek", "Byblos",
    "Nabatieh", "Bint Jbeil", "Marjayoun", "Deir al-Qamar", "Aley", "Bhamdoun", "Ghazir", "Broummana", "Bsharri",
    "Bikfaya", "Jdeideh", "Falougha", "Ghazir", "Bdadoun", "Qornayel", "Qbaiyat", "Qoubaiyat", "Bchamoun",
    "Britel", "Fenouh", "Bchatai", "Kfarshima", "Zalka", "Adma", "Jounieh", "Bikfaya", "Fadyoun",
    "Haret Hreik", "Dlebta", "Ghazir", "Aley", "Baabda", "Zahle", "Baalbek", "Nabatieh", "Tyre",
    "Sidon", "Tyre", "Byblos", "Jounieh", "Baalbek", "Anjar", "Bint Jbeil", "Nabatieh",
  ],
  "MY": [
    "Kuala Lumpur", "George Town", "Ipoh", "Johor Bahru", "Malacca City", "Kuching", "Shah Alam", "Petaling Jaya", "Seremban",
    "Kota Kinabalu", "Kota Bharu", "Kuantan", "Kulim", "Subang Jaya", "Muar", "Sandakan", "Taiping", "Kajang",
    "Putrajaya", "Klang", "Alor Setar", "Sibu", "Batu Pahat", "Kluang", "Keningau", "Miri", "Kulai",
    "Pasir Gudang", "Sungai Petani", "Kota Marudu", "Kuala Kangsar", "Teluk Intan", "Kluang", "Bentong", "Kuantan", "Tawau",
    "Klang", "Kajang", "Kulim", "Bukit Mertajam", "Ayer Hitam", "Labis", "Kluang", "Segamat", "Tangkak",
    "Gemas", "Kuala Pilah", "Port Dickson", "Cyberjaya", "Putrajaya", "Kota Damansara", "Petaling Jaya", "Shah Alam", "Klang",
    "Kuala Selangor", "Kuala Kubu", "Kuala Lipis", "Jerantut", "Pekan", "Temerloh", "Muar", "Batu Pahat", "Segamat",
  ],
  "MV": [
    "Malé", "Addu", "Fuvahmulah", "Hulhumalé", "Male", "Kudahuvadhoo", "Fadhippolhu", "Thinadhoo", "Rihiveli",
    "Gnafushi", "Hithadhoo", "Kudahuvadhoo", "Fuvahmulah", "Addu", "Hulhumalé", "Biyaadhoo", "Rasdhoo", "Maafannu",
    "Mileddy", "Naindhoo", "Fohdhoo", "Maradhoo", "Feydhoo", "Dhangethi", "Meedhoo", "Kandooma", "Bandhoo",
    "Thilafushi", "Siyamai", "Fushi", "Kollali", "Guraidhoo", "Maafannu", "Male", "Hulhumale", "Addu",
  ],
  "MN": [
    "Ulaanbaatar", "Erdenet", "Darkhan", "Mörön", "Khovd", "Ulaangom", "Tsetserleg", "Sükhbaatar", "Züünbüren",
    "Bulgan", "Khatgal", "Dalanzadgad", "Nalaikh", "Rashaant", "Tavan Tolgoi", "Altanbulag", "Baganuur", "Sharyngol",
    "Umnugovi", "Zuunmod", "Nalaikh", "Zuunbayan", "Bayankhongor", "Khovd", "Mörön", "Bulgan", "Khatgal",
    "Jargalant", "Zuunkhovaa", "Songino Khairkhan", "Niger", "Khanbogd", "Tavan Tolgoi", "Zuunbayan", "Bayan", "Khad",
    "Shabarag", "Modon", "Khovd", "Rashaant", "Tseetsii", "Khustain", "Khalt", "Jargalant", "Khatgal",
    "Tarialan", "Taru", "Kherlenbayan", "Orkhon",
  ],
  "MM": [
    "Yangon", "Mandalay", "Naypyidaw", "Bago", "Pathein", "Mawlamyine", "Monywa", "Sittwe", "Myitkyina",
    "Meiktila", "Taunggyi", "Dawei", "Pyin Oo Lwin", "Hpa-An", "Kengtung", "Kawthaung", "Myeik", "Chauk",
    "Shwebo", "Pyinmana", "Loikaw", "Pakokku", "Tachileik", "Thanbyuzayat", "Thandwe", "Kyaukpyu", "Mrauk U",
    "Bago", "Pyin Oo Lwin", "Thandwe", "Kawthaung", "Myeik", "Dawei", "Mawlamyine", "Kengtung", "Hpa-An",
    "Myitkyina", "Putao", "Mrauk U", "Sittwe", "Kyaukpyu", "Gwa", "Tongwa", "Tantyang", "Kawthaung",
    "Myebon", "Kyaukme", "Htantabin", "Wunna", "Chaungtha", "Kyaukpyu", "Myebon", "Tantyang", "Rangoon",
  ],
  "NP": [
    "Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur", "Birgunj", "Dharan", "Butwal", "Hetauda",
    "Janakpur", "Nepalgunj", "Dhangadhi", "Mahendranagar", "Ilam", "Jomsom", "Besisahar", "Simikot", "Namche Bazaar",
    "Bandipur", "Kushma", "Baglung", "Tansen", "Beni", "Darchula", "Khotang", "Taplejung", "Salleri",
    "Manang", "Gorkha", "Sindhuli", "Okhaldhunga", "Dolakha", "Rasuwa", "Sindhupalchok", "Nuwakot", "Dhading",
    "Kaski", "Parbat", "Syangja", "Myagdi", "Jumla", "Kalikot", "Rukum", "Rolpa", "Pyuthan",
    "Sandhikharka", "Arghakhanchi", "Palpa", "Kapilvastu", "Nawalparasi",
  ],
  "OM": [
    "Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Khasab", "Buraimi", "Ibra", "Rustaq",
    "Barka", "Masirah", "Haima", "Duqm", "Mina Al Fahal", "Madinat Al Irfan", "Al Khuwair", "Al Ghaydah", "Fahud",
    "Misfat Al Abriyeen", "Al Wusta", "Jibrat Al Badi", "Wadi Al Haya", "Quriyat", "Mirbat", "Sadah", "Hasik", "Al Ghaydah",
    "Fahud", "Khasab", "Buraimi", "Ibra", "Adam", "Mahout", "Wadi", "Adam", "Haima",
    "Yibal", "Wobara", "Thumrait", "Hatchet", "Fahud", "Nizwa", "Birkat Al Al", "Misfat", "Muscat",
    "Salalah", "Sur",
  ],
  "PK": [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Peshawar", "Quetta", "Gujranwala", "Hyderabad",
    "Islamabad", "Bahawalpur", "Sargodha", "Sialkot", "Sukkur", "Abbottabad", "Larkana", "Gilgit", "Mardan",
    "Kasur", "Sahiwal", "Okara", "Wah", "Turbat", "Chaman", "Gwadar", "Khuzdar", "Muzaffarabad",
    "Attock", "Kohat", "Dera Ghazi Khan", "Mandi Bahauddin", "Chiniot", "Nowshera", "Jhelum", "Toba Tek Singh", "Rahim Yar Khan",
    "Bannu", "Mardan", "Charsadda", "Mingora", "Nawabshah", "Tando Adam", "Khairpur", "Thatta", "Jacobabad",
    "Sukkur", "Larkana", "Shikarpur", "Dadu", "Jamshoro", "Kotri", "Mirpur Khas", "Badin", "Ghotki",
    "Umerkot", "Tando Allah Khan", "Hala", "Matiari", "Sanghar", "Kashmore", "Kandhkot", "Panjgur", "Turbat",
    "Gwadar", "Pasni", "Ormara", "Lasbela", "Hub",
  ],
  "PS": [
    "Gaza City", "Hebron", "Ramallah", "Nablus", "Jenin", "Bethlehem", "Tulkarm", "Khan Yunis", "Rafah",
    "Deir al-Balah", "Salfit", "Qalqilya", "Jericho", "Yatta", "Bani Naim", "Beit Lahia", "Gaza", "Khan Yunis",
    "Rafah", "Jenin", "Nablus", "Ramallah", "Hebron", "Jerusalem", "Tulkarm", "Qalqilya", "Salfit",
    "Bethlehem", "Jericho", "Beit Jala", "Beit Jibrin", "Al-Khalil", "Al-Quds", "Yasin", "Khan Yunis", "Al-Maghagh",
    "Al-Shati", "Al-Mawasi", "Rafah", "Deir al-Balah", "Al-Dhahiriya", "Bani Zeid", "Salhaya", "Jabalia", "Al-Atar",
  ],
  "PH": [
    "Manila", "Quezon City", "Davao City", "Cebu City", "Zamboanga City", "Angeles", "Taguig", "Pasig", "Caloocan",
    "Bacolod", "Iloilo City", "Cagayan de Oro", "Zamboanga", "Marawi", "Naga", "Ormoc", "Lapu-Lapu", "Mandaue",
    "Dagupan", "Baguio", "Butuan", "Dumaguete", "Calamba", "San Fernando", "Lucena", "Cotabato City", "General Santos",
    "Tarlac City", "Cabanatuan", "Olongapo", "Calapan", "Davao", "Cebu", "Iloilo", "Bacolod", "Cagayan de Oro",
    "Antipolo", "Bacoor", "Meycauayan", "Cabuyao", "Navotas", "Malolos", "San Jose del Monte", "Batangas City", "Lucena",
    "Dasmariñas", "Tagum", "Borongan", "Panabo", "Mati", "Tarlac", "Kidapawan", "Midsayap", "General Tinio",
    "Bayombong", "Carmona", "Mabalacat", "Cabanatuan",
  ],
  "QA": [
    "Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Umm Salal", "Al Daayen", "Mesaieed", "Dukhan", "Al Shamal",
    "Al Shahaniya", "Lusail", "Al Thakhira", "Fuwayrit", "Al Jumayliyah", "Al Karaana", "Al Ruwais", "Mukhaybir", "Doha",
    "Al Wakrah", "Al Khor", "Lusail", "Al Rayyan", "Al Daayen", "Mesaieed", "Al Shamal", "Al Shahaniya", "Dukhan",
    "Umm Salal", "Al Thakhira", "Fuwayrit", "Al Jumayliyah", "Al Karaana", "Al Ruwais", "Mukhaybir", "Al Wukair", "Al Wakrah",
    "Al Khor", "Al Rayyan", "Zekreet", "Rawdat Rashed", "Mesaieed",
  ],
  "SA": [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraydah", "Khobar",
    "Dhahran", "Jizan", "Abha", "Hail", "Najran", "Yanbu", "Unaizah", "Buraidah", "Ar Rass",
    "Wad ad-Dawasir", "Al Bahah", "Zulfi", "Arar", "Sakaka", "Turaif", "Qurayyat", "Rafha", "Al Kharj",
    "Afif", "Al Majma'ah", "Ar Rabigh", "Thuwal", "Umluj", "Duba", "Al-Ula", "Dumat al-Jandal", "Al-Hofuf",
    "Al-Khobar", "Dhahran", "Rabigh", "Qaryat al-Ghaf", "Layla", "Al Qunfudhah", "Sharurah", "Hotat", "Bisha",
    "Turaif", "Tabuk", "Jizan", "Al Bahah", "Baljurashi", "Qunfudhah", "Abha", "Khamis Mushait", "Najran",
    "Jizan",
  ],
  "SG": [
    "Singapore", "Jurong West", "Woodlands", "Tampines", "Bedok", "Sengkang", "Hougang", "Ang Mo Kio", "Yishun",
    "Sembawang", "Bukit Batok", "Bukit Panjang", "Pasir Ris", "Punggol", "Changi", "Toa Payoh", "Queenstown", "Bukit Merah",
    "Clementi", "Bishan", "Marine Parade", "Serangoon", "Choa Chu Kang", "Jalan Kayu", "Mandai", "Lim Chu Kang", "Paya Lebar",
    "Kallang", "Novena", "Orchard", "Little India", "Geylang", "Sentosa", "Pasir Ris", "Bukit Batok", "Bukit Panjang",
    "Clementi", "Tampines", "Bedok", "Hougang", "Sengkang", "Punggol", "Kallang", "Novena", "Marine Parade",
  ],
  "LK": [
    "Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Kurunegala", "Matara", "Anuradhapura", "Ratnapura",
    "Badulla", "Trincomalee", "Batticaloa", "Mannar", "Vavuniya", "Matale", "Ampara", "Kegalle", "Monaragala",
    "Nuwara Eliya", "Polonnaruwa", "Hambantota", "Kalmunai", "Eheliyagoda", "Dambulla", "Mirissa", "Tangalle", "Hikkaduwa",
    "Udawalawe", "Ella", "Yala", "Arugam Bay", "Weligama", "Katunayake", "Sri Jayawardenepura Kotte", "Moratuwa", "Dehiwala",
    "Kotte", "Panadura", "Horana", "Kulalpitiya", "Chilaw", "Mannar", "Vavuniya", "Mullaitivu", "Kilinochchi",
    "Mannar", "Batticaloa", "Ampara", "Monaragala", "Kandy", "Matale", "Nuwara Eliya", "Badulla", "Ginigathena",
    "Talawakele", "Dambulla", "Sigiriya",
  ],
  "SY": [
    "Damascus", "Aleppo", "Homs", "Hama", "Latakia", "Deir ez-Zor", "Raqqa", "Hasakah", "Qamishli",
    "Daraa", "Idlib", "Tartus", "Manbij", "Azaz", "Jabala", "Al-Haffah", "Al-Bukamal", "Quneitra",
    "As-Suwayda", "Bab al-Saghir", "Salqin", "Ayn al-Arus", "Salma", "Baniyas", "Jablah", "Masna", "Talbiseh",
    "Sabkha", "Al-Qunaytirah", "Al-Hasakah", "Amuda", "Ras al-Ayn", "Al-Qamishli", "Amuda", "Al-Qamishli", "Ayn al-Arab",
    "Kobani", "Manbij", "Salamiyah", "Nablus", "Palmyra", "Al-Sukhnah", "Mayadin", "Deir ez-Zor", "Raqqa",
    "Hasakah", "Qamishli", "Tartus", "Latakia", "Hama", "Homs", "Aleppo", "Damascus",
  ],
  "TW": [
    "Taipei", "Kaohsiung", "Taichung", "Tainan", "New Taipei", "Taoyuan", "Hsinchu", "Chiayi", "Changhua",
    "Yilan", "Hualien", "Taitung", "Penghu", "Miaoli", "Nantou", "Yunlin", "Pingtung", "Kinmen",
    "Lienchiang", "Keelung", "Yuanlin", "Douliu", "Fengyuan", "Shalu", "Xiluo", "Wuri", "Luzhou",
    "Renhe", "Zhongli", "Xindian", "Shulin", "Tucheng", "Xizhi", "Sanchong", "Wugu", "Taishan",
    "Linkou", "Jinshan", "Sanhua", "Yingge", "Sanxia", "Zhunan", "Zhubei", "Toufen", "Zhudong",
    "Puzi", "Miaoli City", "Yuanli", "Xiluo", "Luodong", "Yilan City", "Su'ao", "Toucheng", "Jiaoxi",
    "Zhushan", "Miaoli", "Hsinchu County", "Zhubei", "Hsinchu City", "Toufen", "Pukua", "Miaoli", "Yilan",
  ],
  "TJ": [
    "Dushanbe", "Khujand", "Kulob", "Qurghon Tepe", "Hisor", "Farkhor", "Panjakent", "Istaravshan", "Rasht",
    "Shahritus", "Ayni", "Panj", "Khatlon", "Sughd", "Darvoz", "Murghob", "Shahrisabz", "Varzob",
    "Chorku", "Nurabad", "Jarkurgan", "Farkhor", "Kulob", "Qurghon Tepe", "Hisor", "Khujand", "Dushanbe",
    "Panjakent", "Istaravshan", "Rasht", "Ayni", "Shahritus", "Panj", "Khatlon", "Sughd", "Darvoz",
    "Murghob", "Varzob", "Chorku", "Nurabad", "Jarkurgan", "Faizabad", "Kofarnihon", "Yovon", "Shahritus",
    "Rasht", "Farkhor", "Dushanbe", "Khujand",
  ],
  "TH": [
    "Bangkok", "Nonthaburi", "Chiang Mai", "Hat Yai", "Udon Thani", "Pattaya", "Khon Kaen", "Nakhon Ratchasima", "Chiang Rai",
    "Phuket", "Surat Thani", "Nakhon Si Thammarat", "Ubon Ratchathani", "Pak Kret", "Phitsanulok", "Trang", "Rayong", "Chonburi",
    "Nakhon Pathom", "Samut Prakan", "Lamphun", "Yala", "Mae Sot", "Songkhla", "Ratchaburi", "Kanchanaburi", "Phetchaburi",
    "Prachuap Khiri Khan", "Saraburi", "Nakhon Nayok", "Pathum Thani", "Ayutthaya", "Amnat Charoen", "Buriram", "Chaiyaphum", "Kalasin",
    "Maha Sarakham", "Nong Khai", "Sisaket", "Surin", "Udon Thani", "Nong Bua Lamphu", "Lamphun", "Phetchabun", "Phichit",
    "Suphan Buri", "Trang", "Uthai Thani", "Nakhon Phanom", "Loei", "Sukhothai", "Nakhon Sawan",
  ],
  "TL": [
    "Dili", "Baucau", "Suai", "Los Angeles", "Viqueque", "Lautém", "Manatuto", "Liquiçá", "Ataúro",
    "Pante Macassar", "Oecusse", "Lospalos", "Baucau", "Lautém", "Viqueque", "Manatuto", "Vemise", "Lamate",
    "Atabiri", "Metinaro", "Regularidar", "Baturite", "Ziguia", "Cova Lima", "Ermera", "Aileu", "Bobonaro",
    "Ainaro", "Manufahi", "Atabrau", "Turiscai", "Baucau", "Lautém", "Viqueque", "Manatuto", "Baucau",
    "Dili", "Suai", "Manatuto", "Atabiri", "Baturite", "Lamate", "Regularidar", "Metinaro", "Lospalos",
    "Baucau", "Lautém", "Oecusse", "Lospalos", "Suai", "Manatuto", "Viqueque", "Atabrau",
  ],
  "TR": [
    "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin",
    "Kayseri", "Eskisehir", "Samsun", "Denizli", "Sanliurfa", "Malatya", "Erzurum", "Diyarbakir", "Sivas",
    "Van", "Batman", "Elazig", "Kahramanmaras", "Trabzon", "Aksaray", "Balikesir", "Manisa", "Osmaniye",
    "Ordu", "Rize", "Tokat", "Corum", "Kastamonu", "Kocaeli", "Isparta", "Afyonkarahisar", "Mugla",
    "Hatay", "Kilis", "Karaman", "Nevsehir", "Bingol", "Sinop", "Amasya", "Edirne", "Kirsehir",
    "Yozgat", "Karabuk", "Mardin", "Siirt", "Bitlis", "Mus", "Kars", "Igdir", "Adiyaman",
    "Giresun", "Zonguldak", "Bolu", "Duzce", "Bartin", "Yalova", "Canakkale", "Cankiri", "Kirikkale",
    "Gumusane", "Erzincan", "Ardahan", "Kirsehir", "Sakarya", "Kirsehir", "Tokat", "Ordu", "Amasya",
    "Sinop", "Bayburt", "Kutahya",
  ],
  "TM": [
    "Ashgabat", "Turkmenabat", "Mary", "Balkanabat", "Dashoguz", "Seýen", "Ahal", "Lebap", "Tejen",
    "Gyzylarbat", "Mary", "Kunya-Urgench", "Aşgabat", "Balkan", "Türkmenabat", "Ahal", "Köýtendag", "Gyzylarbat",
    "Tejen", "Seýen", "Gabar", "Bereket", "Garaşor", "Ataşehir", "Gyzylorda", "Türkmenbaşy", "Port",
    "Hazar", "Durný", "Garaşor", "Sayat", "Yolöten", "Gyzylarbat", "Gyzylarbat", "Türkmenabat", "Mary",
    "Balkanabat", "Dashoguz", "Aşgabat", "Ahal", "Lebap", "Tejen", "Seýen",
  ],
  "AE": [
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan",
    "Dibba Al-Fujairah", "Zayed City", "Masaf", "Dubai Internet City", "Jebel Ali", "Mafraq", "Madinat Zayed", "Liwa", "Ghayathi",
    "Dhaid", "Hatta", "Mleiha", "Delma", "Al Wathba", "Ruwaida", "Jebel Hafeet", "Falaj Al Mualla", "Dhaid",
    "Swatah", "Dibba", "Dibba Al-Fujairah", "Al Bithnah", "Khor Fakkan", "Kalba", "Masafi", "Manama", "Jebel Ali",
    "Mleiha", "Madinat Zayed", "Liwa", "Ghayathi", "Mirbah", "Saduq", "Tawi Al", "Al Ain", "Zayed City",
    "Nahyan", "Al Yahar", "Al Tiya", "Al Wathba", "Al Rahba", "Mafraq",
  ],
  "UZ": [
    "Tashkent", "Samarkand", "Namangan", "Andijan", "Nukus", "Bukhara", "Fergana", "Qarshi", "Kokand",
    "Margilan", "Urgench", "Jizzakh", "Termez", "Guliston", "Navoiy", "Zarafshon", "Chirchiq", "Yangiyer",
    "Xiva", "Bekobod", "Denov", "Zomin", "Gurlan", "Shovot", "Chust", "Rishton", "Quva",
    "Beshariq", "Yangiabad", "Shahrisabz", "Kitab", "Karshi", "Koson", "Qarshi", "Shahrisabz", "Kitab",
    "Boysun", "Guzar", "Sherobod", "Panjakent", "Denov", "Jizzakh", "Zomin", "Sharof Rashidov", "Guliston",
    "Yangiyer", "Xiva", "Nukus", "Xonqa", "Chimboy", "Beruniy", "Termez", "Sherakhan", "Boysun",
    "Qumqo'rg'on",
  ],
  "VN": [
    "Ho Chi Minh City", "Hanoi", "Hai Phong", "Da Nang", "Can Tho", "Bien Hoa", "Nha Trang", "Hue", "Vung Tau",
    "Buon Ma Thuot", "Quy Nhon", "Thai Nguyen", "Nam Dinh", "Vinh", "Ha Long", "Ca Mau", "Rach Gia", "Long Xuyen",
    "Thanh Hoa", "Mong Cai", "Cam Pha", "Da Lat", "Dong Hoi", "Sa Pa", "Lao Cai", "Bai Chay", "Dien Bien Phu",
    "Lào Cai", "Ninh Binh", "Tam Ky", "Vinh Hy", "Phan Thiet", "Da Nang", "Quang Ngai", "Hoi An", "Tay Ninh",
    "Binh Duong", "Dong Nai", "Can Tho", "Vung Tau", "Rach Gia", "Ca Mau", "Bac Ninh", "Thanh Hoa", "Nghe An",
    "Ha Tinh", "Quang Binh", "Quang Tri", "Quang Ngai",
  ],
  "YE": [
    "Sanaa", "Aden", "Taiz", "Hodeidah", "Ibb", "Mukalla", "Dhamar", "Saada", "Amran",
    "Zabid", "Marib", "Raydah", "Bajil", "Rada", "Thamud", "Shibam", "Tarim", "Al Ghaydah",
    "Al Mahwit", "Al Bayda", "Abyan", "Lahij", "Al Dhale'e", "Al Maharah", "Soqotra", "Khamir", "Niha",
    "Al Jawf", "Al Mahrah", "Hadhramaut", "Dhamar", "Aden", "Sanaa", "Hodeidah", "Taiz", "Ibb",
    "Amran", "Saada", "Hajjah", "Al Bayda", "Marib", "Zabid", "Al Ghaydah", "Mukalla", "Raydah",
    "Bajil", "Rada", "Borma", "Mayfadum", "Al Mukha",
  ],
  // ===== EUROPE =====
  "AD": [
    "Andorra la Vella", "Escaldes-Engordany", "Encamp", "La Massana", "Ordino", "Sant Julià de Lòria", "Andorra la Vella", "Escaldes-Engordany", "Encamp",
    "La Massana", "Ordino", "Sant Julià de Lòria", "Canillo", "Anyós", "Soldeu", "El Tarter", "Arinsal", "Pal",
    "Ransol", "Gravellars", "Auvinyà", "Certers", "Os", "Aós de Civís", "Ars", "Anyós", "Sant Julià de Lòria",
    "Escaldes-Engordany", "La Massana", "Encamp", "Ordino", "Andorra la Vella", "Sant Pere", "Juberri", "Ricolís", "Santa Coloma",
    "Bixessarri",
  ],
  "AL": [
    "Tirana", "Durrës", "Vlora", "Elbasan", "Shkodër", "Fier", "Korçë", "Berat", "Lushnjë",
    "Kavajë", "Pogradec", "Tepelenë", "Bajram Curri", "Sarandë", "Përmet", "Krujë", "Kukës", "Dibër",
    "Bulqizë", "Peshkopi", "Gjirokastër", "Librazhd", "Lezhë", "Mallakastër", "Rrëshqit", "Qarkë", "Sauke",
    "Voskopojë", "Devoll", "Kelmend", "Gramsh", "Lac", "Maliq", "Orikum", "Himara", "Kelbas",
    "Kavaja", "Vlorë", "Berat", "Pogradec", "Voskopoja", "Klos", "Libohovë", "Përmet", "Korçë",
    "Peshkopi", "Bajram Curri", "Bulqizë", "Krujë", "Kavajë", "Shkodër", "Fier", "Elbasan", "Tirana",
    "Durrës",
  ],
  "AT": [
    "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Sankt Pölten",
    "Dornbirn", "Steyr", "Wiener Neustadt", "Bregenz", "Eisenstadt", "Krems", "Baden", "Wolfsberg", "Kufstein",
    "Traun", "Amstetten", "Mödling", "Kitzbühel", "Döbling", "Bruck an der Mur", "Leoben", "Kapfenberg", "Baden",
    "Schärding", "Zell am See", "Sankt Johann", "Schwarzach", "Bludenz", "Hohenems", "Dornbirn", "Feldkirch", "Rankweil",
    "Wiener Neustadt", "Neunkirchen", "Schwechat", "Korneuburg", "Stockerau", "Wolkersdorf", "Baden", "Perchtoldsdorf", "Tulln",
    "Marchtrenk", "Wels", "Steyr", "Leonding", "Traun", "Enns", "Ried", "Braunau", "Schärding",
    "Eisenstadt", "Rust", "Oberwart", "Güssing",
  ],
  "AX": [
    "Mariehamn", "Jomala", "Lemland", "Lumparland", "Föglö", "Vårdö", "Sottunga", "Kumlinge", "Kökar",
    "Brändö", "Eckerö", "Hammarland", "Saltvik", "Finström", "Geta", "Helsinki", "Mariehamn", "Jomala",
    "Lemland", "Föglö", "Vårdö", "Sottunga", "Kumlinge", "Kökar",
  ],
  "BA": [
    "Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bihać", "Bijeljina", "Brčko", "Livno",
    "Gradiška", "Visoko", "Cazin", "Bugojno", "Konjic", "Jajce", "Goražde", "Foča", "Višegrad",
    "Doboj", "Srebrenica", "Zvornik", "Trebinje", "Posušje", "Široki Brijeg", "Kiseljak", "Novi Travnik", "Vlasenica",
    "Rogatica", "Sanski Most", "Kozarska Dubica", "Laktaši", "Mrkonjić Grad", "Šipovo", "Prijedor", "Orašje", "Breze",
    "Odžak", "Kotor Varoš", "Teslić", "Grude", "Ljubuški", "Kladanj", "Fojnica", "Vareš", "Kreševo",
    "Olovo", "Breza", "Srebrenik", "Žepče", "Tuzlanska", "Tuzla", "Bihać", "Sanski Most", "Novi Travnik",
  ],
  "BE": [
    "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven", "Mons",
    "Aalst", "Mechelen", "La Louvière", "Kortrijk", "Ostend", "Hasselt", "Sint-Niklaas", "Oudenaarde", "Tournai",
    "Genk", "Seraing", "Roeselare", "Verviers", "Beveren", "Dendermonde", "Beringen", "Turnhout", "Dilbeek",
    "Heist-op-den-Berg", "Lokeren", "Brakel", "Waregem", "Châtelet", "Jodoigne", "Arlon", "Saint-Nicolas", "Eupen",
    "Neupré", "Ixelles", "Uccle", "Schaerbeek", "Anderlecht", "Etterbeek", "Woluwe-Saint-Pierre", "Saint-Gilles", "Woluwe-Saint-Lambert",
    "Koekelberg", "Jette", "Ganshoren", "Berchem-Sainte-Agathe", "Grapfontaine", "Andenne", "Marche-en-Famenne", "Ciney", "Durbuy",
    "Dinant", "Namur", "Huy",
  ],
  "BG": [
    "Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich",
    "Shumen", "Pernik", "Haskovo", "Yambol", "Pazardzhik", "Blagoevgrad", "Veliko Tarnovo", "Vratsa", "Gabrovo",
    "Asenovgrad", "Vidin", "Kazanlak", "Kyustendil", "Kardzhali", "Montana", "Dimitrovgrad", "Targovishte", "Silistra",
    "Gorna Oryahovitsa", "Petrich", "Sandanski", "Gotse Delchev", "Samokov", "Kozloduy", "Svishtov", "Tutrakan", "Sungurlare",
    "Isperih", "Kubrat", "Suvorovo", "Novi Pazar", "Razgrad", "Balchik", "Smolyan", "Lukovit", "Pomorie",
    "Nesebar", "Sozopol", "Balyovets", "Elena", "Tryavna", "Koprivshtitsa", "Melnik", "Teteven", "Velingrad",
    "Razlog", "Pirdop", "Panagyurishte", "Kotel", "Gurkovo", "Karnobat", "Aytos",
  ],
  "BY": [
    "Minsk", "Gomel", "Grodno", "Brest", "Vitebsk", "Mogilev", "Bobruisk", "Baranovichi", "Pinsk",
    "Orsha", "Borisov", "Slutsk", "Novogrudok", "Polotsk", "Bereza", "Dzyarzhynsk", "Lepel", "Bykhaw",
    "Krupki", "Asipovichy", "Klimavichy", "Svislach", "Turov", "Rechytsa", "Narovlya", "Klichev", "Oktyabrsk",
    "Zhlobin", "Kostyukovichy", "Ivanava", "Slonim", "Lida", "Belozersk", "Yubileyny", "Zhabino", "Mstsislaw",
    "Krychaw", "Shchuchin", "Korostysh", "Navahrudak", "Drahichyn", "Lyepyel", "Braslaw", "Talash", "Ruzhany",
    "Pinsk", "Turov",
  ],
  "CH": [
    "Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne", "Biel", "Lugano",
    "Thun", "St. Gallen", "Fribourg", "Schaffhausen", "Chur", "Vaduz", "Sion", "Neuchâtel", "Uster",
    "Zug", "Rapperswil", "Dübendorf", "Dietikon", "Montreux", "Frauenfeld", "Wettingen", "Bellinzona", "Kreuzlingen",
    "Yverdon", "Olten", "Solothurn", "Herisau", "Lyss", "Bulle", "Einsiedeln", "Glarus", "Liestal",
    "Wohlen", "Gossau", "Wil", "Bülach", "Wädenswil", "Münsterlingen", "Rheinfelden", "Binningen", "Muri",
    "Allschwil", "Bassersdorf", "Renens", "Pratteln", "Pully", "Carouge", "Onex", "Meyrin", "Grand-Saconnex",
    "Versoix", "Bernex", "Thônex", "Collonge-Bellerive", "Plan-les-Ouates", "Kloten", "Regensdorf", "Opfikon",
  ],
  "CY": [
    "Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Kyrenia", "Paralimni", "Morphou", "Ypsonas",
    "Aradippou", "Ayia Napa", "Dali", "Lefkara", "Pissouri", "Polis Chrysochous", "Peyia", "Geroskipou", "Kissonerga",
    "Athienou", "Lakatamia", "Mesa Geitonia", "Agios Athanasios", "Dromolaxia", "Livadia", "Kato Pyrgos", "Pervolia", "Deryneia",
    "Sotira", "Episkopi", "Geroskipou", "Athienou", "Lakatamia", "Mesa Geitonia", "Agios Athanasios", "Dromolaxia", "Livadia",
    "Kato Pyrgos", "Pervolia", "Deryneia", "Sotira", "Polis", "Larnaca", "Lakatamia",
  ],
  "CZ": [
    "Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem", "České Budějovice", "Hradec Králové",
    "Pardubice", "Zlín", "Havířov", "Kladno", "Most", "Opava", "Frýdek-Místek", "Karviná", "Jihlava",
    "Teplice", "Děčín", "Chomutov", "Karlovy Vary", "Jablonec nad Nisou", "Mladá Boleslav", "Prostějov", "Přerov", "Česká Lípa",
    "Třebíč", "Třinec", "Tábor", "Znojmo", "Kolín", "Příbram", "Cheb", "Trutnov", "Český Krumlov",
    "Mariánské Lázně", "Františkovy Lázně", "Luhačovice", "Benešov", "Domažlice", "Písek", "Žatec", "Klatovy", "Cheb",
    "Prachatice", "Hranice", "Nový Jičín", "Vsetín", "Břeclav", "Hodonín", "Boskovice", "Vyškov", "Kroměříž",
    "Šumperk", "Krnov", "Šternberk", "Mikulov",
  ],
  "DE": [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund",
    "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
    "Bonn", "Münster", "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden", "Mönchengladbach", "Gelsenkirchen", "Aachen",
    "Braunschweig", "Kiel", "Chemnitz", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Mainz", "Lübeck",
    "Erfurt", "Oberhausen", "Rostock", "Kassel", "Hagen", "Potsdam", "Saarbrücken", "Hamm", "Ludwigsburg",
    "Oldenburg", "Osnabrück", "Leverkusen", "Heidelberg", "Darmstadt", "Paderborn", "Regensburg", "Ingolstadt", "Würzburg",
    "Fürth", "Wolfsburg", "Ulm", "Heilbronn", "Pforzheim", "Offenbach", "Tübingen", "Cottbus", "Trier",
    "Reutlingen", "Koblenz", "Jena", "Moers", "Solingen", "Erlangen", "Hildesheim", "Salzgitter", "Gera",
    "Kassel", "Zwickau", "Würzburg", "Fulda", "Flensburg",
  ],
  "DK": [
    "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle",
    "Roskilde", "Helsingør", "Silkeborg", "Næstved", "Fredericia", "Viborg", "Slagelse", "Hillerød", "Sønderborg",
    "Svendborg", "Hjørring", "Frederikshavn", "Holbæk", "Taastrup", "Ishøj", "Ringe", "Hedensted", "Skive",
    "Nykøbing Falster", "Aabenraa", "Herning", "Ringkøbing", "Thisted", "Varde", "Skagen", "Nykøbing Sjælland", "Faaborg",
    "Kerteminde", "Hadsund", "Brønderslev", "Faxe", "Nyborg", "Assens", "Ribe", "Kolding", "Skanderborg",
    "Hobro", "Frederiksværk", "Helsingør", "Gilleleje", "Ebeltoft", "Samsø", "Grenaa",
  ],
  "EE": [
    "Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Maardu", "Kuressaare",
    "Võru", "Valga", "Haapsalu", "Jõhvi", "Keila", "Tapa", "Saue", "Sillamäe", "Türi",
    "Kiviõli", "Rapla", "Polva", "Järva", "Võhma", "Paldiski", "Kärdla", "Loksa", "Võhma",
    "Kiviõli", "Sillamäe", "Narva-Jõesuu", "Otepää", "Võru", "Elva", "Kuressaare", "Saue", "Keila",
    "Haapsalu", "Tabasaare", "Tapa", "Viljandi", "Pärnu", "Rakvere", "Tartu", "Tallinn", "Narva",
    "Maardu", "Kiviõli", "Kohtla-Järve", "Võru", "Valga",
  ],
  "FI": [
    "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Kuopio", "Lahti",
    "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Hämeenlinna", "Vaasa", "Rovaniemi", "Mikkeli", "Savonlinna",
    "Kotka", "Salo", "Porvoo", "Hyvinkää", "Kajaani", "Järvenpää", "Varkaus", "Rauma", "Riihimäki",
    "Lohja", "Kemi", "Tornio", "Sodankylä", "Enontekiö", "Inari", "Pudasjärvi", "Ilves", "Kokkola",
    "Harjavalta", "Joutsa", "Mänttä", "Nurmes", "Kitee", "Loviisa", "Karkkila", "Vihti", "Kauniainen",
    "Siilinjärvi", "Mäntsälä", "Laukaa", "Keuruu", "Iisalmi", "Ähtäri", "Alavieska", "Jokioinen", "Tuusula",
    "Käpylä", "Eura",
  ],
  "FO": [
    "Tórshavn", "Hafnarfjörður", "Klaksvík", "Tvøroyri", "Runavík", "Argir", "Sandur", "Vágur", "Fuglafjørður",
    "Tvøroyri", "Skálafjørður", "Strendur", "Runavík", "Toftir", "Hoyvík", "Velbastaður", "Hósvík", "Tórshavn",
    "Norðragøta", "Gøta", "Oyndarfjørður", "Kollafjørður", "Sørvágur", "Eiði", "Fólgar", "Skálið", "Fámjin",
    "Røð í Føroyum",
  ],
  "FR": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux",
    "Lille", "Rennes", "Reims", "Saint-Étienne", "Toulon", "Le Havre", "Grenoble", "Dijon", "Angers",
    "Nîmes", "Villeurbanne", "Clermont-Ferrand", "Aix-en-Provence", "Brest", "Tours", "Amiens", "Limoges", "Annecy",
    "Perpignan", "Metz", "Besançon", "Orléans", "Rouen", "Mulhouse", "Caen", "Nancy", "Argenteuil",
    "Montreuil", "Saint-Denis", "Roubaix", "Lorient", "Dunkerque", "Avignon", "Pau", "Bayonne", "Béziers",
    "La Rochelle", "Calais", "Cannes", "Ajaccio", "Poitiers", "Versailles", "Vichy", "Évreux", "Roanne",
    "Bourges", "Niort", "Cognac", "Chaumont", "Auxerre", "Saint-Sébastien", "Biarritz", "Sète", "Draguignan",
    "Antibes", "Cagnes-sur-Mer", "Haguenau", "Albi", "Carcassonne", "Castres", "Narbonne", "Auch", "Millau",
    "Mende", "Foix", "Périgueux", "Bergerac", "Angoulême", "Châteauroux",
  ],
  "GB": [
    "London", "Birmingham", "Manchester", "Glasgow", "Leeds", "Sheffield", "Liverpool", "Bristol", "Newcastle upon Tyne",
    "Nottingham", "Leicester", "Bradford", "York", "Edinburgh", "Cardiff", "Belfast", "Southampton", "Portsmouth",
    "Coventry", "Reading", "Derby", "Plymouth", "Norwich", "Exeter", "Swansea", "Aberdeen", "Dundee",
    "Greenwich", "Brighton", "Milton Keynes", "Luton", "Wolverhampton", "Hull", "Stoke-on-Trent", "Middlesbrough", "Chester",
    "Lincoln", "Rochdale", "Bolton", "Salford", "Darlington", "Hartlepool", "Blackpool", "Huddersfield", "Oldham",
    "Warrington", "Grimsby", "Basildon", "Bury", "Watford", "Chelmsford", "Stevenage", "Loughborough", "Colchester",
    "Maidstone", "Ashford", "Basingstoke", "Aylesbury", "Bedford", "St Albans", "Wigan", "Crewe", "Stockport",
    "Birkenhead", "Redditch", "Halesowen", "Tamworth", "Kettering", "Corby", "Rugby", "Banbury", "Cheltenham",
    "Gloucester", "Swindon", "Inverness", "Cornwall", "Cambridge", "Nelson", "Bath",
  ],
  "GG": [
    "Saint Peter Port", "Saint Sampson", "Saint Martin", "Saint Andrew", "Vale", "Torteval", "Saint Pierre du Bois", "Saint Saviour", "Saint John",
    "Saint James", "Saint Mary", "Saint Brelade", "Saint Pierre", "Sark", "Herm", "Jethou", "Brecqhou", "Lihou",
  ],
  "GR": [
    "Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina", "Chania", "Kavala",
    "Katerini", "Kalamata", "Rhodes", "Chalkida", "Serres", "Alexandroupoli", "Xanthi", "Komotini", "Drama",
    "Veria", "Kozani", "Rethymno", "Agrinio", "Karditsa", "Corfu", "Tripoli", "Sparta", "Mykonos",
    "Santorini", "Delphi", "Argostoli", "Corinth", "Methoni", "Pyrgos", "Kastoria", "Florina", "Kilkis",
    "Grevena", "Preveza", "Arta", "Amfilochia", "Messolonghi", "Nafpaktos", "Skiathos", "Skopelos", "Alonissos",
    "Kea", "Kythnos", "Serifos", "Sifnos", "Ios", "Folegandros", "Anafi", "Amorgos", "Patmos",
    "Leros", "Kalymnos", "Kos", "Symi", "Halki", "Agathonisi", "Megisti", "Kastellorizo", "Tilos",
    "Nisyros", "Ermoupoli",
  ],
  "HR": [
    "Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Pula", "Varaždin", "Vukovar", "Vinkovci",
    "Šibenik", "Dubrovnik", "Bjelovar", "Karlovac", "Sisak", "Samobor", "Gospić", "Požega", "Trogir",
    "Makarska", "Opatija", "Rovinj", "Krapina", "Đakovo", "Slavonski Brod", "Virovitica", "Koprivnica", "Nova Gradiška",
    "Senj", "Knin", "Ilok", "Metković", "Buzet", "Labin", "Umag", "Novalja", "Krk",
    "Cres", "Mali Lošinj", "Biograd na Moru", "Skradin", "Omiš", "Supetar", "Vis", "Lastovo", "Mljet",
    "Makar", "Korčula", "Hvar", "Orebić", "Cavtat", "Biograd", "Novigrad", "Motovun", "Grožnjan",
    "Delnice",
  ],
  "HU": [
    "Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár",
    "Szombathely", "Szolnok", "Tatabánya", "Kaposvár", "Békéscsaba", "Érd", "Veszprém", "Sopron", "Zalaegerszeg",
    "Eger", "Nagykanizsa", "Dunaújváros", "Hódmezővásárhely", "Salgótarján", "Cegléd", "Baja", "Ózd", "Vác",
    "Mosonmagyaróvár", "Gyula", "Jászberény", "Gödöllő", "Szentes", "Pápa", "Kiskunfélegyháza", "Kiskunhalas", "Hatvan",
    "Kőszeg", "Sárvár", "Nagykőrös", "Makó", "Gyöngyös", "Tiszafüred", "Komárom", "Berettyóújfalu", "Békés",
    "Mátészalka", "Sátoraljaújhely", "Paks", "Szekszárd", "Szigetvár", "Hajdúböszörmény", "Mezőtúr", "Mezőkövesd", "Kemence",
    "Balassagyarmat",
  ],
  "IE": [
    "Dublin", "Cork", "Galway", "Limerick", "Waterford", "Sligo", "Drogheda", "Dundalk", "Bray",
    "Navan", "Kilkenny", "Tralee", "Carlow", "Wexford", "Ennis", "Tullamore", "Killarney", "Athlone",
    "Letterkenny", "Newry", "Midleton", "Portlaoise", "Mullingar", "Ballina", "Ballymun", "Swords", "Greystones",
    "Shannon", "Maynooth", "Donegal", "Westport", "Clonmel", "Roscommon", "Athenry", "Birr", "Trim",
    "Ardee", "Boyle", "Bantry", "Clifden", "Listowel", "Kenmare", "Dingle", "Tipperary", "Thurles",
    "Nenagh", "Templemore", "Ballybofey", "Ballyshannon", "Cavan", "Monaghan", "Trim", "Naas", "Tullamore",
    "Kilkenny", "Wexford",
  ],
  "IM": [
    "Douglas", "Ramsey", "Peel", "Castletown", "Port Erin", "Port St Mary", "Kirk Michael", "Kirkmichael", "Andreas",
    "Jurby", "Maidens", "Cregneash", "Ronaldsway", "Santon", "Ballasalla", "Foxall", "Ballabeg", "Glen Maye",
    "Greeba", "Marown", "Onchan", "St Mark",
  ],
  "IS": [
    "Reykjavík", "Kópavogur", "Hafnarfjörður", "Akureyri", "Reykjanesbær", "Keflavík", "Selfoss", "Vestmannaeyjar", "Höfn",
    "Egilsstaðir", "Sauðárkrókur", "Borgarnes", "Neskaupstaður", "Hella", "Blönduós", "Stykkishólmur", "Sandgerði", "Garður",
    "Mosfellsbær", "Grindavík", "Hvolsvöllur", "Dalvík", "Ísafjörður", "Bíldudalur", "Fáskrúðsfjörður", "Húsavík", "Kirkjubæjarklaustur",
    "Raufarhöfn", "Hornafjörður", "Djúpivogur", "Breiðdalsvík", "Berufjörður", "Seyðisfjörður", "Borgarfjörður eystri", "Stokkseyri", "Þorlákshöfn",
    "Höfn", "Egilsstaðir", "Fáskrúðsfjörður", "Hellissandur", "Hvolsvöllur", "Selfoss",
  ],
  "IT": [
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari",
    "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste", "Taranto", "Brescia", "Prato",
    "Parma", "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia",
    "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Monza", "Siracusa", "Pescara", "Pisa",
    "Lucca", "Ancona", "Vercelli", "Arezzo", "Lecce", "Lamezia Terme", "Avellino", "Barletta", "Trapani",
    "Terni", "Udine", "Como", "Ragusa", "Marsala", "Treviso", "Varese", "Busto Arsizio", "Piacenza",
    "Bolzano", "Novara", "Cosenza", "La Spezia", "Bergamo", "Pozzuoli", "Cremona", "Lodi", "Brindisi",
    "Pisa",
  ],
  "JE": [
    "Saint Helier", "Saint Lawrence", "Saint Peter", "Saint Brelade", "Saint Saviour", "Saint Mary", "Saint John", "Grouville", "Gorey",
    "Helier", "Sarkville", "Victoria Village",
  ],
  "LI": [
    "Vaduz", "Schaan", "Balzers", "Triesen", "Triesenberg", "Eschen", "Mauren", "Gamprin", "Ruggell",
    "Schellenberg", "Planken", "Nendeln", "Mühleholz", "Bendern", "Ruggell", "Balzers", "Schaan", "Vaduz",
    "Triesenberg", "Triesen", "Gamprin", "Mauren", "Eschen", "Planken", "Schellenberg", "Bendern", "Nendeln",
    "Mühleholz", "Ruggell", "Schaan",
  ],
  "LT": [
    "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai", "Jonava",
    "Utena", "Kėdainiai", "Tauragė", "Telšiai", "Ukmergė", "Visaginas", "Kuršėnai", "Druskininkai", "Radviliškis",
    "Elektrėnai", "Jurbarkas", "Rokiškis", "Šalčininkai", "Biržai", "Gargždai", "Pasvalys", "Kupiškis", "Trakai",
    "Molėtai", "Lentvaris", "Pagėgiai", "Skuodas", "Šilutė", "Šilalė", "Naujoji Akmenė", "Kazlų Rūda", "Nemenčinė",
    "Širvintos", "Kalvarija", "Kybartai", "Rietavas", "Pilviškis", "Vilkaviškis", "Prienai", "Akmenė", "Daugai",
    "Dusetos", "Utena", "Zarasai", "Ignalina",
  ],
  "LU": [
    "Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck", "Vianden", "Echternach", "Grevenmacher", "Remich",
    "Schengen", "Wiltz", "Clervaux", "Mersch", "Redange", "Hesperange", "Berchem", "Strassen", "Pétange",
    "Dudelange", "Lentropy", "Sandweiler", "Colmar-Berg", "Consdorf", "Lorentzweiler", "Mompach", "Bech", "Bourscheid",
    "Roeser", "Weiswampach", "Waldbillig", "Saeul", "Kehlen", "Koerich", "Rosport", "Remich",
  ],
  "LV": [
    "Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Rēzekne", "Ventspils", "Valmiera", "Cēsis",
    "Jāņpiebalga", "Ogre", "Kuldīga", "Talsi", "Balvi", "Alūksne", "Dobele", "Līvāni", "Bauska",
    "Viļāni", "Salacgrīva", "Mārupe", "Olaine", "Smiltene", "Ludza", "Ilūkste", "Kandava", "Baldone",
    "Skrīveri", "Aizkraukle", "Aizpute", "Krasnobród", "Jāņpiebalga", "Ventspils", "Kuldīga", "Talsi", "Salacgrīva",
    "Sigulda", "Cēsis", "Valmiera", "Ogre", "Balvi", "Alūksne", "Dobele", "Krāslava", "Rēzekne",
    "Riga",
  ],
  "MC": [
    "Monaco", "Monte Carlo", "Fontvieille", "La Condamine", "Moneghetti", "Larvotto", "Sainte-Dévote", "Mougins", "Roquebrune-Cap-Martin",
    "Beausoleil", "La Turbie", "Bordighera", "Ventimiglia", "Monaco", "Monte-Carlo", "La Condamine", "Fontvieille", "Moneghetti",
    "Larvotto", "Monaco-Ville", "Sainte-Dévote", "Jardin Exotique", "Roquebrune", "Cap d'Ail", "Gazagnello", "Bellarena",
  ],
  "MD": [
    "Chișinău", "Bălți", "Tiraspol", "Bender", "Orhei", "Soroca", "Strășeni", "Căușeni", "Cahul",
    "Cimișlia", "Hîncești", "Sîngerei", "Ceadîr-Lunga", "Edineț", "Drochia", "Rezina", "Dubăsari", "Rîbnița",
    "Anenii Noi", "Dnestrovsc", "Comrat", "Vatra", "Cricova", "Durlești", "Mărculești", "Sulina", "Tiraspol",
    "Ocnita", "Dondușeni", "Briceni", "Nisporeni", "Leova", "Cahul", "Taraclia", "Ceadîr-Lunga", "Gura Bîcului",
    "Hîncești", "Cimișlia", "Ialoveni",
  ],
  "ME": [
    "Podgorica", "Nikšić", "Pljevlja", "Cetinje", "Bar", "Kolašin", "Budva", "Herceg Novi", "Tivat",
    "Ulcinj", "Kotor", "Danilovgrad", "Bijelo Polje", "Mojkovac", "Žabljak", "Plužine", "Šavnik", "Rožaje",
    "Berane", "Andrijevica", "Gusinje", "Plav", "Petnjica", "Luštica", "Mrinje", "Štrpce", "Dragana",
    "Kamenari", "Pržno", "Petrovići", "Velika Plaža", "Sušanj", "Budva", "Bar", "Ulcinj", "Kotor",
    "Tivat", "Herceg Novi", "Podgorica", "Nikšić", "Cetinje", "Danilovgrad", "Podgorica", "Cetinje", "Nikšić",
    "Bijelo Polje", "Pljevlja",
  ],
  "MK": [
    "Skopje", "Bitola", "Kumanovo", "Prilep", "Veles", "Tetovo", "Štip", "Strumica", "Kičevo",
    "Ohrid", "Gostivar", "Kočani", "Kavadarci", "Negotino", "Gevgelija", "Berovo", "Radoviš", "Kriva Palanka",
    "Struga", "Debar", "Kruševo", "Vinica", "Makedonski Brod", "Demir Kapija", "Bogdanci", "Sveti Nikole", "Valandovo",
    "Mogila", "Kratovo", "Lozovo", "Rosoman", "Star Dojran", "Dojran", "Novaci", "Vrapčište", "Bogomila",
    "Gradsko", "Demir Hisar", "Aracinovo", "Sopishte", "Zelenikovo", "Petrovec", "Zletovo", "Studencani", "Cucer-Sandevo",
    "Kovacevtsi", "Dolneni", "Star Dojran", "Veles", "Bogomila", "Lozovo", "Gradsko",
  ],
  "MT": [
    "Valletta", "Birkirkara", "Sliema", "Mosta", "Qormi", "Żejtun", "Rabat", "Mellieħa", "Ħamrun",
    "Birgu", "Naxxar", "Għaxaq", "Għarb", "Għasri", "Qawra", "Mġarr", "Għajnsielem", "Ta' Qali",
    "Żebbuġ", "Marsaxlokk", "Xagħra", "Kalkara", "Xewkija", "Ta' Ħalq", "Khamarka", "Mtaħleb", "Qbali",
    "Wied Fulija", "Tarxien", "Marsa", "Gudja", "Kercem", "Ħal Balzan", "San Ġwann", "Lija", "Attard",
    "Santa Venera", "Swieqi", "Pembroke", "Dingli", "Siġġiewi", "Msida", "Floriana", "Vittoriosa", "Senglea",
    "Cospicua", "Żabbar", "Għasri", "Qrendija", "San Pawl il-Baħar", "Wied il-Għajn", "Għajn Ħadid", "Bur Marsa",
  ],
  "NL": [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda",
    "Nijmegen", "Enschede", "Haarlem", "Apeldoorn", "Arnhem", "Zwolle", "Maastricht", "Dordrecht", "Leiden",
    "Delft", "Heerlen", "Sittard", "Venlo", "Leeuwarden", "Emmen", "Hilversum", "Alphen aan den Rijn", "Hoofddorp",
    "Velsen", "Zaandam", "Hengelo", "Roermond", "Helmond", "Amstelveen", "Hardenberg", "Goes", "Terneuzen",
    "Bergen op Zoom", "Zeist", "Purmerend", "Deventer", "Sittard", "Heerhugowaard", "Houten", "Wageningen", "Doetinchem",
    "Kerkrade", "Venray", "Hoorn", "Kudel", "Oss", "Capelle aan den IJssel",
  ],
  "NO": [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Tromsø", "Sandnes",
    "Bodø", "Arendal", "Hamar", "Moss", "Ålesund", "Halden", "Larvik", "Sandefjord", "Tønsberg",
    "Porsgrunn", "Horten", "Haugesund", "Lillestrøm", "Harstad", "Kongsberg", "Ski", "Kristiansund", "Gjøvik",
    "Narvik", "Molde", "Steinkjer", "Elverum", "Alta", "Vadsø", "Kirkenes", "Andalsnes", "Sortland",
    "Førde", "Flekkefjord", "Kautokeino", "Longyearbyen", "Tromsø", "Narvik", "Harstad", "Bodø", "Alta",
    "Hammerfest", "Vadsø", "Kirkenes", "Lillehammer", "Gjøvik", "Hamar", "Kongsberg", "Drammen", "Fredrikstad",
    "Sarpsborg",
  ],
  "PL": [
    "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Sopot", "Szczecin", "Bydgoszcz",
    "Lublin", "Białystok", "Katowice", "Gdynia", "Częstochowa", "Radom", "Toruń", "Kielce", "Gliwice",
    "Zabrze", "Bytom", "Olsztyn", "Rzeszów", "Ruda Śląska", "Rybnik", "Tychy", "Opole", "Elbląg",
    "Płock", "Wałbrzych", "Zielona Góra", "Włocławek", "Chorzów", "Legnica", "Koszalin", "Słupsk", "Kalisz",
    "Grudziądz", "Piła", "Ostrów Wielkopolski", "Świnoujście", "Przemyśl", "Głogów", "Biała Podlaska", "Jastrzębie-Zdrój", "Sosnowiec",
    "Tczew", "Bełchatów", "Szczecinek", "Kędzierzyn-Koźle", "Nowy Sącz", "Dąbrowa Górnicza", "Ełk", "Tarnów", "Suwałki",
    "Zamość", "Chełm", "Ostrowiec Świętokrzyski", "Pabianice", "Konin", "Sieradz", "Tczew", "Słupsk", "Kalisz",
    "Konin", "Tarnów", "Zamość", "Chełm", "Suwałki", "Ełk",
  ],
  "PT": [
    "Lisbon", "Porto", "Braga", "Coimbra", "Funchal", "Setúbal", "Aveiro", "Évora", "Faro",
    "Beja", "Guarda", "Viseu", "Castelo Branco", "Leiria", "Santarém", "Portalegre", "Bragança", "Viana do Castelo",
    "Vila Real", "Covilhã", "Portimão", "Loulé", "Barreiro", "Odivelas", "Amadora", "Matosinhos", "Almada",
    "Queluz", "Lagos", "Ponta Delgada", "Angra do Heroísmo", "Horta", "Sines", "Tomar", "Cascais", "Estoril",
    "Sesimbra", "Alenquer", "Barreiro", "Paços de Ferreira", "Mafra", "Torres Vedras", "Vila Real", "Chaves", "Valença",
    "Ponta Delgada", "Viseu", "Covilhã", "Guimarães", "Vila Nova de Gaia", "Matosinhos", "Espinho",
  ],
  "RO": [
    "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești",
    "Oradea", "Arad", "Pitești", "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău", "Satu Mare",
    "Râmnicu Sărat", "Botoșani", "Suceava", "Piatra Neamț", "Târgu Jiu", "Reșița", "Bistrița", "Slobozia", "Deva",
    "Hunedoara", "Vaslui", "Alba Iulia", "Sfântu Gheorghe", "Miercurea Ciuc", "Zalău", "Focșani", "Tulcea", "Călărași",
    "Giurgiu", "Alexandria", "Orșova", "Bârlad", "Roman", "Rădăuți", "Vatra Dornei", "Sighet", "Reghin",
    "Sighișoara", "Curtea de Argeș", "Făgăraș", "Comănești", "Năvodari", "Gheorgheni", "Mediaș", "Odorheiu Secuiesc", "Băile Herculane",
    "Băile Tușnad", "Predeal", "Bușteni",
  ],
  "RS": [
    "Belgrade", "Novi Sad", "Niš", "Kragujevac", "Zrenjanin", "Subotica", "Pančevo", "Čačak", "Kruševac",
    "Kraljevo", "Novi Pazar", "Leskovac", "Užice", "Valjevo", "Sombor", "Požarevac", "Pirot", "Zaječar",
    "Vršac", "Smederevo", "Bor", "Prokuplje", "Loznica", "Aranđelovac", "Gornji Milanovac", "Ćuprija", "Jagodina",
    "Kikinda", "Bačka Topola", "Apatin", "Sremska Mitrovica", "Bečej", "Vranje", "Trgovište", "Kuršumlija", "Lebane",
    "Babušnica", "Majdanpek", "Negotin", "Kostolac", "Sremska Kamenica", "Ruma", "Vrbas", "Temerin", "Kovačica",
    "Alibunar", "Opovo", "Smederevska Palanka", "Despotovac", "Kovačevica", "Vranje",
  ],
  "RU": [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk",
    "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar", "Saratov", "Tyumen",
    "Tolyatti", "Izhevsk", "Barnaul", "Ulyanovsk", "Irkutsk", "Khabarovsk", "Yaroslavl", "Vladivostok", "Makhachkala",
    "Tomsk", "Orenburg", "Kemerovo", "Novokuznetsk", "Ryazan", "Astrakhan", "Naberezhnye Chelny", "Penza", "Lipetsk",
    "Kirov", "Cheboksary", "Tula", "Kaliningrad", "Balashikha", "Kursk", "Stavropol", "Sochi", "Ulan-Ude",
    "Tver", "Magnitogorsk", "Ivanovo", "Bryansk", "Belgorod", "Surgut", "Vladikavkaz", "Vologda", "Arkhangelsk",
    "Kaluga", "Smolensk", "Kurgan", "Tambov", "Grozny", "Cherepovets", "Kostroma", "Petrozavodsk", "Nizhny Tagil",
    "Novorossiysk", "Komsomolsk-on-Amur", "Murmansk", "Norilsk", "Syktyvkar", "Naryan-Mar", "Yakutsk", "Anadyr", "Magadan",
    "Palatka", "Petropavlovsk-Kamchatsky", "Provideniya", "Pevek", "Khatanga", "Dudinka", "Abakan", "Kyzyl", "Gorno-Altaysk",
    "Biysk", "Rubtsovsk", "Noyabrsk", "Nadym", "Salekhard", "Dubna", "Klin", "Kolomna", "Mozhaysk",
    "Zvenigorod", "Sergiev Posad", "Khimki", "Mytishchi", "Lyubertsy", "Podolsk", "Noginsk", "Ramenskoye", "Orekhovo-Zuyevo",
    "Sochi",
  ],
  "SE": [
    "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping",
    "Norrköping", "Lund", "Umeå", "Gävle", "Borås", "Södertälje", "Eskilstuna", "Halmstad", "Växjö",
    "Karlstad", "Sundsvall", "Östersund", "Trollhättan", "Luleå", "Falun", "Kalmar", "Kristianstad", "Skövde",
    "Karlskrona", "Nyköping", "Kiruna", "Visby", "Bollnäs", "Landskrona", "Örnsköldsvik", "Strängnäs", "Varberg",
    "Norrköping", "Södertälje", "Täby", "Solna", "Lidköping", "Skellefteå", "Östersund", "Borås", "Umeå",
    "Linköping", "Västerås", "Örebro", "Uppsala", "Gävle", "Falun", "Kalmar", "Karlstad",
  ],
  "SI": [
    "Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo Mesto", "Ptuj", "Trbovlje",
    "Kamnik", "Jesenice", "Nova Gorica", "Domžale", "Škofja Loka", "Murska Sobota", "Izola", "Postojna", "Kočevje",
    "Slovenj Gradec", "Sežana", "Krško", "Bled", "Bohinjska Bistrica", "Radovljica", "Zreče", "Idrija", "Ajdovščina",
    "Dravograd", "Gornja Radgona", "Lendava", "Litija", "Pivka", "Ribnica", "Laško", "Lenart", "Straža",
    "Šempeter-Vrtojba", "Logatec", "Zagorje ob Savi", "Sevnica", "Brežice", "Tržič", "Vipava", "Vrhnika", "Cerknica",
    "Radovljica",
  ],
  "SK": [
    "Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Trenčín", "Martin",
    "Poprad", "Prievidza", "Zvolen", "Považská Bystrica", "Nové Zámky", "Michalovce", "Spišská Nová Ves", "Komárno", "Levice",
    "Humenné", "Bardejov", "Liptovský Mikuláš", "Ružomberok", "Trebišov", "Topoľčany", "Lučenec", "Šaľa", "Dunajská Streda",
    "Partizánske", "Malacky", "Piešťany", "Vranov nad Topľou", "Kežmarok", "Brezno", "Zvolen", "Detva", "Banská Štiavnica",
    "Kremnica", "Skalica", "Šahy", "Dunajská Streda", "Svidník", "Stropkov",
  ],
  "SM": [
    "San Marino", "Borgo Maggiore", "Serravalle", "Domagnano", "Fiorentino", "Faetano", "Chiesanuova", "Acquaviva", "Montegiardino",
    "Chiesanuova", "Serravalle", "Borgo Maggiore", "Fiorentino", "Domagnano", "Faetano", "Acquaviva", "Montegiardino", "San Marino",
    "City", "Fiorentino", "Chiesanuova", "Borgo Maggiore", "Serravalle", "Domagnano", "Faetano",
  ],
  "UA": [
    "Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih", "Mykolaiv",
    "Mariupol", "Vinnytsia", "Simferopol", "Kherson", "Poltava", "Chernihiv", "Cherkasy", "Zhytomyr", "Sumy",
    "Chernivtsi", "Rivne", "Khmelnytskyi", "Ternopil", "Ivano-Frankivsk", "Kropyvnytskyi", "Luhansk", "Sevastopol", "Uzhhorod",
    "Kramatorsk", "Bila Tserkva", "Kremenchuk", "Brovary", "Nizhyn", "Berdyansk", "Sloviansk", "Melitopol", "Kostiantynivka",
    "Kovel", "Korosten", "Shepetivka", "Burshtyn", "Berehove", "Chortkiv", "Sarny", "Zhovkva", "Zolochiv",
    "Bilhorod-Dnistrovskyi", "Chornomorsk", "Bakhmut", "Obukhiv", "Boryspil", "Irpin", "Fastiv", "Boyarka", "Vyshhorod",
    "Dubno", "Kamenets-Podilskyi", "Mohyliv-Podilskyi", "Yaremche", "Yasinia", "Rakhiv", "Svaliava", "Tiachiv", "Khust",
  ],
  "VA": [
    "Vatican City", "Vatican", "Città del Vaticano", "San Pietro",
  ],
  "XK": [
    "Pristina", "Prizren", "Peja", "Gjakova", "Gjilan", "Mitrovica", "Ferizaj", "Vushtrri", "Kaçanik",
    "Suharekë", "Rahovec", "Deçan", "Istog", "Gjakovë", "Klinë", "Viti", "Dragash", "Orahovac",
    "Klokot", "Zubin Potok", "Leposavić", "Zvečan", "Novo Brdo", "Ranilug", "Gračanica", "Mamuša", "Partesh",
    "Obilić", "Lipljan", "Podujevo", "Fushë Kosovë", "Srbica", "Tuzi", "Kamenicë", "Malisheve", "Mamuša",
    "Podujevë", "Ranilug", "Damjan", "Banje", "Junik", "Deçan", "Klokot", "Vushtrri", "Rahovec",
    "Mamuša", "Kaçanik", "Suharekë",
  ],
  // ===== NORTH AND CENTRAL AMERICA, CARIBBEAN =====
  "AG": [
    "Saint John's", "All Saints", "Liberta", "Bolands", "Potters", "Freetown", "Saint John", "All Saints", "Liberta",
    "Bolands", "Potters", "Freetown", "Gambles", "Five Islands", "Piggotts", "New Work", "Mango", "Old Road Town",
    "Sewer", "Belfield", "Calvary", "Cades Bay", "Falmouth", "English Harbour", "Goyave", "Freetown", "Parham",
    "Plymouth",
  ],
  "AW": [
    "Oranjestad", "San Nicolas", "Santa Cruz", "Noord", "Sera", "Sol", "Tanki Flip", "Oranjestad", "San Nicolas",
    "Santa Cruz", "Noord", "Sera", "Sol", "Oranjestad", "Bara", "Tanki Flip", "Parera", "Santa Cruz",
    "San Nicolas", "Arashi", "Palm Beach", "Noord", "Sera", "Sol",
  ],
  "BS": [
    "Nassau", "Freeport", "Marsh Harbour", "Coopers Town", "Governor's Harbour", "Abaco", "Eleuthera", "Alice Town", "Marsh Harbour",
    "West End", "Governor's Harbour", "Nassau", "Spanish Wells", "High Rock", "Pirate's Cove", "Rock Sound", "Abaco", "Cooper's Town",
    "Governor's Harbour", "Nassau", "Freeport", "Marsh Harbour", "Alice Town", "West End", "Spanish Wells", "High Rock", "Rock Sound",
    "Cockburn Town", "Dunmore Town", "Pine Cay", "Sandy Point",
  ],
  "BZ": [
    "Belmopan", "Belize City", "San Ignacio", "Orange Walk", "Corozal", "Punta Gorda", "Dangriga", "San Pedro", "Punta Gorda",
    "Placencia", "Corozal", "Orange Walk", "San Ignacio", "Belmopan", "Belize City", "Dangriga", "Punta Gorda", "Belmopan",
    "San Pedro", "Caye Caulker", "Hopkins", "San Ignacio", "San Pedro", "Orange Walk",
  ],
  "CA": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton",
    "Kitchener", "London", "Halifax", "St. John's", "Victoria", "Saskatoon", "Regina", "Sherbrooke", "St. Catharines",
    "Windsor", "Barrie", "Oshawa", "Guelph", "Moncton", "Brantford", "Thunder Bay", "Sudbury", "Saguenay",
    "Kelowna", "Abbotsford", "Kingston", "Sarni", "Peterborough", "Fredericton", "Charlottetown", "Red Deer", "Lethbridge",
    "Saskatoon", "Medicine Hat", "Windsor", "Portage la Prairie", "Prince Albert", "Moose Jaw", "Brandon", "Thompson", "Yellowknife",
    "Whitehorse", "Iqaluit", "Cambridge", "Waterloo", "Niagara Falls", "Delta", "Nanaimo", "Kamloops", "Prince George",
    "Vernon", "Penticton", "Nelson", "Kitchener", "Owen Sound", "Orillia", "Cornwall", "Chatham", "Sarnia",
    "Stratford", "Goderich", "Woodstock", "Brantford", "Truro", "Bathurst", "Gander", "Edmundston", "Baie-Comeau",
    "Sept-Îles", "Rimouski", "Drummondville", "Bath",
  ],
  "CR": [
    "San José", "Desamparados", "Alajuela", "Cartago", "Heredia", "Liberia", "Puntarenas", "Limón", "San Isidro",
    "Turrialba", "San José", "Escazú", "Santa Ana", "Alajuela", "Grecia", "San Ramón", "Turrialba", "Ciudad Colón",
    "San Vicente", "San Isidro", "Lindora", "Siquirres", "Guápiles", "Puerto Jiménez", "Quepos", "Jacó", "Dominical",
    "Cobá", "Tulum", "Nicoya", "Liberia", "Cañas", "Jinotega", "San Carlos", "Ciudad Neily",
  ],
  "CU": [
    "Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Santa Clara", "Guantánamo", "Bayamo", "Cienfuegos", "Matanzas",
    "Sancti Spíritus", "Pinar del Río", "Manzanillo", "Santiago de Cuba", "Guantánamo", "Bayamo", "Holguín", "Las Tunas", "Cienfuegos",
    "Matanzas", "Cárdenas", "Sancti Spíritus", "Camagüey", "Ciego de Ávila", "Baracoa", "Trinidad", "Varadero", "Viñales",
    "Baracoa", "Nueva Gerona", "Banes", "Contramaestre", "Guantánamo", "Santiago de Cuba", "Remedios", "Caimanera",
  ],
  "DM": [
    "Roseau", "Portsmouth", "Warner", "Canefield", "Pointe Mulâtre", "Bexhill", "D引发".slice(0, 0) + "D发明", "Roseau",
    "Portsmouth", "Roseau", "Warner", "Kingshill", "Bath Estate", "Calibishie", "Canefield", "Good Hope", "Moricetown",
    "Pointe Mulâtre", "Roseau", "Roseau", "St Joseph", " Portsmouth", "Bath Estate", "Warner", "Kingshill", "Calibishie",
    "Good Hope", "Moricetown",
  ],
  "DO": [
    "Santo Domingo", "Santiago de los Caballeros", "Santo Domingo", "La Romana", "San Cristóbal", "San Pedro de Macorís", "La Vega", "Moca", "Azua",
    "Bávaro", "Constanza", "Barahona", "San Fernando", "Dajabón", "Monte Cristi", "Hato Mayor", "Samaná", "Las Matas de Santa Cruz",
    "Navarrete", "Puerto Plata", "Jimaní", "Bonao", "Nagua", "San José de Ocoa", "El Seibo", "La Romana", "Santiago",
    "Santo Domingo", "Barahona", "San Pedro de Macorís", "La Vega", "Samaná", "Puerto Plata", "Hato Mayor", "Bonao", "Constanza",
    "Jimaní", "Nagua", "Monte Cristi", "Azua", "Dajabón", "Moca", "Navarrete", "San Cristóbal", "Bávaro",
  ],
  "GD": [
    "St. George's", "Grenville", "Victoria", "Saunders", "Grand Anse", "Hillsborough", "Morne Rouge", "St. George's", "Grenville",
    "Victoria", "Saunders", "Grand Anse", "Hillsborough", "Morne Rouge", "Carenage", "Grand Rivière", "Rose Hill", "Gouyave",
    "Victoria", "St. George's", "Grenville", "Morne Rouge", "Grand Anse", "Victoria", "Saunders", "Croquerouge", "Morne Rouge",
    "Grand Rivière", "Grenville", "Charlotte", "Hopewell", "Saint George's",
  ],
  "GT": [
    "Guatemala City", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla", "Chimaltenango", "Tecún Umán", "Puerto Barrios", "Chimaltenango",
    "Escuintla", "Amatitlán", "Retalhuleu", "Sololá", "Mazatenango", "Antigua", "Jutiapa", "Cobán", "Chichicastenango",
    "Salama", "Cuyatenango", "San Pedro Sacatepéquez", "Flores", "Poptún", "Coatepeque", "Champerico", "Santa Lucía Cotzumalguapa", "Sanarate",
    "San Pedro Sacatepéquez", "Zacapa", "Chiquimula", "Cuilapa", "Barillas", "San Marcos", "Malacatán", "Cunen", "San Pedro Sacatepéquez",
  ],
  "HN": [
    "Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choluteca", "Comayagua", "Puerto Cortés", "Danlí", "Juta", "Santa Rosa de Copán",
    "Olanchito", "Trujillo", "San Lorenzo", "Yoro", "Sabaneta", "La Paz", "La Esperanza", "Nacaome", "Jocoro",
    "Yoro", "El Paraíso", "Tocoa", "La Unión", "San Antonio", "El Progreso", "Copán", "Santa Bárbara", "Ocotepeque",
    "San Francisco Morazán", "Intibucá", "La Paz", "Comayagua", "Santa Rosa de Copán", "Ojojona",
  ],
  "HT": [
    "Port-au-Prince", "Cap-Haïtien", "Cité Soleil", "Carrefour", "Delmas", "Jérémie", "Jacmel", "Port-au-Prince", "Cap-Haïtien",
    "Carrefour", "Delmas", "Jérémie", "Jacmel", "Les Cayes", "Port-de-Paix", "Gonaïves", "Miragoâne", "Anse-à-Foleur",
    "Arcahaie", "Petit-Goâve", "Belle-Anse", "Baradines", "Grand'Anse", "Dame-Marie", "Marmelade", "Fort-Liberté", "Cap-Haïtien",
    "Port-au-Prince", "Carrefour", "Delmas", "Tabarre", "Pétion-Ville", "Cité Soleil", "Crozier", "Choconsa", "Rose",
    "Anse-à-Foleur", "Rose", "Choconsa", "Rose",
  ],
  "JM": [
    "Kingston", "Spanish Town", "Montego Bay", "May Pen", "Mandeville", "Old Harbour", "Savanna-la-Mar", "Port Antonio", "Portmore",
    "Bog Walk", "Falmouth", "Morant Bay", "Negril", "Ocho Rios", "Yallahs", "Black River", "Santa Cruz", "Bouge",
    "Ewarton", "Chapelton", "Highgate", "Brown's Town", "Frankfield", "Junction", "Runaway Bay", "Christiana", "Ochi",
    "Spaldings", "Palisadoes", "Bull Bay", "Falmouth", "Montego Bay", "Negril", "Ocho Rios", "Runaway Bay",
  ],
  "KN": [
    "Basseterre", "Sandy Point", "Charlestown", "Cedar Point", "Dieppe Town", "Golden Rock", "Newcastle", "Sandy Point", "Old Road Town",
    "Tabou", "Cozier", "Newton Ground", "Fleteau", "Lime", "Orange Hill", "Mondo", "Deep Creek", "Cedar Point",
    "Swan Hill", "Charlestown", "Golden Rock", "Newcastle", "Dieppe Town", "Basseterre", "Sandy Point",
  ],
  "LC": [
    "Castries", "Vieux Fort", "Gros Islet", "Dennery", "Soufrière", "Roseau", "Morne Fortune", "La Soufrière", "Roseau",
    "Vieux Fort", "Gros Islet", "Dennery", "Soufrière", "Morne Fortune", "Canaries", "Cap Estate", "Vigie", "Rodney Bay",
    "Choc", "Belfonse", "Roseau", "Soufrière", "Fond St Jacques", "Des Cartiers", "La Soufrière", "Roseau", "Vieux Fort",
  ],
  "MX": [
    "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Monclova",
    "Ciudad Juárez", "Ciudad Nezahualcóyotl", "Mexicali", "Culiacán", "Acapulco", "Toluca", "Chihuahua", "Morelia", "Hermosillo",
    "Cancún", "Saltillo", "Torreón", "Querétaro", "Irapuato", "Torrance", "Baja California", "Veracruz", "Villahermosa",
    "Aguascalientes", "San Luis Potosí", "Cuernavaca", "Chihuahua", "Culiacán", "Oaxaca", "Campinas", "Mazatlán", "Puerto Vallarta",
    "Tepic", "Mérida", "San José", "Cancún", "Salamanca", "Delicias", "Ciudad Victoria", "Guanajuato", "Morelia",
    "San José", "Torreón", "Matamoros", "Durango", "Toluca", "Zacatecas", "Córdoba", "Pachuca", "Oaxaca",
    "Puebla", "Xalapa", "Chetumal", "Coba", "Acapulco", "Ixtapa", "Zihuatanejo", "Todos Santos", "La Paz",
    "Cabo San Lucas",
  ],
  "NI": [
    "Managua", "León", "Granada", "Masaya", "Chinandega", "Matagalpa", "Estelí", "Jinotega", "Bluefields",
    "Puerto Cabezas", "Juigalpa", "Sebastián", "Jinotega", "Chinandega", "Boaco", "Ocotal", "Nueva Segovia", "Jalapa",
    "Masatepe", "Nandaime", "Managua", "Tipitapa", "San Carlos", "Brito", "El Castillo", "Rosario", "Somoto",
    "Oculta", "Waspán", "Siuna", "Prinzapolka", "El Rama", "Bluefields", "Puerto Cabezas", "Kukra",
  ],
  "PA": [
    "Panama City", "San Miguelito", "Tocumen", "David", "Santiago", "Colón", "La Chorrera", "Changuinola", "Penonomé",
    "Arraiján", "La Palma", "David", "Panama City", "Colón", "San Miguelito", "Tocumen", "La Chorrera", "Arraiján",
    "Antón", "Penonomé", "Changuinola", "Bugaba", "Boquete", "Bocas del Toro", "Bastimentos", "Pedasí", "Volcán",
    "Soná", "Divisa", "Metetí", "Yaviza", "Guararé", "Macaracas", "Los Santos", "Yaviza", "David",
    "Santiago de Veraguas", "Aguadulce", "Chitré", "Corozal", "Changuinola", "El Porvenir",
  ],
  "PR": [
    "San Juan", "Bayamón", "Ponce", "Carolina", "Caguas", "Guaynabo", "Arecibo", "Toa Baja", "Mayagüez",
    "Trujillo Alto", "Aguadilla", "Cabo Rojo", "Guánica", "Manatí", "Cayey", "Barceloneta", "Guayama", "Yabucoa",
    "San Germán", "Aguas Buenas", "Ciales", "Humacao", "Cabo Rojo", "San Sebastián", "Lares", "Lajas", "Loíza",
    "Hatillo", "Corozal", "Naguabo", "Villalba", "Aibonito", "Barranquitas", "Cayey", "Orocovis", "Salinas",
    "Moca",
  ],
  "SV": [
    "San Salvador", "Santa Ana", "Soyapango", "Mejicanos", "Apopa", "La Unión", "San Marcos", "Sonsonate", "Usulután",
    "Zacatecoluca", "Chalchuapa", "Acajutla", "Sensuntepeque", "Suchitoto", "Metapán", "San Miguel", "San Vicente", "Berlín",
    "Jucuapa", "Santiago de María", "Monseñor Romero", "San Francisco Gotera", "Jiquilisco", "Puerto El Triunfo", "Alegría", "Chalatenango", "La Libertad",
    "Antiguo Cuscatlán", "Colón", "Ahuachapán", "Tacuba", "Guaymango", "Chalchuapa", "Juayúa", "Concepción de Ataco", "Salcoatitán",
    "Apaneca",
  ],
  "TT": [
    "Port of Spain", "San Fernando", "Chaguanas", "Arima", "Scarborough", "Toco", "Sangre Grande", "Couva", "Freeport",
    "Point Fortin", "Chaguanas", "Mayaro", "Marabella", "Carenage", "San Fernando", "Fyzabad", "Tabaquite", "Chase",
    "Moriah", "Las Tablas", "Sangre Grande", "Mayaro", "Rio Claro", "Arouca", "Tunapuna", "La Brea", "Arima",
    "Cunapo", "Marabella",
  ],
  "US": [
    "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas",
    "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis", "San Francisco", "Seattle",
    "Denver", "Washington", "Boston", "El Paso", "Detroit", "Nashville", "Portland", "Memphis", "Oklahoma City",
    "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City",
    "Mesa", "Atlanta", "Omaha", "Colorado Springs", "Raleigh", "Miami", "Long Beach", "Virginia Beach", "Oakland",
    "Minneapolis", "Tulsa", "Cleveland", "Wichita", "Arlington", "Tampa", "New Orleans", "Honolulu", "Anaheim",
    "Lexington", "Stockton", "Corpus Christi", "Henderson", "Riverside", "Newark", "Saint Paul", "Cincinnati", "St. Louis",
    "Pittsburgh", "Saint Petersburg", "Buffalo", "Norfolk", "Orlando", "Chandler", "Laredo", "Lubbock", "Irving",
    "Winston-Salem", "Chesapeake", "Glendale", "Garland", "Boise", "Toledo", "Aurora", "Springfield", "Akron",
    "Dayton", "Springfield", "Columbia", "Charleston", "Spokane", "Rochester", "Birmingham", "Des Moines", "Richmond",
    "Syracuse", "Grand Rapids", "Tacoma", "Fargo", "Fresno", "Provo", "Wichita", "Yellowknife", "Casper",
    "Cheyenne", "Missoula", "Bozeman", "Helena", "Butte", "Salem", "Eugene", "Bend", "Olympia",
    "Spokane", "Tacoma", "Everett", "Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla",
    "Kenai", "Bethel", "Utqiagvik", "Newcastle",
  ],
  "VC": [
    "Kingstown", "Georgetown", "Belmopan", "Chateaubelair", "Barrouallie", "Arnos Vale", "Orange Hill", "Kingstown", "Georgetown",
    "Chateaubelair", "Barrouallie", "Arnos Vale", "Orange Hill", "Eustatia", "Petit Bordel", "Richmond", "Wallibou", "Dover",
    "Belmopan", "Union Island", "Bequia", "Mustique", "Canouan", "Mayreau", "Union", "Kingstown", "Georgetown",
  ],
  // ===== SOUTH AMERICA =====
  "AR": [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe",
    "San Juan", "Resistencia", "Neuquén", "Posadas", "Bahía Blanca", "Paraná", "Formosa", "San Luis", "La Rioja",
    "Río Cuarto", "Río Gallegos", "Comodoro Rivadavia", "San Rafael", "Concordia", "Santiago del Estero", "Corrientes", "Tucumán", "Bahía Blanca",
    "Catamarca", "Jujuy", "San Juan", "Mendoza", "San Luis", "La Pampa", "Río Negro", "Santa Cruz", "Tierra del Fuego",
    "Chubut", "Entre Ríos", "Coronel Suárez", "Zárate", "San Nicolás de los Arroyos", "Olavarría", "Tandil", "Viedma", "Trelew",
    "Río Turbio", "Puerto Madryn", "Gobernador Costa", "Ushuaia", "Río Grande", "Caleta Olivia", "Puerto San Julián", "El Calafate", "San Carlos de Bariloche",
  ],
  "BO": [
    "Santa Cruz de la Sierra", "El Alto", "La Paz", "Cochabamba", "Sucre", "Oruro", "Potosí", "Tarija", "Sucre",
    "Riberalta", "Yacuiba", "Villa Montes", "Tupiza", "Llallagua", "Viacha", "Cobija", "Guayaramerín", "San Ignacio de Velasco",
    "Camiri", "Santa Cruz de la Sierra", "Montero", "Warnes", "Sacaba", "Quillacollo", "Tarija", "Potosí", "Oruro",
    "Cochabamba", "La Paz", "El Alto", "Oruro", "Sucre", "Llallagua", "Rurrenabaque", "Cobija", "Puerto Suárez",
  ],
  "BR": [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife",
    "Porto Alegre", "Belém", "Goiânia", "Campinas", "Natal", "Teresina", "São Luís", "Maceió", "Aracaju",
    "João Pessoa", "Cuiabá", "Florianópolis", "Rio Branco", "Mogi das Cruzes", "Guarulhos", "Campo Grande", "Santo André", "Osasco",
    "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Caxias do Sul", "Juiz de Fora", "Londrina", "Joinville", "Niterói", "Belford Roxo",
    "Petrópolis", "Uberlândia", "Contagem", "Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Volta Redonda",
    "Itaboraí", "Maringá", "Montes Claros", "Caxias do Sul", "Florianoópolis", "Rio de Janeiro", "Santos", "Guarujá", "Campinas",
    "Piracicaba", "São Carlos", "Bauru", "Marília", "Pres Prudente", "Araçatuba", "Joinville", "Blumenau", "Chapecó",
    "Criciúma", "Pelotas", "Canoas",
  ],
  "CL": [
    "Santiago", "Valparaíso", "Viña del Mar", "Concepción", "Antofagasta", "Temuco", "Rancagua", "Talca", "Arica",
    "Iquique", "Puerto Montt", "Copiapó", "La Serena", "Coquimbo", "Osorno", "Valdivia", "Punta Arenas", "Calama",
    "Quilpué", "San Antonio", "Melipilla", "Curicó", "Los Ángeles", "Puerto Varas", "Río Bueno", "Panguipulli", "Coyhaique",
    "Chiloé", "Calera", "San Felipe", "Los Andes", "Ritoque", "Machalí", "Taltal", "Chillán", "Curanilahue",
    "Puerto Montt", "Castro", "Chaitén", "Ancud", "Calbuco", "Frutillar", "Purranque", "Río Negro",
  ],
  "CO": [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta",
    "Ibagué", "Manizales", "Villavicencio", "Pasto", "Neiva", "Armenia", "Popayán", "Valledupar", "Sincelejo",
    "Tunja", "Riohacha", "Montería", "Quibdó", "Florencia", "Yopal", "Riohacha", "Ciénaga", "Arauca",
    "Girón", "Zarzal", "Palmira", "Ipiales", "Tumaco", "Cartago", "La Dorada", "Turbo", "Apartadó",
    "Bello", "Envigado", "Itagüí", "Sabaneta", "Quindío", "Chía", "Zipaquirá", "Facatativá", "Funza",
    "Soacha", "Buenaventura", "Tumaco", "Puerto Colombia", "Turbo", "Ciénaga", "Magangué", "Maicao", "Riohacha",
    "Pereira", "Manizales",
  ],
  "EC": [
    "Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo", "Ambato", "Riobamba",
    "Loja", "Ibarra", "Quevedo", "Milagro", "Babahoyo", "Latacunga", "Esmeraldas", "Guaranda", "Tulcán",
    "Zamora", "Puyo", "Tena", "Macas", "La Troncal", "San Lorenzo", "Otavalo", "Cayambe", "Ventanas",
    "Jipijapa", "Santa Elena", "Salinas", "Ayampe", "Montañita", "Puerto Ayora", "Puerto Baquerizo", "Puerto Ayora", "Bahía de Caráquez",
    "Pedernales", "San Lorenzo", "Gualaquiza", "Bucay", "Coro", "La Troncal", "Nangaritza",
  ],
  "FK": [
    "Stanley", "Goose Green", "Port Stanley", "Port Louis", "Port Howard", "San Carlos", "San Juan", "San José", "Darwin",
    "Goose Green", "Mount Pleasant", "Sea Lion", "Port Harriet",
  ],
  "GF": [
    "Cayenne", "Kourou", "Saint-Laurent-du-Maroni", "Maripasoula", "Régina", "Sinnamary", "Grand-Santi", "Camopi", "Roura",
    "Hévard", "Ouanary", "Saut", "Makouria", "Trinité", "Kaw", "Camopi", "Régina", "Cayenne",
    "Kourou", "Iracoubo", "Sinnamary", "Saramaca", "Apatou", "Saint-Élie", "Mana", "Awala-Yalimapo", "Saint-Laurent",
    "Cayenne", "Macouria",
  ],
  "GY": [
    "Georgetown", "Linden", "New Amsterdam", "Bartica", "Mahaica", "Mahaicam", "Corriverton", "Rose Hill", "Kwakwani",
    "Kamarang", "Tumeru", "Annai", "Arakuna", "Akan", "Wai-wai", "Lethem", "Mabaruma", "Mor_aucuna",
    "Esequibo", "Kaieteur", "Amaila", "Cayuni", "Kanuku", "Berbice", "Demerara", "Essequibo", "Georgetown",
    "Bartica", "Linden", "New Amsterdam",
  ],
  "PE": [
    "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo",
    "Tacna", "Ica", "Sullana", "Ayacucho", "Juliaca", "Cajamarca", "Puno", "Pucallpa", "Tarapoto",
    "Trujillo", "Talara", "Abancay", "Huaraz", "Huánuco", "Moquegua", "Tumbes", "Loreto", "Amazonas",
    "Junín", "Apurímac", "Pasco", "Ancash", "La Libertad", "Lambayeque", "Tumbes", "Moquegua", "Tacna",
    "Arequipa", "Cusco", "Machu Picchu", "Puno", "Copacabana", "Chiclayo", "Lambayeque", "Piura", "Sullana",
    "Talara", "Tumbes", "Iquitos", "Yurimaguas",
  ],
  "PY": [
    "Asunción", "Ciudad del Este", "Encarnación", "San Lorenzo", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio", "Villa Elisa",
    "Cañindeyú", "Corpus Christi", "Villarrica", "Villa Hayes", "Areguá", "Itauguá", "Guarambaré", "Nanawa", "San Juan Bautista",
    "Caaguazú", "Mariana", "Caacupé", "Paraguarí", "Salto del Guairá", "Pilar", "Altos", "Ayolas", "Filadelfia",
    "Presidente Franco", "Villarrica", "Minga Porá", "San Juan Bautista", "Piribebuy", "Ypacaraí",
  ],
  "SR": [
    "Paramaribo", "Lelydorp", "Albina", "Nieuw Nickerie", "Nickerie", "Wageningen", "Gourav", "Albina", "Nieuw Nickerie",
    "Bovend Suriname", "Lelydorp", "Paramaribo", "Moengo", "Albina", "Brownsweg", "Wageningen", "Gourav", "Pikien Rio",
    "Onverwacht", "Totoca", "Dordrecht", "Brixton", "Maran", "Kwamalasamutu", "Saramacca", "Brokopondo", "Sara",
  ],
  "UY": [
    "Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera", "Melo", "Mercedes", "Maldonado", "Tacuarembó",
    "Melo", "Minas", "San José de Mayo", "Durazno", "Florida", "Treinta y Tres", "Rocha", "Colonia del Sacramento", "Santa Lucía",
    "Young", "Cañelones", "Villa Constitución", "Progreso", "San Carlos", "Pan de Azúcar", "Chuy", "Pando", "Toledo",
    "Aiguá", "Parque", "Minas", "Sierra de los Caracoles", "Chuy", "Fray Bentos", "Young", "Villa Constitución",
  ],
  "VE": [
    "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Cumaná", "Ciudad Guayana", "San Cristóbal", "Maturín",
    "Barcelona", "Cúa", "Ciudad Bolívar", "Cabimas", "Los Teques", "Guarenas", "Punto Fijo", "Turmero", "Ciudad Guayana",
    "Carúpano", "Coro", "Valera", "Puerto La Cruz", "Mérida", "Barinas", "San Felipe", "Boconó", "Acarigua",
    "Guanare", "San Fernando de Apure", "Calabozo", "Cúa", "Altagracia de Orituco", "El Tigre", "Santa Elena", "Valera", "Piedras Blancas",
    "Chichiriviche", "Mene Grande", "Machiques", "Tumerla",
  ],
  // ===== OCEANIA =====
  "AS": [
    "Pago Pago", "Fagatogo", "Faleolo", "Leone", "Taufua", "Si'u", "Faleniu", "A'olo", "Ofu",
    "Asau", "Maasiasoga", "Asease", "Utane", "Fa'asa", "Le'atofe", "Manase", "Gagatogo",
  ],
  "AU": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Hobart",
    "Geelong", "Townsville", "Darwin", "Toowoomba", "Cairns", "Ballarat", "Bendigo", "Wollongong", "Launceston",
    "Port Macquarie", "Coffs Harbour", "Wagga Wagga", "Hervey Bay", "Tamworth", "Maitland", "Taree", "Alice Springs", "Dubbo",
    "Geraldton", "Bunbury", "Cobar", "Armidale", "Goulburn", "Lismore", "Bathurst", "Broken Hill", "Orange",
    "Mildura", "Shepparton", "Wodonga", "Tweed Heads", "Merriwa", "Broken Hill", "Yarraman", "Mount Gambier", "Whyalla",
    "Berri", "Murray Bridge", "Victor Harbor", "Mount Isa", "Cooma", "Wagga", "Grafton", "Katoomba", "Wollongong",
    "Batemans Bay", "Latrobe", "Sale", "Narrogin", "Manjimup", "Esperance", "Albany", "Bunbury", "Geraldton",
    "Kalgoorlie",
  ],
  "CC": [
    "West Island", "Home Island", "Direction Island", "Territory Harbour", "Hantt Harbour",
  ],
  "CX": [
    "Flying Fish Cove", "The Settlement", "Tristan da Cunha", "Edinburgh of the Seven Seas", "Nightingale", "Inaccessible",
  ],
  "FJ": [
    "Suva", "Lautoka", "Nadi", "Labasa", "Ba", "Levuka", "Lami", "Nausori", "Sigatoka",
    "Votualevu", "Deuba", "Nadali", "Savusavu", "Lambasa", "Seaqaqa", "Somosomo", "Lautoka", "Suva",
    "Nadi", "Ba", "Levuka", "Savusavu", "Taveuni", "Rabi", "Labasa", "Nausori", "Sigatoka",
    "Lami", "Vunidawa", "Navala", "Vatulele", "Koro", "Cakaudrove", "Nadali", "Somosomo", "Taveuni",
  ],
  "FM": [
    "Palikir", "Weno", "Truk", "Chuuk", "Pohnpei", "Kapingamarangi", "Kosrae", "Kolonia", "Yap",
    "Nukuoro", "Pohnpei", "Weno", "Truk", "Lelu", "Woleai", "Eten", "Ngerulmud", "Benigno",
    "Parem", "Ngatik", "Wef", "Kapingamarangi", "Nukuoro", "Kosrae", "Fono", "Utwe",
  ],
  "GU": [
    "Hagåtña", "Tamuning", "Mangilao", "Barrigada", "Yigo", "Dededo", "Umatac", "Maitinao", "Piti",
    "Agat", "Mare", "Santa Rita", "Pandan", "Talofofo", "Yona", "Agana", "Umatac", "Merizo",
    "Inarajan", "Talofofo", "Piti", "Barrigada", "Dededo", "Tamuning", "Mangilao", "Hagåtña", "Yigo",
    "Agat", "Mare", "Maitinao", "Pandan", "Asan", "Umatac", "Talofofo",
  ],
  "KI": [
    "South Tarawa", "Betio", "Bairiki", "Tarawa", "Butiabatari", "Bonriki", "Tabiteuea", "Abaiang", "Tabuaeran",
    "Nonouti", "Kiritimati", "Abemama", "Aranui", "Teona", "Onotoa", "Maiden", "Nikunau", "Butaritari",
    "Kanbera", "Makin", "Bututa", "Kuria", "Nukunau", "Tabatabu", "Takaung", "Utaiwi", "Yawata",
    "Marakei", "Abemama", "Tabiteuea", "Betio",
  ],
  "MH": [
    "Majuro", "Ebeye", "Kalkun", "Wotho", "Majuro", "Delap-Uj-Delap", "Jaluit", "Wonomalo", "Likiep",
    "Ailuk", "Utirik", "Malar", "Mili", "Namdrik", "Ebon", "Kili", "Jaluit", "Rongelap",
    "Lae", "Malo", "Ailokwej", "Bikar", "Bokak", "Ailing", "Enewetak", "Enewetak", "Bikini",
    "Rongelap", "Kili", "Utirik", "Mili", "Majuro", "Wotho", "Kalkun",
  ],
  "MP": [
    "Saipan", "Garapan", "Kagman", "Piti", "San Vicente", "Dandan", "Saipan", "Garapan", "Kagman",
    "Piti", "San Vicente", "Rota", "Tinian", "Rota", "Tinian", "Aguijan", "Alamagan", "Anatahan",
    "Rota", "Tinian",
  ],
  "NC": [
    "Nouméa", "Mont-Dore", "Dumbéa", "Païta", "Koné", "Houaïlou", "Bourail", "Canala", "Poindimié",
    "Koumac", "Voh", "Thio", "Hienghène", "Touho", "Katzé", "Nakety", "Bourail", "Farino",
    "Sarraméa", "Namoa", "Poya", "Canala", "Koné", "Dumbéa", "Mont-Dore", "Païta",
  ],
  "NR": [
    "Yaren", "Denigomodu", "Buada", "Baiti", "Anetan", "Ujuë", "Ijuw", "Meneng", "Ewa",
    "Anibare", "Tabwa", "Batogo", "Buada", "Nauru", "Yaren", "Denigomodu", "Baiti", "Anetan",
    "Ujuë", "Ijuw", "Meneng", "Ewa", "Anibare", "Tabwa", "Nibok", "Avao", "Niutao",
    "Tabwa", "Ngerulmud",
  ],
  "NU": [
    "Alofi", "Alofi South", "Matautu", "Hikutavake", "Seifart", "Tuapa", "Tame", "Vaiea", "Lakamana",
    "Makehu", "Matala", "Hikutavake", "Alofi", "Matautu", "Alofi South", "Seifart", "Tuapa", "Lakamana",
    "Tame", "Vaiea", "Makehu",
  ],
  "NZ": [
    "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier", "Dunedin", "Palmerston North", "Nelson",
    "Whanganui", "New Plymouth", "Rotorua", "Whangarei", "Invercargill", "Hastings", "Timaru", "Taupo", "Masterton",
    "Cambridge", "Levin", "Ashburton", "Queenstown", "Feilding", "Waitara", "Pukekohe", "Te Awamutu", "Cambridge",
    "Hawera", "Gisborne", "New Plymouth", "Stratford", "Marton", "Raetihi", "Dannevirke", "Gore", "Bluff",
    "Winton", "Oamaru", "Dunedin", "Queenstown", "Wanaka", "Te Anau", "Motueka",
  ],
  "PF": [
    "Papeete", "Faaa", "Punaauia", "Pirae", "Arue", "Mahina", "Pirae", "Punaauia", "Faaa",
    "Arue", "Papeete", "Anakaha", "Mahina", "Pirae", "Papeete", "Teahupoo", "Faaa", "Punaauia",
    "Mahina", "Arue", "Papeete", "Faaa", "Punaauia", "Pirae", "Arue", "Mahina", "Afaitai",
    "Teahupoo", "Vaitape", "Nuku Hiva", "Hakahau", "Hakahau", "Ha'urei",
  ],
  "PG": [
    "Port Moresby", "Lae", "Madang", "Mount Hagen", "Wewak", "Goroka", "Rabaul", "Kokopo", "Kimbe",
    "Alotau", "Kundiawa", "Wabag", "Kainantu", "Tari", "Mendi", "Kerema", "Finschhafen", "Boroko",
    "Waigani", "Hohola", "Tabubil", "Kiunga", "Kawum", "Malam", "Kulum", "Baiyer", "Kaindi",
    "Minj", "Kagua", "Menyam", "Kaiapit", "Ialibu", "Kundiawa", "Port Moresby",
  ],
  "PW": [
    "Ngerulmud", "Melekeok", "Airai", "Koror", "Ngaraulmud", "Ulong", "Ngerchim", "Ngerpalli", "Ngaraulmud",
    "Melekeok", "Koror", "Airai", "Ulong", "Ngerchim", "Aimeliik", "Ngatpang", "Ngeremlengui", "Peleliu",
    "Kayangel", "Ngerimasma", "Ngardmau", "Melekeok", "Koror", "Airai", "Ngaraulmud", "Ulong", "Aimeliik",
    "Ngatpang", "Peleliu", "Kayangel", "Ngerpalli", "Airai",
  ],
  "SB": [
    "Honiara", "Gizo", "Auki", "Tulagi", "Norfolk Island", "Kirakira", "Lata", "Munda", "Kirindir",
    "Tutuba", "Buala", "Kirakira", "Munda", "Lata", "Gizo", "Honiara", "Auki", "Tulagi",
    "Malo", "Mataniko", "Malae", "Rokona", "Kawafate", "Takataka", "Makarako", "Ngalitaveti",
  ],
  "TK": [
    "Fakaofo", "Nukunonu", "Falehlua", "Tokelau", "Fakaofo", "Nukunonu", "Falehlua", "Fakaofo", "Nukunonu",
    "Falehlua", "Fakaofo", "Tokelau", "Fakaofo", "Nukunonu", "Falehlua",
  ],
  "TO": [
    "Nuku'alofa", "Neiafu", "Pangai", "Ohonua", "Haveluloto", "Vava'u", "Ha'apai", "Eua", "Kauvai",
    "Tofua", "Hunga", "Pangai", "Neiafu", "Nuku'alofa", "Ohonua", "Haveluloto", "Lotohou", "Moa",
    "Kolo", "Ha'atafu", "Taumeasina", "Foa", "Hufangalupe",
  ],
  "TV": [
    "Funafuti", "Motufetau", "Fakaofo", "Nukufetau", "Nanumea", "Nukulaelae", "Funafuti", "Motufetau", "Fakaofo",
    "Nukufetau", "Nanumea", "Nukulaelae", "Niutao", "Funafuti", "Motufetau", "Nanumea", "Niutao", "Nukufetau",
    "Fakaofo", "Nukulaelae", "Funafuti", "Motufetau", "Vaitupu", "Nanumaga", "Niutao", "Kiritimati", "Nukufetau",
    "Motufetau", "Funafuti",
  ],
  "VU": [
    "Port Vila", "Luganville", "Sola", "Santo", "Tanna", "Lakatoro", "Maewo", "Saposul", "Ambae",
    "Malekula", "Pentecost", "Malakula", "Tafea", "Erromango", "Mangare", "Pentecost", "Sola", "Luganville",
    "Port Vila", "Lakatoro", "Saratamata", "Mele", "Lelepa", "Vao", "Malakula", "Ambae", "Pentecost",
    "Tanna", "Erromango", "Mangare", "Sapo", "Torres",
  ],
  "WF": [
    "Mata-Utu", "Le Port", "Foa", "Pohopo", "Nuanua", "Vai-Lapa", "Hihifo", "Ha'apitai", "Ngau",
    "Tuanake", "Alo", "Sigave", "Mata-Utu", "Le Port", "Foa", "Pohopo", "Nuanua", "Vai-Lapa",
    "Hihifo", "Ha'apitai", "Ngau", "Tuanake", "Alo", "Sigave", "Mata-Utu", "Nuku",
  ],
  "BB": [
    "Bridgetown", "Speightstown", "Oistins", "Bathsheba", "Holetown", "Saint James", "Saint Philip", "Christ Church", "Saint George",
    "Saint Lucy", "Saint Peter", "Saint Andrew", "Saint Joseph", "Saint Michael", "Saint Thomas", "Bridgetown", "Speightstown", "Oistins",
    "Bathsheba", "Holetown", "Warrant", "Varannes", "Black Rock", "Long Beach",
  ],
  "BL": [
    "Gustavia", "Saint-Barthélemy", "Saint Barthélemy", "Colombier", "Gourbeyre", "Lorient", "Grand Cul-de-Sac", "Hameau de Lorient", "Pointe des Canons",
    "Anse de Colombier",
  ],
  "BQ": [
    "Kralendijk", "The Bottom", "Oranjestad", "Bonaire", "Rincon", "Bentvue", "Scherpenheuvel",
  ],
  "CK": [
    "Avarua", "Nikao", "Arorangi", "Atiu", "Mangaia", "Mataveri", "Rarotonga", "Te Araroa",
  ],
  "CW": [
    "Willemstad", "Banda Abou", "Baqueira", "Boterboom", "Fuik", "Hendrikszou", "Jan Kok", "Julianadorp", "Koto",
    "Mahoney", "Oostburg", "Scherpenheuvel", "Soto", "St. Joris", "Valk", "Westpunt", "Willemstad", "Tera",
  ],
  "GI": [
    "Gibraltar", "Catalan Bay", "Southport", "North Front", "Gibraltar Town", "Recliffe", "Gibraltar", "Winston Churchill Avenue", "Waterport",
    "Devil's Tower",
  ],
  "GL": [
    "Nuuk", "Sisimiut", "Ilulissat", "Maniitsoq", "Qaqortoq", "Upernavik", "Uummannaq", "Kangaatsut", "Aasiaat",
    "Qaanaaq", "Kullorsuaq", "Narsaq", "Ivittuut", "Nanortalik", "Paamiut", "Arsuk", "Sermitsiaq", "Nerortoq",
    "Kangilinnguit", "Qeqertarsuaq", "Kullorsuaq",
  ],
  "MF": [
    "Marigot", "Grand Case", "Cul-de-Sac", "Simpson Bay", "Phillipsburg", "Oyster Pond", "Caye Verte", "Anse Marcel", "Sandy Bay",
    "Marigot", "Grand Case", "Colby",
  ],
  "NF": [
    "Kingston", "Emily Bay", "Bounty Bay", "Ants Point", "Maryborough", "Blickling", "Mount Bates", "Kingston", "Emily Bay",
    "Bounty Bay", "Selwood", "Middle Point", "Panoramic",
  ],
  "PN": [
    "Adamstown", "Bounty Bay", "Henderson Island", "Oeno Island", "Ducie Island",
  ],
  "SX": [
    "Philipsburg", "Cole Bay", "Simpson Bay", "Madame Estate", "Dawn Beach", "Great Bay", "Marigot", "Cul-de-Sac", "Oyster Pond",
    "Little Cay", "Mullet Bay", "Anson",
  ],
  "VI": [
    "Charlotte Amalie", "St. Thomas", "Christiansted", "Frederiksted", "St. Croix", "Anna's Retreat", "Charlotte Amalie", "Tortola", "St. John",
    "Cane Garden Bay", "Bethlehem", "Road Town", "Fort Christian", "Red Hook", "Coral Bay", "Lawaetz",
  ],
  "WS": [
    "Apia", "Pago Pago", "Salelologa", "Faleolo", "Leone", "Taufua", "Galesua", "Gatavalua", "Lufilufi",
    "Apia", "Faleolo", "Lotofaga", "Saleaula", "Siumu", "Gagaifomauga", "Leulumoega", "Faleolo", "Apia",
    "Mulifanua", "Matautu", "Falelulu",
  ],
  "YT": [
    "Mamoudzou", "Dzaoudzi", "Bandrélé", "Kani-Kéli", "Dembéni", "Bambou", "Mtsamboro", "Mamoudzou", "Dzaoudzi",
    "Bandrélé", "Bouéni", "Tsingoni", "Mtsamboro",
  ],
  "GS": [
    "Grytviken", "King Edward Point", "Grytviken Bay", "South Georgia", "Zavodovski",
  ],
  "SJ": [
    "Longyearbyen", "Svalbard", "Barentsburg", "Pyramiden", "Ny-Ålesund", "Hopen", "Longyearbyen", "Svalbard", "Barentsburg",
    "Pyramiden", "Ny-Ålesund",
  ],
  "VG": [
    "Road Town", "Virgin Gorda", "Anegada", "Tortola", "Jost Van Dyke", "St. John", "Peter Island", "Salt Cay", "Norman Island",
    "Cooper Island", "Gorda Sound", "Virgin Gorda",
  ],
  "BM": [
    "Hamilton", "St. George's", "Warwick", "Sandys", "Southampton", "Paget", "Warwick", "Hamilton", "St. George's",
    "Dockyard", "Grotto Bay", "Somers Wharf", "Spanish Point",
  ],
  "KY": [
    "George Town", "Grand Cayman", "Cayman Brac", "West Bay", "George Town", "Bodden Town", "East End", "North Side", "Little Cayman",
    "Sail Rock", "Creature Plant", "Georgetown",
  ],
  "HK": [
    "Hong Kong", "Kowloon", "Tsuen Wan", "Sha Tin", "Tuen Mun", "Yuen Long", "Kwun Tong", "Wan Chai", "Causeway Bay",
    "Central", "Lai Chi Kok", "Sheung Shui", "Fanling", "Mong Kok", "Tai Po", "Sai Kung", "Tai Wai", "Ma On Shan",
    "North Point", "Aberdeen", "Kwai Chung", "Tin Shui Wai", "Wong Tai Sin", "Sham Shui Po", "Tsim Sha Tsui", "Kennedy Town", "Hang Hau",
    "Po Lam", "Tin Hau", "Sai Wan Ho", "Sunny Bay", "Fo Tan", "Shatin", "Ma Tau Wai", "Kwai Chung", "Kwun Tong",
    "Tseung Kwan O",
  ],
  "MO": [
    "Macau", "Taipa", "Coloane", "Cotai", "Mong Ha", "Hac Sa", "Sai Van", "Taipa Village", "Cotai",
    "Taipa", "Coloane", "Macau", "Mong Ha", "Hac Sa", "Sai Van", "Ponte 16",
  ],
  // <<COUNTRY_CITIES>>
};

/**
 * Former names, colonial spellings and romanisation variants.
 *
 * Left-hand side is normalised exactly like a place name (case folded,
 * diacritics stripped, punctuation collapsed), so Sao Tome and the same name
 * with a tilde reach the same key. Values are ISO 3166-1 alpha-2 codes, or
 * arrays of them where the name is genuinely shared between countries.
 *
 * The first half holds FORMER names and romanisation variants. Ambiguity is
 * otherwise expressed in COUNTRY_CITIES, by listing a name under every country
 * that has it - a multi-country key here is a safety net for the generic names
 * below, not a licence to leave COUNTRY_CITIES ambiguous.
 */
/**
 * Former names, colonial spellings and romanisation variants.
 *
 * Left-hand side is normalised exactly like a place name (case folded,
 * diacritics stripped, punctuation collapsed), so Sao Tome and Sao Tome with
 * the tilde reach the same key. Values are ISO 3166-1 alpha-2 codes, or arrays
 * of them where the name is genuinely shared between countries.
 *
 * The first half holds FORMER names and romanisation variants. Ambiguity is
 * otherwise expressed in COUNTRY_CITIES, by listing a name under every country
 * that has it - a multi-country key here is a safety net for the generic names
 * below, not a licence to leave COUNTRY_CITIES ambiguous.
 */
const ALIASES = {
  // South Asia
  bombay: "IN", "calcutta": "IN", "madras": "IN", "bangalore": "IN", "trichy": "IN",
  "cochin": "IN", "trichur": "IN", "arcot": "IN", "baroda": "IN", "ahmedabad": "IN",
  "allahabad": "IN", "banaras": "IN", "benares": "IN", "mysore": "IN", "mysuru": "IN",
  "pondicherry": "IN", "dacca": "BD", "karachi": "PK", "lahore": "PK",
  "rawalpindi": "PK", "peshawar": "PK", "quetta": "PK", "rangoon": "MM", "yangon": "MM",
  // East and Southeast Asia
  saigon: "VN", "tonkin": "VN", "haiphong": "VN", "peking": "CN", "canton": "CN",
  "amoy": "CN", "wuchang": "CN", "tientsin": "CN", "chungking": "CN", "chunking": "CN",
  "nanking": "CN", "hangchow": "CN", "chengtu": "CN", "tsinan": "CN", "mukden": "CN",
  "dairen": "CN", "soochow": "CN", "wuhu": "CN", "pusan": "KR", "keijo": "KR",
  "chemulpo": "KR", "ceylon": "LK", "macau": "MO", "hongkong": "HK", "batavia": "ID",
  "djakarta": "ID", "bandsung": "ID", "davao city": "PH", "new york city": "US",
  "nyc": "US",
  // Russia, Central Asia, "Caucasus\n  leningrad": "RU", "petrograd": "RU", "sverdlovsk": "RU", "ekaterinburg": "RU",
  "frunze": "KG", "alma ata": "KZ", "askhabad": "TM",
  // Africa
  zanzibar: "TZ", "mombasa": "KE", "leopoldville": "CD", "elisabethville": "CD",
  "stanleyville": "CD", "bakawana": "CD", "bakongo": "CD", "sao thome": "ST",
  "cape town": "ZA", "umtata": "ZA", "nelspruit": "ZA", "addis abeba": "ET",
  "mogadisho": "SO", "n djamena": "TD", "el obayd": "SD", "salisbury": "ZW",
  "umtali": "ZW", "tripoli": ["LB", "LY"],
  // Middle East, Europe
  "tel aviv": "IL", "jaffa": "IL", "constantinople": "TR", "smyrna": "TR",
  "antioch": "TR", nürnberg: "DE", "nurnberg": "DE", köln: "DE", "praha": "CZ",
  "wien": "AT", københavn: "DK", reykjavík: "IS", düsseldorf: "DE",
  // Western Hemisphere
  "la habana": "CU", "panama city": "PA", "lisboa": "PT", "sevilla": "ES",
  "saragossa": "ES", "roma": "IT", "milano": "IT", "napoli": "IT", "venezia": "IT",
  "firenze": "IT", "torino": "IT", "syracuse": ["IT", "US"],
  //
  // The generic ones.
  //
  // Every country below really does have a settlement by that name, which is
  // precisely why returning one of them alone would be false confidence.
  // These must stay in step with the country lists.
  "san jose": ["CO", "CR", "DO", "EC", "GT", "HN", "MX", "NI", "PA", "PY", "SV", "US"],
  "new delhi": "IN", "delhi": ["IN", "US"],
  "victoria": ["AU", "CA", "MU", "SC", "VC"],
  "georgetown": ["AU", "CA", "GY", "KY", "US"],
  "newcastle": ["AU", "CA", "GB", "IE", "JM", "US", "ZA"],
  "cambridge": ["CA", "GB", "NZ", "US"], "oxford": ["GB", "NZ", "US"],
  "bath": ["CA", "GB", "US"], "birmingham": ["GB", "US"], "portland": ["GB", "US"],
  "bristol": ["GB", "US"], "bradford": ["GB", "US"], "exeter": ["AU", "GB", "US"],
  "belfast": ["GB", "US"], "plymouth": ["GB", "US"], "portsmouth": ["GB", "US"],
  "manchester": ["GB", "US"], "sheffield": ["GB", "US"], "glasgow": ["GB", "ZA"],
  "edinburgh": ["GB", "NZ", "ZA"], "cardiff": ["GB", "ZW"], "liverpool": ["CA", "GB"],
  "london": ["CA", "GB", "US"], "melbourne": ["AU", "GB", "US"],
  "perth": ["AU", "CA", "GB", "US"], "sydney": ["AU", "CA"], "hobart": ["AU", "US"],
  "wellington": ["AU", "GB", "NZ", "US", "ZA"], "christchurch": ["GB", "NZ"],
  "hamilton": ["BM", "CA", "GB", "NZ"], "dunedin": ["NZ", "US"],
  "albany": ["AU", "US"], "concord": ["AU", "CA", "US"], "salem": ["DE", "IN", "TT", "US"],
  "norfolk": ["CA", "GB", "US"], "lincoln": ["GB", "US"], "chester": ["GB", "US"],
  "york": ["CA", "GB", "US"], "berkeley": ["AU", "US"],
  "kingston": ["AU", "CA", "JM", "NZ", "US"], "saint john": ["CA", "JM"],
  "peterborough": ["GB", "US"], "cornwall": ["CA", "GB"], "dover": ["GB", "US"],
  "hampton": ["GB", "US"], "troy": ["MT", "US"],
  "springfield": ["AU", "CA", "IE", "JM", "NZ", "US", "ZA"],
  "santa cruz": ["BO", "ES", "US"], "santa ana": ["GT", "SV", "US"],
  "san miguel": ["AR", "GT", "PH", "SV", "US"],
  "medellin": "CO", "cartagena": ["CO", "ES"], "cordoba": ["AR", "CO", "ES", "MX"],
  "merida": ["MX", "VE"], "valencia": ["ES", "VE"], "trujillo": ["HN", "PE"],
  "la paz": ["BO", "HN", "MX"], "alexandria": ["CA", "EG", "RO", "US"],
  "avon": ["GB", "NZ", "US"], "auburn": ["AU", "US"], "warwick": ["AU", "GB", "US"],
  "windsor": ["CA", "GB"], "clarkson": ["AU", "US"], "barcelona": ["ES", "VE"],
  "arlington": ["US"], "antwerp": "BE", "bruges": "BE", "geneva": "CH", "geneve": "CH",
  "zurich": "CH", "turin": "IT", "naples": "IT", "palermo": ["AR", "IT"],
  "miranda": ["PT", "VE"], "bakersfield": "US", "saint petersburg": "RU",
  "saint petersburg": "RU", "saint johns": "CA", "thessaloniki": "GR",
  "kansas city": ["US"], "st louis": "US", "salt lake city": "US",
  "oklahoma city": "US", "new orleans": "US", "buenos aires": "AR"
};

/**
 * Trailing English place-type qualifiers, stripped only as a second-chance
 * lookup. "Victoria town" is not a different place from "Victoria", and the
 * seed corpus writes qualifiers in inconsistently. Stripping is only ever
 * attempted AFTER an exact lookup has failed, so a seed that matches a real
 * name with the qualifier attached still resolves through the exact path.
 */
const QUALIFIER =
  /\s+(city|town|village|district|municipality|county|province|region|island|islands|township|settlement|islet|atoll|bay|river|port|aldeia|vila|cidade|estado|borough|parish|commune|quarter|airport|resort|mission|valley|creek|grove|ridge)$/i;

/** Fold a place name to its comparison key: lower case, no diacritics, no punctuation. */
function normalizePlace(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Lazily built normalized name -> country codes index. */
let index = null;

function buildIndex() {
  const map = new Map();
  const add = (key, code) => {
    if (!key) return;
    const hit = map.get(key);
    if (hit) {
      if (!hit.includes(code)) hit.push(code);
    } else {
      map.set(key, [code]);
    }
  };

  for (const [code, names] of Object.entries(COUNTRY_CITIES)) {
    for (const name of names) {
      const key = normalizePlace(name);
      if (!key) continue;
      add(key, code);
      // Also index the run-together form, so a seed written without spaces
      // ("KualaLumpur") still reaches the same answer.
      if (key.includes(" ")) add(key.replace(/ /g, ""), code);
    }
  }

  for (const [alias, value] of Object.entries(ALIASES)) {
    if (!value) continue;
    for (const code of Array.isArray(value) ? value : [value]) add(normalizePlace(alias), code);
  }

  return map;
}

/**
 * Resolve a place name to the country, or countries, it is a known settlement
 * of.
 *
 * @param {string} placeName
 * @returns {string|string[]|null} an ISO 3166-1 alpha-2 code, an array of them
 *   when the name is genuinely shared between countries, or null when this
 *   file makes no claim either way.
 */
function resolveCountry(placeName) {
  if (typeof placeName !== "string" || !placeName.trim()) return null;
  if (!index) index = buildIndex();

  const key = normalizePlace(placeName);
  if (!key) return null;

  let hit = index.get(key) || index.get(key.replace(/ /g, ""));
  if (!hit) {
    const stripped = key.replace(QUALIFIER, "").trim();
    if (stripped && stripped !== key) hit = index.get(stripped);
  }
  if (!hit) return null;

  return hit.length === 1 ? hit[0] : [...hit].sort();
}

module.exports = {
  COUNTRY_CITIES,
  ALIASES,
  normalizePlace,
  resolveCountry,
  /** ISO 3166-1 alpha-2 codes present in this gazetteer. */
  countries: () => Object.keys(COUNTRY_CITIES).sort()
};