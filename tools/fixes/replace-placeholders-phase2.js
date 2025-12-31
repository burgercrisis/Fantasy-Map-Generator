const fs = require('fs');

const cityReplacements = [
  // A series
  { pattern: /aas-whistled_\d{5}_unq\d+/g, cities: 'Orthez,Bidache,Saint-Palais,Tardets,Mont-de-Marsan,Hasparren,Aire-sur-l\'Adour,Navarrenx' },
  { pattern: /abaza_\d{5}_unq\d+/g, cities: 'Cherkessk,Karachayevsk,Zelenchukskaya,Ust-Dzheguta,Teberda,Nyaksim,Krasny Kut' },
  { pattern: /abba-gorgoryos_\d{5}_unq\d+/g, cities: 'Axum,Adwa,Mekelle,Shire,Inda Selassie,Adi Grat,Hawzen,Wukro' },
  { pattern: /aboriginal-pidgin-english_\d{5}_unq\d+/g, cities: 'Darwin,Alice Springs,Katherine,Tennant Creek,Gove,Palmerston,Jabiru' },
  { pattern: /abruzzese_\d{5}_unq\d+/g, cities: 'L\'Aquila,Pescara,Chieti,Teramo,Ortona,Vasto,Sulmona,Avezzano' },
  { pattern: /acadian_\d{5}_unq\d+/g, cities: 'Moncton,Dieppe,Bathurst,Shediac,Sackville,Cap-Pelé,Memramcook' },
  { pattern: /adeni-arabic_\d{5}_unq\d+/g, cities: 'Aden,Al Mukalla,Taiz,Hodeidah,Seiyun,Shibam,Tarim' },
  { pattern: /aeolian_\d{5}_unq\d+/g, cities: 'Marettimo,Lipari,Salina,Vulcano,Panarea,Stromboli,Filicudi,Alicudi' },
  { pattern: /afar_\d{5}_unq\d+/g, cities: 'Djibouti,Tadjoura,Dikhil,Assab,Obock,Mersa Fatma,Edd' },
  { pattern: /african-romance_\d{5}_unq\d+/g, cities: 'Carthage,Leptis Magna,Thysdrus,Sabratha,Hippo Regius,Setif,Djémila,Timgad' },
  { pattern: /afrikaans_\d{5}_unq\d+/g, cities: 'Cape Town,Pretoria,Johannesburg,Durban,Port Elizabeth,Bloemfontein,Pietermaritzburg' },
  { pattern: /afro-seminole-creole_\d{5}_unq\d+/g, cities: 'Brackettville,Nacimiento de los Negros,Big Cypress,Hollywood,Seminole' },
  { pattern: /afroasiatic-family_\d{5}_unq\d+/g, cities: 'Cairo,Baghdad,Damascus,Jeddah,Riyadh,Sanaa,Khartoum,Tripoli' },
  { pattern: /agalega-creole_\d{5}_unq\d+/g, cities: 'Vingt Cinq,La Fourche,Grand Gaube,Goodlands,Mapou,Rivière du Rempart' },
  { pattern: /agaw_\d{5}_unq\d+/g, cities: 'Debre Birhan,Debre Markos,Dessie,Bahir Dar,Gonder,Debre Tabor' },
  { pattern: /ahom_\d{5}_unq\d+/g, cities: 'Sibsagar,Jorhat,Mariyani,Golaghat,Dibrugarh,Tinsukia' },
  { pattern: /ainu_\d{5}_unq\d+/g, cities: 'Sapporo,Asahikawa,Hakodate,Kushiro,Obihiro,Kitami,Muroran' },
  { pattern: /aiton_\d{5}_unq\d+/g, cities: 'Dibrugarh,Sibsagar,Jorhat,Mariyani,Golaghat,Tinsukia,Moran' },
  { pattern: /akan_\d{5}_unq\d+/g, cities: 'Kumasi,Cape Coast,Takoradi,Tema,Accra,Sunyani,Tamale,Wa' },
  { pattern: /aqc_\d{5}_unq\d+/g, cities: 'Giza,Helwan,Alexandria,Assiut,Sohag,Qena,Luxor,Aswan' },

  // AZD and EJT dialects
  { pattern: /azd-dialect_\d{5}_unq\d+/g, cities: 'Muscat,Salalah,Sohar,Seeb,Bawshar,Sur,Ibra,Rustaq' },
  { pattern: /ejtun-dialect_\d{5}_unq\d+/g, cities: 'Mosta,Victoria,Nadur,Qormi,Żebbuġ,Xagħra,Safi,Kirkop' },

  // K series (remaining)
  { pattern: /kurambhag-paharia_\d{5}_unq\d+/g, cities: 'Bankura,Purulia,Midnapore,Bardhaman,Birbhum,Howrah,Kolkata' },
  { pattern: /kurichiya_\d{5}_unq\d+/g, cities: 'Wayanad,Kalpetta,Sultan Bathery,Mananthavady,Vythiri,Panamaram' },
  { pattern: /kva_\d{5}_unq\d+/g, cities: 'Tiruchirappalli,Pudukkottai,Thanjavur,Nagapattinam,Karaikudi,Sivaganga' },

  // L series
  { pattern: /laven-bahnaric_\d{5}_unq\d+/g, cities: 'Paksong,Sekong,Xekong,Attapeu,Champasak,Salavan' },
  { pattern: /lavi-bahnaric_\d{5}_unq\d+/g, cities: 'Pakse,Salavan,Sekong,Champasak,Xekong,Attapeu,Saravan' },
  { pattern: /law_\d{5}_unq\d+/g, cities: 'Mandalay,Mandalay,Monywa,Shwebo,Magway,Meiktila' },
  { pattern: /lbe_\d{5}_unq\d+/g, cities: 'Tula,Kolomna,Ryazan,Novomoskovsk,Kasimov,Dankov' },
  { pattern: /lbj_\d{5}_unq\d+/g, cities: 'Yalta,Sevastopol,Simferopol,Feodosia,Evpatoria,Kerch' },
  { pattern: /lemi-region_\d{5}_unq\d+/g, cities: 'Yekaterinburg,Nizhny Tagil,Pyt-Yakh,Nefteyugansk,Novy Urengoy' },
  { pattern: /lezgin_\d{5}_unq\d+/g, cities: 'Derbent,Makhachkala,Khasavyurt,Kizlyar,Kizlyar,Buynaksk' },
  { pattern: /lhm_\d{5}_unq\d+/g, cities: 'Kampong Cham,Kratie,Stung Treng,Ratanakiri,Mondulkiri' },
  { pattern: /lhokpu_\d{5}_unq\d+/g, cities: 'Thimphu,Paro,Punakha,Wangdue Phodrang,Trongsa,Bumthang' },
  { pattern: /liberian-kreyol_\d{5}_unq\d+/g, cities: 'Monrovia,Harper,Buchanan,Gbarnga,Kakata,Bensenville' },
  { pattern: /light-warlpiri_\d{5}_unq\d+/g, cities: 'Alice Springs,Yuendumu,Lajamanu,Harts Range,Alice,Ayawarri' },
  { pattern: /limba_\d{5}_unq\d+/g, cities: 'Makeni,Kabala,Bumbuna,Koidu,Tonkolili,Magburaka' },
  { pattern: /lingala_\d{5}_unq\d+/g, cities: 'Kinshasa,Brazzaville,Kisangani,Mbandaka,Kananga,Lubumbashi' },
  { pattern: /lingling_\d{5}_unq\d+/g, cities: 'Daming,Guiping,Qinzhou,Yulin,Beihai,Fangchenggang' },
  { pattern: /lisu_\d{5}_unq\d+/g, cities: 'Baoshan,Lijiang,Tengchong,Ruili,Dali,Dêqên,Deqin' },
  { pattern: /livvi_\d{5}_unq\d+/g, cities: 'Petrozavodsk,Kondopoga,Sortavala,Kostomuksha,Suoyarvi,Pitkyaranta' },
  { pattern: /lmh_\d{5}_unq\d+/g, cities: 'Lubumbashi,Kolwezi,Likasi,Kamina,Mwene-Ditu,Kananga' },

  // Northern series
  { pattern: /northern-mansi_\d{5}_unq\d+/g, cities: 'Khanty-Mansiysk,Surgut,Nizhnevartovsk,Nyagan,Uray,Yugorsk' },
  { pattern: /northern-sami_\d{5}_unq\d+/g, cities: 'Kautokeino,Karasjok,Tana,Båtsfjord,Lebesby,Alta,Tromsø' },
  { pattern: /northern-selkup_\d{5}_unq\d+/g, cities: 'Tobolsk,Khanty-Mansiysk,Noyabrsk,Puy-Yakh,Surgut,Muravlenko' },

  // S series
  { pattern: /sanchursk_\d{5}_unq\d+/g, cities: 'Sanchursk,Khanty-Mansiysk, Surgut,Noyabrsk,Pyt-Yakh,Muravlenko' },
  { pattern: /sele_\d{5}_unq\d+/g, cities: 'Selè,Khanty-Mansiysk,Noyabrsk,Pyt-Yakh,Surgut,Muravlenko' },
  { pattern: /selkup_\d{5}_unq\d+/g, cities: 'Tazovsky,Krasnoselkup,Turukhansk,Krasnyy Yar,Tarko-Sale,Pangody' },
  { pattern: /sharanga_\d{5}_unq\d+/g, cities: 'Chhindwara,Multanpur,Narsimhapur,Seoni,Mandla,Jabalpur' },
  { pattern: /sosva_\d{5}_unq\d+/g, cities: 'Sosva,Khanty-Mansiysk,Noyabrsk,Pyt-Yakh,Surgut,Muravlenko' },
  { pattern: /southeastern-moksha_\d{5}_unq\d+/g, cities: 'Saransk,Kovylkino,Ruzaevka,Krasnoslobodsk,Insar,Temnikov' },
  { pattern: /syktyvkar_\d{5}_unq\d+/g, cities: 'Syktyvkar,Ukhta,Vuktyl,Pechora,Sosnogorsk,Inta' },

  // Other
  { pattern: /tsotsitaal-and-camtho-aka-iscamtho_\d{5}_unq\d+/g, cities: 'Soweto,Alexandra,Tembisa,Katlehong,Vosloorus,Tshwane,Johannesburg' },
  { pattern: /western-moksha_\d{5}_unq\d+/g, cities: 'Saransk,Kovylkino,Ruzaevka,Krasnoslobodsk,Insar,Temnikov' },
];

let replacementsMade = 0;
const originalContent = fs.readFileSync('modules/namebases-real.js', 'utf-8');
let content = originalContent;

console.log('Applying Phase 2 replacements...\n');

for (const { pattern, cities } of cityReplacements) {
  const matches = content.match(pattern);
  if (matches && matches.length > 0) {
    const before = content.length;
    content = content.replace(pattern, cities);
    const after = content.length;
    const count = (before - after) / (matches[0].length - cities.length);
    replacementsMade += count;
    console.log(`✓ ${pattern}: ${count.toFixed(0)} replacements`);
  } else {
    console.log(`✗ ${pattern}: No matches`);
  }
}

console.log(`\nTotal replacements made: ${replacementsMade.toFixed(0)}`);

// Verify remaining unq patterns
const remainingUnq = (content.match(/_unq\d+/g) || []).length;
console.log(`Remaining _unq patterns: ${remainingUnq}`);

if (content !== originalContent) {
  fs.writeFileSync('modules/namebases-real.js', content, 'utf-8');
  console.log('\n✓ File updated successfully!');
} else {
  console.log('\n✗ No changes made to file');
}