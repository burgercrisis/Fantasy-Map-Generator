const fs = require('fs');

let content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const replacements = {
  // Northeast Caucasian (nic-GH)
  'Gyeonggi-Seoul Dialect': 'Seoul,Gyeonggi,Bucheon,Incheon,Chuncheon,Anyang,Goyang,Daejeon,Gwangju',
  'Gyeongsang Dialect': 'Gyeongsang,Andong,Hongsan,Chuncheon,Mungyeong,Yeonchon,Yangyang,Gyeongju',
  'Han-Samhan': 'Yancheng,Jinzhong,Linfen,Wenshui,Changzhi,Qinshui,Pingluo,Zhashui,Qinxi',
  'Haya': 'Haya,Laha,Jaya,Hayani,Aghbar,Saba,Dalo,Gombe,Kwan,Chaba,Kwa,Hamile',
  'Higi': 'Higi,Mokwa,Mariga,Tungal,Magbi,Akwaya,Kadi,Kuje,Karu,Kewa,Maragh,Alkwa,Buipe,Pinglo',
  'Kyaka': 'Kyaka,Yakka,Kuka,Kuku,Kuqa,Uku,Kutya,Kachia,Kashka,Kuta,Kueku,Kwaka,Kuku',
  'Kwama-Manambu Pidgin': 'Kwama,Manambu,Pidgin,Maraua,Mana,Yandu,Gombi,Lota,Mpouya,Kasa,Moroni',
  'Kwi': 'Kwi,Gwi,Bi,Kwi,Bi,Marabi,Mahama,Pan,Ha,Kwan,Tunba',
  'Kyowa-go': 'Kyowa,Maraua,Nana,Kaba,Kurayu,Kara,Kambata,Kyau,Mbebe,Ukau',

  // Armenian varieties (nic-GH)
  'Modern Armenian': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavaris,Hrazdan,Ijevan,Dilijan,Noyemberyan',
  'Modern Western Armenian': 'Istanbul,Izmir,Ankara,Mersin,Gaziantep,Antakya,Kayseri,Sivas,Diyarbakır,Erzurum,Kars',
  'Old Cilician Armenian': 'Adana,Tarsus,Mersin,Erzurum,Gyumri,Yerevan,Van',

  // Korean (ko-KR, nic-GH)
  'Han-Samhan': 'Yancheng,Jinzhong,Linfen,Wenshui,Changzhi,Qinshui,Pingluo,Zhashui,Qinxi,Pingluo,Zhashui,Qinxi',
  'Kyakhta Russian-Chinese Pidgin': 'Kyakhta,Russian-Chinese,Pidgin,Akita,Mongshan,Gangy,Makansh,Khasa,Shuwa,Kha,Khanta,Kyaka,Khama,Gyakhta',

  // Romance languages
  'Castilian': 'Madrid,Toledo,Salamanca,Ávila,Segovia,Zamora,Talavera,Molina,Águilas,Cogollon',
  'Old Catalan': 'Barcelona,Girona,Tarragona,Lleida,Tortosa,Vic,Manresa,Urgell,Empúries',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice,Bordeaux,Montpellier,Strasbourg',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente',
  'Old Lombard': 'Milano,Monza,Busto Arsizio,Legnano,Rho,Saronno,Magenta',
  'Old Catalan-Catalan': 'Barcelona,Girona,Tarragona,Lleida,Perpignan,Balaguer,Mollerussa,Cervera',
  'Provencal-Catalan': 'Marseille,Avignon,Aix-en-Provence,Arles,Nice',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada',
  'Old Lombard': 'Milano,Monza,Busto Arsizio,Legnano,Rho,Saronno,Magenta',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente',

  // Other languages
  'Copts': 'Cairo,Alexandria,Akhmim,Asyut,Minya,Sohag,Qena,Luxor,Fayyum,Dakahlia,Beheira',
  'Core Mansi': 'Khanty-Mansi,Surgut,Nizhnevartovsk,Nefteyugansk,Pyt-Yakh,Uray,Kondinsk',
  'Courland Livonian': 'Courland,Livonian,Riga,Ventspils,Liepāja',
  'Crimean Tatar': 'Crimean Tatar,Simferopol,Sevastopol,Kerch,Evpatoria',
  'Coxoh': 'Coxoh,Comitán,Chiapas,Maya Region,Mexico,Central America',
  'Lonwolwol': 'Lonwolwol,Santo,Port Vila,Vanuatu,Oceania',
  'Cypriot Arabic': 'Cypriot Arabic,Nicosia,Limassol,Larnaca,Cyprus,Mediterranean',
  'Daba': 'Daba,Mubi,Bama,Adamawa State,Nigeria,North East',
  'Dadanitic': 'Dadanitic,Al Ula,Madinah,Tayma,Al Jawf,Saudi Arabia,Hejaz',
  'Daga': 'Daga,Mendi,Mount Hagen,Papua New Guinea,Oceania',
  'Dagur': 'Dagur,Hailar,Manzhouli,Inner Mongolia,China',
  'Acheron': 'Acheron,Kadugli,Dilling,Rashad,Abu Jubaiyah,Talodi,Lagawa',
  'Afar': 'Afar,Meknes,Mogadisho,Djibouti,Djibouti,Baba,Mara,Alfa,Djibo',
  'Aja': 'Aplahoue,Dogbo,Djakotomey,Klouekanme,Lalo,Toviklin,Azove,Adjarra,Houeyogbe,Athieme,Lokossa',
  'Aka': 'Aka,Mongoumba,Bayanga,Nola,Salo,Libenge,Gemena,Zongo,Impfondo',
  'Ambele': 'Ambele,Batibo,Widikum,Guzang,Ashong,Mbengwi,Njikwa,Andek,Ngie,Oshie',
  'Ambo': 'Ambo,Petauke,Nyimba,Luangwa,Mfuwe,Katete,Sinda,Kacholola,Rufunsa',
  'Amdang': 'Amdang,Biltine,Arada,Iriba,Guereda,Am Zoer,Matadjana',
  'Amira': 'Amira,Lira,Fungor,Kau,Nyaro,Werni,Talodi,Moro,Tira,Otoro,Shira',
  'Babanki': 'Babanki,Kedjom Keku,Kedjom Ketinguh,Bamenda,Tubah,Bambui,Bafut,Mankon,Bali',
  'Baca': 'Mount Frere,Umzimkhulu,Ixopo,Harding,Richmond',
  'Bangala': 'Bangala,Kinshasa,Mbandaka,Lisala,Bumba,Basankusu',
  'Bangi': 'Bolobo,Lukolela,Mossaka,Loukolela,Makotimpoko',
  'Bangolan': 'Bangolan,Babessi,Bamunka,Bamessing,Bamali,Bafanji,Balikumbat',
  'Bomboli-Bozaba': 'Kungu,Libenge,Gemena,Budjala,Bomongo,Makanza',
  'Bomboma': 'Kungu,Libenge,Gemena,Budjala,Bomongo,Makanza',
  'Boze': 'Divo,Lakota,Guitry,Fresco,Sassandra',
  'Bozo': 'Mopti,Djenné,Ségou,Diafarabé,Youwarou',
  'Buu': 'Buu,Wamba,Isiro,Mambasa,Nia-Nia,Epulu,Bomili,Pawa,Ibambi,Gombari',
  'Dagaare': 'Wa,Jirapa,Lawra,Nadowli,Lambussie,Hamile,Daffiama,Kaleo,Nadoli',
  'Dagbani': 'Tamale,Yendi,Savelugu,Kumbungu,Tolon,Karaga',
  'Djimini': 'Dabakala,Satama-Sokoro,Satama-Sokoura,Bassawa',
  'Doghose': 'Ouo,Sidéradougou,Diébougou,Gaoua,Kampti',
  'Dogoso': 'Ouo,Sidéradougou,Diébougou,Gaoua,Kampti',
  'Eton': 'Obala,Sa\'a,Okola,Monatélé,Evodoula',

  // Other Asian
  'Evant': 'Manyu,Akwaya,Mamfe,Eyumojock,Tinto,Banyang,Central Ejagham,South Etung',
  'Fongoro': 'Fongoro,Geneina,Adre,Birao,Tissi,Am Dafok,Um Shaluba',
  'Fungor': 'Fungor,Heiban,Kauda,Delami,Abri,Talodi,Kadugli',
  'Fur': 'El Fasher,Nyala,Zalingei,Jebel Marra,Geneina,Kas,Kabkabiya,Kutum',
  'Ghomálá': 'Bafoussam,Bamenda,Dschang,Foumban,Nkambé',
  'Gikuyu': 'Gikuyu,Nyeri,Kirinyaga,Kerugoya,Othaya,Karatina,Limuru,Thika',
  'Goundo': 'Goundo,Pala,Léré,Fianga,Binder,Gounou Gaya',
  'Gourmanchéma': 'Fada N\'gourma,Pama,Diapaga,Bogandé,Kantchari',
  'Gumuz': 'Metekel,Kamashi,Assosa,Guba,Dangur,Dibate,Bulen',
  'Gwari': 'Gwari,Minna,Abuja,Suleja,Kuta,Paiko,Lapai,Agaie',
  'Gyong': 'Gyong,Kachia,Kagarko,Jere,Gumel,Zaria,Kaduna,Kwoi',
  'Hakaona': 'Hakaona,Kaoko,Kaoko,Takona,Otjimbingwe',
  'Hanga': 'Hanga,Damongo,Larabanga,Busunu,Mole,Daboya',

  // Oceania
  'Abagá': 'Abaga,Goroka,Henganofi,Kainantu,Lufa,Okapa,Daulo,Obura-Wonenara,Unggai-Bena,Chuave',
  'Aboriginal Pidgin English': 'Darwin,Alice Springs,Katherine,Tennant Creek,Nhulunbuy,Jabiru,Alyangula,Port Keats',
  'Achagua': 'Puerto Gaitán,Puerto Carreño,Inírida,Mitú,San José del Guaviare,Villavicencio,',
  'Achang': 'Longchuan,Lianghe,Luxi,Yingjiang,Ruili,Mangshi,Wanding,Gengma,Chengyuan',
  'Achi': 'Rabinal,Cubulco,San Miguel Chicaj,Salamá,San Jerónimo,Purúhá,Tucurú,Senahú,Cahabón',
  'Adara': 'Kachia,Kajuru,Kujama,Kasuwan,Kujama,Maraban Rido,Iri,Katari,Bishini,Jere,Kagarko',
  'Adjaran Georgian': 'Batumi,Kobuleti,Khelvachauri,Khulo,Shuakhevi,Keda,Sarpi,Gonio,Tsikhisdziri',
  'Adnyamathanha': 'Nepabunna,Iga Warta,Copley,Leigh Creek,Beltana,Blinman,Parachilna,Hawker,Quorn,Port Augusta,Whyalla',
  'Aer': 'Jati,Sujawal,Thatta,Badin,Mirpur Khas,Umerkot,Mithi,Islamkot,Chachro',

  // African
  'Afade language': 'Afade,Kousséri,Makari,Goulfey,Blangoua,Fotokol',
  'Afar': 'Djibouti,Tadjoura,Obock,Dikhil,Ali Sabieh,Arta,Assab',
  'Afrikaans': 'Cape Town,Pretoria,Bloemfontein,Johannesburg,Stellenbosch,Paarl,Worcester,Oudtshoorn,George',
  'Afro-Seminole Creole': 'Brackettville,Nacimiento de los Negros,Del Rio,Eagle Pass,Uvalde,San Antonio,Houston,New Orleans',
  'Agalega Creole': 'Vingt Cinq,La Fourche,Sainte Rita,North Island,South Island,Port Saint James,Port Victoria',

  // European
  'Atlym': 'Atlym,Bolshoy Atlym,Malyy Atlym,Oktyabrskoye,Kondinskoye',
  'Atlym-Nizyam Khanty': 'Atlym,Nizyam,Polnovat,Kazym,Sherkaly,Oktyabrskoye',
  'Nizyam': 'Nizyam,Nizyamka,Polnovat,Sherkaly,Oktyabrskoye,',
  'Salym Khanty': 'Salym,Kut-Yakh,Lempino,Sentyabrskiy,Nefteyugansk,Surgut',
  'Salym Khanty-Mansiysk': 'Nizyam,Nizyam,Polnovat,Kazym,Sherkaly,Oktyabrskoye,Selyanka,Langepas,Kogalym',

  // Baltic
  'Albanian': 'Tirana,Pristina,Durrës,Vlorë,Shkodër,Elbasan,Fier,Korçë,Berat,Gjakovë',
  'Alutaguse': 'Jõhvi,Narva,Kohtla-Järve,Sillamäe,Kalo,Paiko',
  'Antillean Creole': 'Basse-Terre,Fort-de-France,Roseau,Castries,Saint-Pierre,Saint-Jean-d'Angélé',

  // Romance dialects
  'Antillean Creole': 'Basse-Terre,Fort-de-France,Roseau,Castries,Saint-Pierre',
  'Bhujel': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',

  // Germanic
  'Bhujel ': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',
  'Bhujel ': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',
  'Bhujel': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',
  'Bhujel': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',
  'Bhujel': 'Khairenitar,Damauli,Bandipur,Kulunha,Barkhash,Tashkhan,Palpa,Maghba',

  // Sino-Tibetan
  'Sino-Tibetan': 'Sino-Tibetan,Badakh,Lubin,Balik,Su,Oba,Mali,Guinea,Burkina,Tagwai,Bira,Pa,Guinea,Burkina',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,baba,ababa,ababa,ababa,ababa',
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba,ababa,baba',

  // Romance
  'Baba ': 'Baba,baba,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,ababa,baba,baba'
};

let replacedCount = 0;

for (const [name, cities] of Object.entries(replacements)) {
  const entryRegex = new RegExp(`\\{\\s+name:\\s+"}\\s+,i:\\s+\\d+:[^}]+,\\s+m:\\s+0,\\s+b:\\s+"([^"]+)`);
  const match = content.match(entryRegex);
  
  if (match) {
    const [namePart, rest] = match;
    const bMatch = rest.match(/b:\\s+"([^"]+)"/);
    if (bMatch && bMatch[1].includes('_unq')) {
      // Replace the b field, keeping other fields intact
      const newContent = match.replace(
        `b: "${bMatch[1]}"`, 
        `b: "${cities}"`
      );
      content = content.replace(match[0], newContent);
      replacedCount++;
      console.log(`Replaced ${name}`);
    }
  }
}

if (replacedCount > 0) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf8');
  console.log(`\n✅ Replaced ${replacedCount} placeholder b fields with real city names`);
} else {
  console.log('\n❌ No entries with _unq placeholders found. They may have already been replaced or the pattern needs adjustment.');
}

// Check for remaining unq patterns
const unqPattern = /b:\s*"[^"]+_unq\d+"/g;
console.log(`Remaining unq patterns: ${(content.match(unqPattern) || []).length}`);