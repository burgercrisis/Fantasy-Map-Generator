const fs = require('fs');

const cityReplacements = [
  // Korean / Han languages
  { pattern: /han-samhan_\d{5}_unq\d+/g, cities: 'Seoul,Busan,Daegu,Incheon,Gwangju,Daejeon,Ulsan,Goyang,Seongnam,Suwon' },

  // Armenian varieties
  { pattern: /hayeren_modern_\d{5}_unq\d+/g, cities: 'Yerevan,Gyumri,Vanadzor,Abovyan,Kapan,Armavir,Gavar,Ararat,Ashtarak,Ijevan' },
  { pattern: /hayeren_modern_western_\d{5}_unq\d+/g, cities: 'Istanbul,Izmir,Bursa,Antalya,Adana,Konya,Mersin,Gaziantep,Ankara,Trabzon' },
  { pattern: /hayeren_old_cilician_\d{5}_unq\d+/g, cities: 'Adana,Mersin,Antalya,Tarsus,Anamur,Silifke,Kozan,Kadirli,Osmaniye,Feke' },

  // Japanese / Ainu languages
  { pattern: /kuril-ainu_\d{5}_unq\d+/g, cities: 'Sapporo,Hakodate,Kushiro,Obihiro,Asahikawa,Tomakomai,Kitami,Muroran,Kitahiroshima,Ebetsu' },
  { pattern: /kuril-dialects_\d{5}_unq\d+/g, cities: 'Sapporo,Obihiro,Kushiro,Hakodate,Asahikawa,Tomakomai,Chitose,Kitami,Muroran,Iwamizawa' },

  // Khanty dialects (Russia)
  { pattern: /northern-khanty_\d{5}_unq\d+/g, cities: 'Surgut,Nizhnevartovsk,Langepas,Megion,Kogalym,Pyt-Yakh,Krasnoleninsk,Nefteyugansk,Novy Urengoy,Pokachi' },
  { pattern: /southern-khanty_\d{5}_unq\d+/g, cities: 'Khanty-Mansiysk,Uray,Nyagan,Sovetsky,Yugorsk,Kondinskoye,Megion,Langepas,Pyt-Yakh' },
  { pattern: /sherkal_\d{5}_unq\d+/g, cities: 'Sherkaly,Kondinskoye,Pelim,Lozva,Sosva,Ivdel,Gari,Verkhoturye,Tavda' },
  { pattern: /upper-demjanka_\d{5}_unq\d+/g, cities: 'Demjanka,Ust-Demjanka,Tara,Tukalin,Kalachinsk,Muravlenko,Noyabrsk,Pyt-Yakh' },
  { pattern: /surgut-khanty_\d{5}_unq\d+/g, cities: 'Surgut,Nizhnevartovsk,Langepas,Megion,Kogalym,Pyt-Yakh,Krasnoleninsk' },
  { pattern: /malij-jugan_\d{5}_unq\d+/g, cities: 'Malij-Jugan,Megion,Nefteyugansk,Krasnoleninsk,Pokachi,Pyt-Yakh' },
  { pattern: /tremjugan_\d{5}_unq\d+/g, cities: 'Tremjugan,Nefteyugansk,Krasnoleninsk,Surgut,Langepas,Kogalym' },

  // Niger-Congo: Bantu
  { pattern: /lusoga_\d{5}_unq\d+/g, cities: 'Jinja,Iganga,Kamuli,Bugiri,Mayuge,Namayingo,Luuka,Buyende,Bukedea,Kaliro' },

  // Niger-Congo: Songhai
  { pattern: /tasawaq_\d{5}_unq\d+/g, cities: 'Agadez,Arlit,Bilma,Dirkou,Iferouane,Madama,Tahoua,Tchintabaraden' },
  { pattern: /tagdal_\d{5}_unq\d+/g, cities: 'Tahoua,Tchintabaraden,Madaoua,Bouza,Abalak,Keita,Illela,Mayahi' },

  // Niger-Congo: Talodi
  { pattern: /talodi_\d{5}_unq\d+/g, cities: 'Talodi,Kadugli,Muglad,Abyei,Kalog,Dilling,Bashiri,Soderi' },

  // Niger-Congo: Tegali
  { pattern: /tegali_\d{5}_unq\d+/g, cities: 'Rashad,Tagoi,Kadugli,Talodi,Muglad,Kalog,Dilling,Bashiri' },

  // Niger-Congo: Tegem
  { pattern: /tegem_\d{5}_unq\d+/g, cities: 'Kadugli,Talodi,Rashad,Tagoi,Dilling,Kalog,Muglad,Abyei' },

  // Niger-Congo: Tima
  { pattern: /tima_\d{5}_unq\d+/g, cities: 'Kadugli,Talodi,Rashad,Tagoi,Dilling,Muglad,Kalog,Bashiri' },

  // Niger-Congo: Tembo
  { pattern: /tembo_\d{5}_unq\d+/g, cities: 'Bukavu,Goma,Uvira,Butembo,Kalemie,Kindu,Kisangani,Beni,Rutshuru,Masisi' },

  // Niger-Congo: Tocho
  { pattern: /tocho_\d{5}_unq\d+/g, cities: 'Rashad,Kadugli,Talodi,Kalog,Dilling,Muglad,Abyei,Tagoi' },

  // Niger-Congo: Tumtum
  { pattern: /tumtum_\d{5}_unq\d+/g, cities: 'Rashad,Kadugli,Talodi,Kalog,Dilling,Muglad,Tagoi,Bashiri' },

  // Niger-Congo: Tetserret
  { pattern: /tetserret_\d{5}_unq\d+/g, cities: 'Agadez,Arlit,Bilma,Dirkou,Iferouane,Madama,Tahoua,In Gall' },

  // Niger-Congo: Berber
  { pattern: /zenati-berber_\d{5}_unq\d+/g, cities: 'Tlemcen,Mascara,Oran,Sidi Bel Abbès,Mostaganem,Chlef,Relizane,Tiaret,Saida,Ain Defla' },

  // Dravidian: Koya
  { pattern: /koya_\d{5}_unq\d+/g, cities: 'Bhadrachalam,Kothagudem,Manuguru,Palvancha,Chinturu,Kunavaram,Venkatapuram,Chintalapudi,Dornakal,Yellandu' },

  // Languages starting with K
  { pattern: /kvx_\d{5}_unq\d+/g, cities: 'Taveta,Mombasa,Malindi,Lamu,Kilifi,Voi,Mwatate,Wundanyi,Mariakani,Taita' },
  { pattern: /kxu_\d{5}_unq\d+/g, cities: 'Bakel,Mbao,Salémata,Kédougou,Saraya,Kidira,Matam,Ouro Sogui,Diam Diabo,Bakel' },
  { pattern: /kyaka_\d{5}_unq\d+/g, cities: 'Goroka,Kainantu,Kundiawa,Mendi,Mt Hagen,Wabag,Chimbu,Jiwaka,Hela,Enga' },
  { pattern: /kyowa-go_\d{5}_unq\d+/g, cities: 'Sapporo,Obihiro,Asahikawa,Kushiro,Kitami,Hakodate,Tomakomai,Chitose,Muroran,Kitahiroshima' },
  { pattern: /kyv_\d{5}_unq\d+/g, cities: 'Nairobi,Mombasa,Kisumu,Nakuru,Eldoret,Mombasa,Kisii,Meru,Thika,Nyeri' },
  { pattern: /kyw_\d{5}_unq\d+/g, cities: 'Makurdi,Abakaliki,Enugu,Owerri,Awka,Umuahia,Oturkpo,Nsukka,Okigwe,Onitsha' },
  { pattern: /kzi_\d{5}_unq\d+/g, cities: 'Sokoto,Kano,Kaduna,Zaria,Bauchi,Jos,Maiduguri,Makurdi,Benin,Abeokuta' },

  // Languages starting with L
  { pattern: /l-ngua-geral-paulista_\d{5}_unq\d+/g, cities: 'São Paulo,Campinas,São Bernardo do Campo,Santo André,São José dos Campos,Sorocaba,Santos,Osasco,Ribeirão Preto,São José do Rio Preto' },
  { pattern: /laal_\d{5}_unq\d+/g, cities: 'Doba,Moyen-Chari,Logone,Chari,Laï,Mandoul,Mayo-Kebbi,Salamat,Guéra,Kémo' },
  { pattern: /labrador-inuit-pidgin-french_\d{5}_unq\d+/g, cities: 'St. John\'s,Corner Brook,Gander,Grand Falls-Windsor,Happy Valley-Goose Bay,Labrador City,Wabush,Port aux Basques,Marystown,Carbonear' },
  { pattern: /lachi_\d{5}_unq\d+/g, cities: 'Ha Giang,Dien Bien Phu,Lao Cai,Lai Chau,Son La,Yen Bai,Bac Kan,Cao Bang,Tuyen Quang,Lang Son' },
  { pattern: /laha_\d{5}_unq\d+/g, cities: 'Ha Giang,Bac Kan,Cao Bang,Tuyen Quang,Lang Son,Yen Bai,Thai Nguyen,Vinh Phuc,Phu Tho,Bac Giang' },
  { pattern: /lahu_\d{5}_unq\d+/g, cities: 'Chiang Mai,Mae Hong Son,Chiang Rai,Tak,Kamphaeng Phet,Lampang,Lamphun,Nan,Phayao,Phrae' },
  { pattern: /laiuse-romani_\d{5}_unq\d+/g, cities: 'Tartu,Valga,Võru,Põlva,Jõgeva,Viljandi,Pärnu,Rakvere,Kuressaare,Narva' },
  { pattern: /lakota_\d{5}_unq\d+/g, cities: 'Pine Ridge,Rapid City,Chamberlain,Mobridge,Mitchell,Pierre,Yankton,Sioux Falls,Watertown,Aberdeen' },
  { pattern: /lampung_\d{5}_unq\d+/g, cities: 'Bandar Lampung,Metro,Pesawaran,Pringsewu,South Lampung,Tanggamus,West Lampung,Tanggamus,Way Kanan,Way Panji' },
  { pattern: /land-dayak_\d{5}_unq\d+/g, cities: 'Kuching,Sibu,Bintulu,Miri,Sarikei,Sri Aman,Kapit,Betong,Marudi,Limbang' },
  { pattern: /lanping-bai-dialect_\d{5}_unq\d+/g, cities: 'Dali,Lijiang,Shangri-La,Xiaguan,Heqing,Jianchuan,Eryuan,Yunlong,Binchuan,Midu' },

  // Languages starting with T
  { pattern: /tura_\d{5}_unq\d+/g, cities: 'Doha,Al Wakrah,Al Khor,Dukhan,Al Rayyan,Mesaieed,Shahaniya,Umm Salal,Lusail,Al Daayen' },

  // Other languages
  { pattern: /kwoma-manambu-pidgin_\d{5}_unq\d+/g, cities: 'Ambunti,Wewak,Maprik,Yangoru,Boram,Bitapaka,Madang,Rabaul,Kokopo,Lae' },
  { pattern: /kyakhta-russian-chinese-pidgin_\d{5}_unq\d+/g, cities: 'Kyakhta,Ulan-Ude,Chita,Irkutsk,Ulaanbaatar,Erlian,Troitskosavsk,Selenginsk,Gusinoozersk,Zakamensk' },
  { pattern: /hayu_\d{5}_unq\d+/g, cities: 'Gwangju,Bucheon,Gunpo,Uiwang,Hwaseong,Osan,Yongin,Pyeongtaek,Dongducheon,Paju' },
  { pattern: /ber-family_\d{5}_unq\d+/g, cities: 'Agadir,Casablanca,Fès,Marrakech,Tanger,Meknès,Oujda,Kénitra,Rabat,Salé' },
];

let replacementsMade = 0;
const originalContent = fs.readFileSync('modules/namebases-real.js', 'utf-8');
let content = originalContent;

console.log('Applying replacements...\n');

for (const { pattern, cities } of cityReplacements) {
  const matches = content.match(pattern);
  if (matches && matches.length > 0) {
    const before = content.length;
    content = content.replace(pattern, cities);
    const after = content.length;
    const count = (before - after) / (matches[0].length - cities.length);
    replacementsMade += count;
    console.log(`✓ ${pattern.toString()}: ${count} replacements`);
  }
}

console.log(`\nTotal replacements made: ${replacementsMade}`);

// Verify remaining unq patterns
const remainingUnq = (content.match(/_unq\d+/g) || []).length;
console.log(`Remaining _unq patterns: ${remainingUnq}`);

if (content !== originalContent) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf-8');
  console.log('\n✓ File updated successfully!');
} else {
  console.log('\n✗ No changes made to file');
}