const fs = require('fs');

const cityReplacements = {
  // Korean / Han languages
  'han-samhan': 'Seoul,Busan,Daegu,Incheon,Gwangju,Daejeon,Ulsan,Goyang,Seongnam,Suwon',

  // Armenian varieties
  'hayeren_modern': 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavar,Ararat,Ashtarak,Ijevan',
  'hayeren_modern_western': 'Istanbul,Izmir,Bursa,Antalya,Adana,Konya,Mersin,Gaziantep,Ankara,Trabzon',
  'hayeren_old_cilician': 'Adana,Mersin,Antalya,Tarsus,Anamur,Silifke,Kozan,Kadirli,Osmaniye,Feke',

  // Japanese / Ainu languages
  'kuril-ainu': 'Sapporo,Hakodate,Kushiro,Obihiro,Asahikawa,Tomakomai,Kitami,Muroran,Kitahiroshima,Ebetsu',
  'kuril-dialects': 'Sapporo,Obihiro,Kushiro,Hakodate,Asahikawa,Tomakomai,Chitose,Kitami,Muroran,Iwamizawa',

  // Khanty dialects (Russia)
  'northern-khanty': 'Surgut,Nizhnevartovsk,Langepas,Megion,Kogalym,Pyt-Yakh,Krasnoleninsk,Nefteyugansk,Novy Urengoy,Pokachi',
  'southern-khanty': 'Khanty-Mansiysk,Uray,Nyagan,Sovetsky,Yugorsk,Kondinskoye,Megion,Langepas,Pyt-Yakh',
  'sherkal': 'Sherkaly,Kondinskoye,Pelim,Lozva,Sosva,Ivdel,Gari,Verkhoturye,Tavda',
  'upper-demjanka': 'Demjanka,Ust-Demjanka,Tara,Tukalin,Kalachinsk,Muravlenko,Noyabrsk,Pyt-Yakh',
  'surgut-khanty': 'Surgut,Nizhnevartovsk,Langepas,Megion,Kogalym,Pyt-Yakh,Krasnoleninsk',
  'malij-jugan': 'Malij-Jugan,Megion,Nefteyugansk,Krasnoleninsk,Pokachi,Pyt-Yakh',
  'tremjugan': 'Tremjugan,Nefteyugansk,Krasnoleninsk,Surgut,Langepas,Kogalym',

  // Niger-Congo: Bantu
  'lusoga': 'Jinja,Iganga,Kamuli,Bugiri,Mayuge,Namayingo,Luuka,Buyende,Bukedea,Kaliro',

  // Niger-Congo: Songhai
  'tasawaq': 'Agadez,Arlit,Bilma,Dirkou,Iferouane,Madama,Tahoua,Tchintabaraden',
  'tagdal': 'Tahoua,Tchintabaraden,Madaoua,Bouza,Abalak,Keita,Illela,Mayahi',

  // Niger-Congo: Talodi
  'talodi': 'Talodi,Kadugli,Muglad,Abyei,Kalog,Dilling,Bashiri,Soderi',

  // Niger-Congo: Tegali
  'tegali': 'Rashad,Tagoi,Kadugli,Talodi,Muglad,Kalog,Dilling,Bashiri',

  // Niger-Congo: Tegem
  'tegem': 'Kadugli,Talodi,Rashad,Tagoi,Dilling,Kalog,Muglad,Abyei',

  // Niger-Congo: Tima
  'tima': 'Kadugli,Talodi,Rashad,Tagoi,Dilling,Muglad,Kalog,Bashiri',

  // Niger-Congo: Tembo
  'tembo': 'Bukavu,Goma,Uvira,Butembo,Kalemie,Kindu,Kisangani,Beni,Rutshuru,Masisi',

  // Niger-Congo: Tocho
  'tocho': 'Rashad,Kadugli,Talodi,Kalog,Dilling,Muglad,Abyei,Tagoi',

  // Niger-Congo: Tumtum
  'tumtum': 'Rashad,Kadugli,Talodi,Kalog,Dilling,Muglad,Tagoi,Bashiri',

  // Niger-Congo: Tetserret
  'tetserret': 'Agadez,Arlit,Bilma,Dirkou,Iferouane,Madama,Tahoua,In Gall',

  // Niger-Congo: Berber
  'zenati-berber': 'Tlemcen,Mascara,Oran,Sidi Bel Abbès,Mostaganem,Chlef,Relizane,Tiaret,Saida,Ain Defla',

  // Dravidian: Koya
  'koya': 'Bhadrachalam,Kothagudem,Manuguru,Palvancha,Chinturu,Kunavaram,Venkatapuram,Chintalapudi,Dornakal,Yellandu',

  // Niger-Congo: Languages starting with K
  'kvx': 'Taveta,Mombasa,Malindi,Lamu,Kilifi,Voi,Mwatate,Wundanyi,Mariakani,Taita',
  'kxu': 'Bakel,Mbao,Salémata,Kédougou,Saraya,Kidira,Matam,Ouro Sogui,Diam Diabo,Bakel',
  'kyaka': 'Goroka,Kainantu,Kundiawa,Mendi,Mt Hagen,Wabag,Chimbu,Jiwaka,Hela,Enga',
  'kyowa-go': 'Sapporo,Obihiro,Asahikawa,Kushiro,Kitami,Hakodate,Tomakomai,Chitose,Muroran,Kitahiroshima',
  'kyv': 'Nairobi,Mombasa,Kisumu,Nakuru,Eldoret,Mombasa,Kisii,Meru,Thika,Nyeri',
  'kyw': 'Makurdi,Abakaliki,Enugu,Owerri,Awka,Umuahia,Oturkpo,Nsukka,Okigwe,Onitsha',
  'kzi': 'Sokoto,Kano,Kaduna,Zaria,Bauchi,Jos,Maiduguri,Makurdi,Benin,Abeokuta',

  // Niger-Congo: Languages starting with L
  'l-ngua-geral-paulista': 'São Paulo,Campinas,São Bernardo do Campo,Santo André,São José dos Campos,Sorocaba,Santos,Osasco,Ribeirão Preto,São José do Rio Preto',
  'laal': 'Doba,Moyen-Chari,Logone,Chari,Laï,Mandoul,Mayo-Kebbi,Salamat,Guéra,Kémo',
  'labrador-inuit-pidgin-french': 'St. John\'s,Corner Brook,Gander,Grand Falls-Windsor,Happy Valley-Goose Bay,Labrador City,Wabush,Port aux Basques,Marystown,Carbonear',
  'lachi': 'Ha Giang,Dien Bien Phu,Lao Cai,Lai Chau,Son La,Yen Bai,Bac Kan,Cao Bang,Tuyen Quang,Lang Son',
  'laha': 'Ha Giang,Bac Kan,Cao Bang,Tuyen Quang,Lang Son,Yen Bai,Thai Nguyen,Vinh Phuc,Phu Tho,Bac Giang',
  'lahu': 'Chiang Mai,Mae Hong Son,Chiang Rai,Tak,Kamphaeng Phet,Lampang,Lamphun,Nan,Phayao,Phrae',
  'laiuse-romani': 'Tartu,Valga,Võru,Põlva,Jõgeva,Viljandi,Pärnu,Rakvere,Kuressaare,Narva',
  'lakota': 'Pine Ridge,Rapid City,Chamberlain,Mobridge,Mitchell,Pierre,Yankton,Sioux Falls,Watertown,Aberdeen',
  'lampung': 'Bandar Lampung,Metro,Pesawaran,Pringsewu,South Lampung,Tanggamus,West Lampung,Tanggamus,Way Kanan,Way Panji',
  'land-dayak': 'Kuching,Sibu,Bintulu,Miri,Sarikei,Sri Aman,Kapit,Betong,Marudi,Limbang',
  'lanping-bai-dialect': 'Dali,Lijiang,Shangri-La,Xiaguan,Heqing,Jianchuan,Eryuan,Yunlong,Binchuan,Midu',

  // Niger-Congo: Languages starting with T
  'tura': 'Doha,Al Wakrah,Al Khor,Dukhan,Al Rayyan,Mesaieed,Shahaniya,Umm Salal,Lusail,Al Daayen',

  // Other Niger-Congo languages
  'kwoma-manambu-pidgin': 'Ambunti,Wewak,Maprik,Yangoru,Boram,Bitapaka,Madang,Rabaul,Kokopo,Lae',
  'kyakhta-russian-chinese-pidgin': 'Kyakhta,Ulan-Ude,Chita,Irkutsk,Ulaanbaatar,Erlian,Troitskosavsk,Selenginsk,Gusinoozersk,Zakamensk',
  'hayu': 'Gwangju,Bucheon,Gunpo,Uiwang,Hwaseong,Osan,Yongin,Pyeongtaek,Dongducheon,Paju',
  'ber-family': 'Agadir,Casablanca,Fès,Marrakech,Tanger,Meknès,Oujda,Kénitra,Rabat,Salé',
};

let replacementsMade = 0;
const originalContent = fs.readFileSync('modules/namebases-real.js', 'utf-8');
let content = originalContent;

// Count replacements per language
const replacementCounts = {};

for (const [languagePattern, cityNames] of Object.entries(cityReplacements)) {
  // Match pattern: languagePattern_XXXXX_unqN where XXXXX is 5 digits and N is 1-12
  const regex = new RegExp(`${languagePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\d{5}_unq\\d+`, 'g');

  const matches = content.match(regex);
  if (matches && matches.length > 0) {
    content = content.replace(regex, cityNames);
    replacementsMade += matches.length;
    replacementCounts[languagePattern] = matches.length;
    console.log(`✓ Replaced ${matches.length} occurrences of ${languagePattern}`);
  } else {
    console.log(`✗ No matches for ${languagePattern}`);
  }
}

console.log(`\nTotal replacements made: ${replacementsMade}`);

// Verify remaining unq patterns
const remainingUnq = (content.match(/_unq\d+/g) || []).length;
console.log(`\nRemaining _unq patterns: ${remainingUnq}`);

if (content !== originalContent) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf-8');
  console.log('\n✓ File updated successfully!');
} else {
  console.log('\n✗ No changes made to file');
}

// Summary by language
console.log('\nReplacement summary:');
const sortedCounts = Object.entries(replacementCounts).sort((a, b) => b[1] - a[1]);
for (const [lang, count] of sortedCounts) {
  console.log(`  ${lang}: ${count} replacements`);
}