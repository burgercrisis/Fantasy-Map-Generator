const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const replacements = {
  // Northeast Caucasian languages (nic-GH)
  'Gyeonggi-Seoul Dialect': 'Seoul,Busan,Daegu,Gwangju,Ulsan,Incheon,Goyang,Daejeon,Pohang,Jeonju,Mokpo,Suwon,Jinju',
  'Gyeongsang Dialect': 'Gyeongsan,Changwon,Sacheon,Gimcheon,Hapcheon,Yeongju,Uiseong,Sangju,Pohang,Mokpo',
  'Han-Samhan': 'Yancheng,Jinzhong,Linfen,Wenshui,Changzhi,Qinshui,Pingluo,Zhashui,Qinxi,Pingluo',
  'Gyeonggi': 'Gyeonggi,Seoul,Busan,Daegu,Gwangju,Incheon,Suwon,Incheon,Goyang,Ulsan,Mokpo',
  'Gyeongsang': 'Gyeongsang,Changwon,Sacheon,Gimcheon,Hapcheon,Yeongju,Uiseong,Sangju,Pohang',
  'Gyeongsan-Dialect': 'Gyeongsan,Changwon,Sacheon,Gimcheon,Hapcheon,Yeongju,Uiseong,Sangju,Pohang,Gwanju,Busan',
  'Hamtai': 'Hamtai,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju,Busan',
  'Hani': 'Hani,Jinju,Busan,Daegu,Gwangju,Ulsan,Incheon,Goyang,Pohang,Mokpo,Suwon',
  'Hausa': 'Hausa,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju',
  'Hawai': 'Hawai,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju,Busan',
  'Hau': 'Hau,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju,Busan',
  'Haya': 'Haya,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju,Busan,Daejeon',
  'Kyaka': 'Kyaka,Gyeonggi,Seoul,Busan,Daegu,Gwangju,Incheon,Ulsan,Mokpo',
  'Kywai': 'Kywai,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju',
  'Kyaha': 'Kyaha,Yantai,Gwangju,Daejeon,Bucheon,Seongnam,Sacheon,Pohang,Jinju,Busan',
  'Kuril-Ain': 'Kuril-Ain,Achinsk,Barnaul,Novokuznetsk,Tomsk,Prokopievsk,Kuznetsk,Leninsk-Kuznetsky',
  'Kwaral': 'Kwaral,Bishini,Kafanchan,Zonkwa,Fadan,Kuje,Gidan Waya,Gidan Tagwai,Mabushi,Fadan Kaje',
  'Kwajabi': 'Kwajabi,Bishini,Kafanchan,Zonkwa,Fadan,Kuje,Gidan Waya,Gidan Tagwai,Mabushi',
  'Lakhti': 'Lakhti,Kazan,Kazakh,Almaty,Shymkent,Uskud,Kyzylorda,Zhambyl,Aqtau,Sayram',
  'Lanping': 'Lanping,Chengdu,Mianyang,Chongqing,Yibin,Nanchong,Guangyuan,Deyang,Zigong',
  'Lezghi': 'Lezghi,Urumqi,Qiqiye,Hotan,Kuqa,Shufu,Alta,Luntai,Dushanzi,Qarqay',
  'Nanchuan': 'Nanchuan,Chengdu,Zigong,Leshan,Deyang,Yibin,Chengdu,Guangyuan,Dujiangyan,Yaan,Neijiang',
  'Nimni': 'Nimni,Yingi,Kuitun,Kuitun,Ulaan,Hotan,Urumqi,Aksu,Artux,Alagha,Qoqek',
  'Sary-Uighur': 'Sary-Uighur,Aralsk,Kumul,Kashgar,Hotan,Kashgar,Kucha,Qizilsu,Yopurga,Poskam,Kashgar',
  'Shartchin': 'Shartchin,Yining,Hotan,Korla,Kucha,Qarqay,Akqi,Kuqa,Bayan,Segen,Kucha',
  'Shigha': 'Shigha,Tacheng,Qitai,Qira,Shufu,Kuqa,Bayan,Nazilati,Bayan,Hotan,Kuqa',
  'Shirwal': 'Shirwal,Akqi,Kuqa,Nazilati,Bayan,Hotan,Korla,Kucha,Qirgho,Sayram,Yengisar',

  // Armenian varieties (nic-GH)
  'Armenian': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavar,Goris,Hrazdan,Ijevan,Dilijan,Noyemberyan',
  'Modern Armenian': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavar,Goris,Hrazdan,Ijevan,Dilijan,Noyemberyan',
  'Modern Eastern Armenian': 'Yerevan,Sevan,Gyumri,Tavush,Artik,Goris,Armavir,Masisi,Vagharshapat,Kapan,Ashtarak',
  'Old Cilician Armenian': 'Adana,Tarsus,Mersin,Erzurum,Kayseri,Sivas,Erzincan,Siverek,Kars,Elazığ,Yozgat,Divriği',
  
  // Other Turkic varieties (nic-TR, nic-AZ, nic-KZ)
  'Kipchak': 'Kipchak,Aktobe,Taraz,Aqtau,Balkhash,Ust-Kamenogorsk,Aktobe,Karaganda,Aktobe,Shu',
  'Kyrgyz': 'Bishkek,Osh,Tokmok,Karakol,Jalal-Abad,Naryn,Talas,Issyk-Kul,Osh,Przheval',
  'Ottoman Turkish': 'Istanbul,Edirne,Izmir,Bursa,Konya,Antalya,Gaziantep,Adana,Trabzon,Samsun,Diyarbakır,Mersin',
  'Siberian Tatar': 'Kazan,Naberezhnye,Chelyabinsk,Tyumen,Omsk,Tobolsk,Kurgan,Tyumen,Novosibirsk',
  'Turkish': 'Ankara,Istanbul,Izmir,Bursa,Antalya,Adana,Trabzon,Mersin,Gaziantep,Şanlıurfa,Konya,Samsun',
  'Turkmen': 'Ashgabat,Turkmenbashi,Derbent,Istanbul,Ankara,Bursa,Izmir,Konya,Antalya',

  // Other language groups
  'Castilian': 'Madrid,Toledo,Salamanca,Ávila,Burgos,León,Zamora,Valladolid,Segovia,Soria,Zamora',
  'Old Catalan': 'Barcelona,Girona,Tarragona,Lleida,Tortosa,Vic,Manresa,Urgell,Empúries,Besalú',
  'Old Gallo-Romance': 'Paris,Lyon,Marseille,Toulouse,Nice,Nantes,Montpellier,Strasbourg,Bordeaux,Lille',
  'Old Leonese': 'León,Zamora,Salamanca,Astorga,Ponferrada,Benavente,Cangas del Narcea,Oviedo,Xixón',
  'Old Lombard': 'Milan,Milano,Monza,Busto Arsizio,Legnano,Rho,Saronno,Magenta,Abbiategrasso,Varese',
  'Old Catalan-Catalan': 'Barcelona,Girona,Tarragona,Lleida,Perpignan,Roses,Figueres,Palamós',
  'Provencal-Catalan': 'Perpignan,Barcelona,Andorra,Figueres,La Seu d\'Urgell',

  // Historical/constructed languages
  'Latin': 'Roma,Venetia,Trieste,Milano,Firenze,Livorno,Ancona,Genova,Napoli,Bari,Palermo',
  'Sanskrit': 'Varanasi,Delhi,Mumbai,Kolkata,Chennai,Pune,Patna,Haridwar,Prayagraj,Ayodhya,Lucknow',
  'Ancient Greek': 'Athens,Thessaloniki,Patras,Larissa,Heraklion,Volos,Sparta,Corinth,Nafpaktos,Piraeus',

  // Arabic dialects
  'Cairene Arabic': 'Cairo,Alexandria,Giza,Luxor,Asyut,Aswan,Port Said,Helwan,Mansoura,Tanta',
  'Damascus Arabic': 'Damascus,Aleppo,Homs,Latakia,Tartus,Hama,Idlib,Dara\'a,Palmyra',
  'Modern Standard Arabic': 'Cairo,Riyadh,Jeddah,Damascus,Amman,Tripoli,Baghdad,Sharjah,Doha,Manama',
};

let replacedCount = 0;

for (const [name, cities] of Object.entries(replacements)) {
  // Find and replace exact match for name with d field containing any placeholder value
  const regex = new RegExp(`\\{\\s+name:\\s+"${name}"\\s+,i:\\s+\\d+:[^}]+,\\s+m:\\s+0,\\s+b:\\s+"([^"]*unq\\d+|[^"]*modern[^"]*|[^"]*ancient[^"]*|[^"]*proto[^"]*|[^"]*old[^"]*|[^"]+_[^"]*_[^"]*unq\\d+|[^"]+mod[^"]*_\\s*)", "\\s+");
  
  const occurrences = content.match(regex);
  
  if (occurrences) {
    content = content.replace(regex, (match, cities) => {
      replacedCount++;
      console.log(`Replaced: ${name}`);
      return match.replace(/,\\s*b:\\s+"[^"]+"/g, ` b: "${cities}"`);
    });
  }
}

if (replacedCount > 0) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf8');
  console.log(`\n✅ Replaced ${replacedCount} placeholder b values`);
} else {
  console.log('\n❌ No placeholders found - may already be replaced');
}

// Check for remaining unq/modern/ancient/proto/old patterns
const unqPattern = /\b:\s*"[^"]+unq\d+"/g;
const modernPattern = /\b:\s*"[^"]+mod[^"]*"_unq\d+"/g;
const ancientPattern = /\b:\s*"[^"]+anc[^"]*"_unq\d+"/g;
const protoPattern = /\b:\s*"[^"]+pro[^"]*"_unq\d+"/g;
const oldPattern = /\b:\s*"[^"]+old[^"]*"_unq\d+"/g;

console.log('\n📊 Remaining placeholder patterns:');
console.log(`unq:`, (content.match(unqPattern) || []).length);
console.log(`modern:`, (content.match(modernPattern) || []).length);
console.log(`ancient:`, (content.match(ancientPattern) || []).length);
console.log(`proto:`, (content.match(protoPattern) || []).length);
console.log(`old:`, (content.match(oldPattern) || []).length);
