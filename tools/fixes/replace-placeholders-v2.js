const fs = require('fs');

let content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const replacements = {
  // Northeast Caucasian languages (nic-GH)
  'Gyeonggi-Seoul Dialect': 'Seoul,Gyeongji,Ulsan,Bucheon,Ansan,Gwangju,Andong,Yangju,Gwangju,Iksan,Jeonju,Gyeongju,Gwangju',
  'Gyeongsang Dialect': 'Gyeongsan,Daegu,Chuncheon,Andong,Ulsan,Gwangju,Gyeongju,Chuncheon,Ulsan,Gwangju',
  'Han-Samhan': 'Yancheng,Jinzhong,Linfen,Wenshui,Changzhi,Qinshui,Pingluo,Zhashui,Qingxi,Qinghai',
  'Hani': 'Hani,Urumqi,Qumul,Aksu,Kuqa,Kashgar,Khotan,Mi,Qitai,Turpan,Kuqa',

  // Armenian varieties (nic-GH)
  'Modern Armenian': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Shirak,Hrazdan,Ijevan,Dilijan,Noyemberyan',
  'Modern Western Armenian': 'Istanbul,Izmir,Ankara,Mersin,Gaziantep,Antakya,Kayseri,Sivas,Diyarbakır,Erzurum,Kars',
  'Old Cilician Armenian': 'Adana,Tarsus,Mersin,Antakya,Kayseri,Diyarbakır,Erzurum,Gyumri,Yerevan,Van',

  // Turkic (nic-TR, nic-AZ, nic-KZ, nic-TR, etc.)
  'Azerbaijani': 'Baku,Ganja,Yevlakh,Sumgait,Lankaran,Mingachevir,Shaki,Bilesuvar,Shirvan,Stad',
  'Turkish': 'Istanbul,Ankara,Izmir,Bursa,Antalya,Konya,Adana,Diyarbakır,Samsun,Trabzon,Kayseri',
  'Azeri': 'Baku,Ganja,Sumgait,Shaki,Yevlakh,Lankaran,Mingachevir,Bilesuvar,Stad,Quba,Xankendi,Salyan',
  'Turkmen': 'Ashgabat,Tejen,Ashkhabad,Türkmenabat,Shaki,Bayburt,Hasar,Bilecik,Uchisar,Kızılkoy',
  'Karakalpak': 'Karakalpak,Bozüyük,Tarsus,Karsus,Siverek,Erzurum,Kayseri,Rize,Trabzon,Giresun,Rize',
  'Kurmanji': 'Kurmanji,Karakalpak,Büyükçorak,Tarsus,Karsus,Erzurum,Rize,Trabzon,Giresun,Erzurum,Karsus',
  'Laz': 'Laz,Gaziantep,Aşkale,Mersin,Mus,Muğla,Isparta,Erzurum,Bodrum,Kaş,Antalya,Muğla',
  'Sivas': 'Sivas,Tokat,Niksar,Sivas,Erzurum,Kayseri,Tokat,Amasya,Tokat,Yozgat,Erbaa',
  'Trabzon': 'Trabzon,Tokat,Samsun,Giresun,Bayburt,Gümüşhane,Gümüşhane,Rize,Erzurum,Ispir,Of,Arhavi',
  'Zaza': 'Zaza,Aşkale,Siverek,Sivas,Erzurum,Kayseri,Tokat,Divriği,Bitlis,Ahlat,Kars,Siğ',

  // Spanish varieties (es-ES)
  'Castilian': 'Madrid,Barcelona,Valencia,Sevilla,Zaragoza,Málaga,Murcia,Bilbao,Santander,Oviedo,Valladolid',
  'Old Catalan': 'Barcelona,Girona,Tarragona,Lleida,Tortosa,Vic,Manresa,Urgell,Empúries,Besalú',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice,Bordeaux,Montpellier,Strasbourg,Limoges,Tours',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente,Cangas del Narcea,Oviedo,Xixón,Avilés,Mieres',

  // French varieties (ro-FR, oc-FR)
  'Old Catalan': 'Barcelona,Girona,Tarragona,Lleida,Tortosa,Vic,Manresa,Urgell,Empúries,Besalú',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice,Bordeaux,Montpellier,Strasbourg',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente,Cangas del Narcea,Oviedo,Xixón,Avilés,Mieres',
  'Old Lombard': 'Milan,Monza,Busto Arsizio,Legnano,Rho,Saronno,Magenta,Abbiategrasso',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice,Bordeaux,Montpellier,Strasbourg',

  // Italian varieties (it-IT, ro-IT)
  'Old Lombard': 'Milan,Monza,Busto Arsizio,Legnano,Rho,Saronno,Magenta,Abbiategrasso',
  'Castilian': 'Madrid,Toledo,Salamanca,Ávila,Segovia,Ávila,Zamora,Cangas del Narcea,Oviedo',
  'Tuscan': 'Florence,Prato,Livorno,Arezzo,Pistoia,Pisa,Lucca,Grosseto,Massa,Carrara,Viareggio,Siena',

  // Germanic (gm-DE, gm-FR, gm-AT)
  'Old Frankish': 'Frankfurt,Munich,Hamburg,Cologne,Nuremberg,Stuttgart,Würzburg,Düsseldorf,Leipzig,Hannover,Bremen,Dortmund',

  // Other romance languages
  'Portuguese': 'Lisbon,Porto,Coimbra,Braga,Évora,Faro,Setúbal,Aveiro,Viseu,Guarda',
  'Provençal': 'Marseille,Aix-en-Provence,Arles,Toulon,Avignon,Digne-les-Bains,Gap,Nice',
  'Sicilian': 'Palermo,Catania,Messina,Syracuse,Marsala,Gela,Ragusa,Trapani,Caltanissetta,Agrigento,Bagheria,Modica',
  'Sardinian': 'Cagliari,Sassari,Quartu Sant\'Elena,Olbia,Alghero,Nuoro,Oristano,Selargius,Carbonia,Iglesias,Macomer,Bosa',
  'Corsican': 'Ajaccio,Bastia,Porto-Vecchio,Bonifacio,Calvi,Corte,Propriano,Sartène,Ghisonaccia,L\'Île-Rousse,Borgo,Biguglia,Corte',
  'Corsican': 'Ajaccio,Bastia,Porto-Vecchio,Bonifacio,Calvi,Corte,Propriano,Sartène,Ghisonaccia,L\'Île-Rousse,Borgo,Biguglia,Corte',

  // Historical languages
  'Latin': 'Roma,Napoli,Firenze,Torino,Milano,Venezia,Vicenza,Padova,Trieste,Rimini,Bologna,Ravenna',
  'Ancient Greek': 'Athens,Thessaloniki,Corinth,Patra,Larissa,Volos,Iraklion,Chania,Heraklion,Mytilene,Kalamata,Syracuse',
  'Old Church Slavonic': 'Velikiy Novgorod,Kiev,Novgorod,Chernihiv,Minsk,Polatsk,Mogilev,Grodno,Lida,Smolensk,Vitebsk',

  // Celtic languages
  'Old Irish': 'Dublin,Belfast,Cork,Limerick,Galway,Waterford,Drogheda,Kilkenny,Sligo,Wexford,Navan,Ennis',
  'Old Welsh': 'Caerdydd,Swansea,Cardiff,Caernarfon,Newport,Aberystwyth,Chester,Newport,Wrexham,Shrewsbury',
  'Old Breton': 'Rennes,Nantes,Saint-Brieuc,Brest,Quimper,Vannes,Quimper,Redon,Lorient,Vitré,Morlaix',
  'Old Cornish': 'Truro,Penzance,St Ives,Helston,Redruth,St Just in Roseland,Launceston,Penzance,Perranporth,Camborne',

  // Germanic
  'Old Norse': 'Oslo,Bergen,Trondheim,Stavanger,Ålesund,Tromsø,Bergen,Stavanger,Kristiansand,Haugesund',
  'Old English': 'London,York,Winchester,Canterbury,Exeter,Gloucester,Worcester,Leeds,Nottingham,Hull,Lincoln,Bristol',
  'Old High German': 'Cologne,Mainz,Frankfurt,Würzburg,Nuremberg,Augsburg,Regensburg,Darmstadt,Heidelberg,Mannheim,Würzburg,Speyer',

  // Other
  'Aramaic': 'Aleppo,Homs,Aleppo,Beirut,Damascus,Hama,Aleppo,Homs,Beirut,Tartus,Latakia',
  'Coptic': 'Cairo,Alexandria,Luxor,Asyut,Minya,Sohag,Qena,Luxor,Fayyum,Dakahlia,Beheira',
  'Ge\'ez': 'Ge\'ez,Tigray,Axum,Mek\'ele,Debre Markos,Mai Negele,Debre Zeit,Adigrat,Adwa,Mek\'ele,Senbet',
  'Sogdian': 'Sogdiana,Bukhara,Nishapur,Samarkand,Balkh,Merv,Qarshi,Paykend,Baykand,Marmul,Navoi'
};

let replacedCount = 0;

for (const [name, cities] of Object.entries(replacements)) {
  // Try to match in various ways to handle encoding issues
  const patterns = [
    new RegExp(`\\{\\s+name:\\s+"${name.replace(/[.*?()]/g, '\\$&')"[^}]+b:\\s+"([^"]+)"`, 's'),
    new RegExp(`\\{\\s+name:\\s+"${name.replace(/[.*?()]/g, '\\$&')"[^}]+b:\\s+"([^"]+)"`, 's'),
    new RegExp(`\\{\\s+name:\\s+"${name.replace(/[.*?()]/g, '\\$&')"[^}]+,\\s+m:\\s+0,\\s+b:\\s+"([^"]+)"`, 's')
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, (match, placeholderCities, actualCities) => {
        // Keep the first actual city name, replace the placeholder pattern
        const cities = placeholderCities.split(',').map(c => c.trim());
        const firstCity = cities[0];
        return match.replace(`b: "${placeholderCities}"`, `b: "${actualCities}"`);
      });
      replacedCount++;
      console.log(`Replaced: ${name}`);
      break; // Don't try other patterns for this name
    }
  }
}

if (replacedCount > 0) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf8');
  console.log(`\n✅ Replaced ${replacedCount} language entries`);
} else {
  console.log('\n❌ No replacements made - check encoding/pattern matching');
}

// Check for remaining patterns
const unqPattern = /\{\s+name: \S+[^\}]+,\s+i: \d+,\s+min: 4,\s+max: 11,\s+d: "[^"]+,\s+m: 0,\s+b:\s+"[^"]*_unq\d+"/g;
const modernPattern = /\{\s+name: \S+[^\}]+,\s+i: \d+,\s+min: 4,\s+max: 11,\s+d: "[^"]+,\s+m: 0,\s+b:\s+"[^"]+_[^\"]+unq\d+"/g;
const ancientPattern = /\{\s+name: \S+[^\}]+,\s+i: \d+,\s+min: 4,\s+max: 11,\s+d: "[^"]+,\s+m: 0,\s+b:\s+"[^"]+ancient[^"]+unq\d+"/g;
const protoPattern = /\{\s+name: \S+[^\}]+,\s+i: \d+,\s+min: 4,\s+max: 11,\s+d: "[^"]+,\s+m: 0,\s+b:\s+"[^"]+proto[^"]+unq\d+"/g;
const oldPattern = /\{\s+name: \S+[^\}]+,\s+i: \d+,\s+min: 4,\s+max: 11,\s+d: "[^"]+,\s+m: 0,\s+b:\s+"[^"]+old[^"]+unq\d+"/g;

console.log('\n📊 Remaining placeholder patterns:');
console.log('unq:', (content.match(unqPattern) || []).length);
console.log('modern:', (content.match(modernPattern) || []).length);
console.log('ancient:', (content.match(ancientPattern) || []).length);
console.log('proto:', (content.match(protoPattern) || []).length);
console.log('old:', (content.match(oldPattern) || []).length);