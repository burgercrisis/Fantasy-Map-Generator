const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
const content = fs.readFileSync(filePath, 'utf8');

// Define placeholder fixes
const fixes = [
    // Remove " language" suffix
    { pattern: /{ name: "Bura language"/g, replacement: '{ name: "Bura"' },
    { pattern: /{ name: "Bure language"/g, replacement: '{ name: "Bure"' },
    { pattern: /{ name: "Buwal language"/g, replacement: '{ name: "Buwal"' },
    { pattern: /{ name: "Cakfem-Mushere language"/g, replacement: '{ name: "Cakfem-Mushere"' },
    { pattern: /{ name: "Tangale language"/g, replacement: '{ name: "Tangale"' },
    { pattern: /{ name: "Dangaleat language"/g, replacement: '{ name: "Dangaleat"' },

    // Remove trailing spaces from names
    { pattern: /{ name: "Maramure- "/g, replacement: '{ name: "Maramureș"' },
    { pattern: /{ name: "Tamil "/g, replacement: '{ name: "Tamil"' },
    { pattern: /{ name: "Nenets "/g, replacement: '{ name: "Nenets"' },
    { pattern: /{ name: "Tundra Nenets "/g, replacement: '{ name: "Tundra Nenets"' },
    { pattern: /{ name: "North Estonian "/g, replacement: '{ name: "North Estonian"' },
    { pattern: /{ name: "Western Estonian "/g, replacement: '{ name: "Western Estonian"' },
    { pattern: /{ name: "Northern Erzya "/g, replacement: '{ name: "Northern Erzya"' },
    { pattern: /{ name: "Southeastern Erzya "/g, replacement: '{ name: "Southeastern Erzya"' },
    { pattern: /{ name: "Western Erzya "/g, replacement: '{ name: "Western Erzya"' },
    { pattern: /{ name: "Shoksha "/g, replacement: '{ name: "Shoksha"' },
    { pattern: /{ name: "Philippine Spanish "/g, replacement: '{ name: "Philippine Spanish"' },
    { pattern: /{ name: "Piedmontese "/g, replacement: '{ name: "Piedmontese"' },
    { pattern: /{ name: "Pisano-Livornese "/g, replacement: '{ name: "Pisano-Livornese"' },
    { pattern: /{ name: "Pistoiese "/g, replacement: '{ name: "Pistoiese"' },
    { pattern: /{ name: "Poitevin-Saintongeais "/g, replacement: '{ name: "Poitevin-Saintongeais"' },
    { pattern: /{ name: "Eastern Khanty "/g, replacement: '{ name: "Eastern Khanty"' },
    { pattern: /{ name: "Eastern Mansi "/g, replacement: '{ name: "Eastern Mansi"' },
    { pattern: /{ name: "Western Mansi "/g, replacement: '{ name: "Western Mansi"' },
    { pattern: /{ name: "Csángó "/g, replacement: '{ name: "Csángó"' },
    { pattern: /{ name: "Northeast Hungary "/g, replacement: '{ name: "Northeast Hungary"' },
    { pattern: /{ name: "Transylvanian Plain "/g, replacement: '{ name: "Transylvanian Plain"' },
    { pattern: /{ name: "Southern Sami "/g, replacement: '{ name: "Southern Sami"' },
    { pattern: /{ name: "Portuguese "/g, replacement: '{ name: "Portuguese"' },
    { pattern: /{ name: "Proto-Eastern Romance "/g, replacement: '{ name: "Proto-Eastern Romance"' },
    { pattern: /{ name: "Proto-Romance "/g, replacement: '{ name: "Proto-Romance"' },
    { pattern: /{ name: "Provençal "/g, replacement: '{ name: "Provençal"' },
    { pattern: /{ name: "Mator "/g, replacement: '{ name: "Mator"' },
    { pattern: /{ name: "Mator proper "/g, replacement: '{ name: "Mator proper"' },
    { pattern: /{ name: "Proto-Ob-Ugric "/g, replacement: '{ name: "Proto-Ob-Ugric"' },
    { pattern: /{ name: "Kamas "/g, replacement: '{ name: "Kamas"' },
    { pattern: /{ name: "Nganasan "/g, replacement: '{ name: "Nganasan"' },
    { pattern: /{ name: "Western Lombard "/g, replacement: '{ name: "Western Lombard"' },
    { pattern: /{ name: "Varesino "/g, replacement: '{ name: "Varesino"' },
    { pattern: /{ name: "Ticinese "/g, replacement: '{ name: "Ticinese"' },
    { pattern: /{ name: "Triestine "/g, replacement: '{ name: "Triestine"' },
    { pattern: /{ name: "Berta "/g, replacement: '{ name: "Berta"' },
    { pattern: /{ name: "Sinyar "/g, replacement: '{ name: "Sinyar"' },
    { pattern: /{ name: "Songhoyboro Ciine "/g, replacement: '{ name: "Songhoyboro Ciine"' },
    { pattern: /{ name: "Surbakhal "/g, replacement: '{ name: "Surbakhal"' },
    { pattern: /{ name: "Teda "/g, replacement: '{ name: "Teda"' },
    { pattern: /{ name: "Tondi Songway Kiini "/g, replacement: '{ name: "Tondi Songway Kiini"' },
    { pattern: /{ name: "Sukur "/g, replacement: '{ name: "Sukur"' },
    { pattern: /{ name: "Bacama "/g, replacement: '{ name: "Bacama"' },
    { pattern: /{ name: "Bade \(Chadic\) "/g, replacement: '{ name: "Bade (Chadic)"' },
    { pattern: /{ name: "Bole Afroasiatic "/g, replacement: '{ name: "Bole Afroasiatic"' },
    { pattern: /{ name: "Quebec French "/g, replacement: '{ name: "Quebec French"' },
    { pattern: /{ name: "Rémois "/g, replacement: '{ name: "Rémois"' },
    { pattern: /{ name: "Regional Italian "/g, replacement: '{ name: "Regional Italian"' },
    { pattern: /{ name: "Ribagorçan "/g, replacement: '{ name: "Ribagorçan"' },
    { pattern: /{ name: "Riberan "/g, replacement: '{ name: "Riberan"' },
    { pattern: /{ name: "Riojan "/g, replacement: '{ name: "Riojan"' },
    { pattern: /{ name: "Rioplatense Spanish "/g, replacement: '{ name: "Rioplatense Spanish"' },
    { pattern: /{ name: "Riunorese "/g, replacement: '{ name: "Riunorese"' },
    { pattern: /{ name: "Romagnol "/g, replacement: '{ name: "Romagnol"' },
    { pattern: /{ name: "Romanesco "/g, replacement: '{ name: "Romanesco"' },
    { pattern: /{ name: "Saba "/g, replacement: '{ name: "Saba"' },
    { pattern: /{ name: "Shabo "/g, replacement: '{ name: "Shabo"' },
    { pattern: /{ name: "Besme "/g, replacement: '{ name: "Besme"' },
    { pattern: /{ name: "Senara "/g, replacement: '{ name: "Senara"' },
    { pattern: /{ name: "Sucite "/g, replacement: '{ name: "Sucite"' },
    { pattern: /{ name: "Supyire "/g, replacement: '{ name: "Supyire"' },
    { pattern: /{ name: "Suwu "/g, replacement: '{ name: "Suwu"' },
    { pattern: /{ name: "Romanian "/g, replacement: '{ name: "Romanian"' },
    { pattern: /{ name: "Romansh "/g, replacement: '{ name: "Romansh"' },
    { pattern: /{ name: "Romanian Daco-Romanian "/g, replacement: '{ name: "Romanian Daco-Romanian"' },
    { pattern: /{ name: "Royasc "/g, replacement: '{ name: "Royasc"' },
    { pattern: /{ name: "Istro-Romanian "/g, replacement: '{ name: "Istro-Romanian"' },
    { pattern: /{ name: "Aromanian "/g, replacement: '{ name: "Aromanian"' },
    { pattern: /{ name: "Megleno-Romanian "/g, replacement: '{ name: "Megleno-Romanian"' },
    { pattern: /{ name: "Sabino "/g, replacement: '{ name: "Sabino"' },
    { pattern: /{ name: "Saharan Spanish "/g, replacement: '{ name: "Saharan Spanish"' },
    { pattern: /{ name: "Salentino "/g, replacement: '{ name: "Salentino"' },
    { pattern: /{ name: "Syer-Tenyer "/g, replacement: '{ name: "Syer-Tenyer"' },
    { pattern: /{ name: "Tiv "/g, replacement: '{ name: "Tiv"' },
    { pattern: /{ name: "Tyap "/g, replacement: '{ name: "Tyap"' },
    { pattern: /{ name: "Werni "/g, replacement: '{ name: "Werni"' },
    { pattern: /{ name: "Yobe "/g, replacement: '{ name: "Yobe"' },
    { pattern: /{ name: "Zhire "/g, replacement: '{ name: "Zhire"' },
    { pattern: /{ name: "Zhoa "/g, replacement: '{ name: "Zhoa"' },
    { pattern: /{ name: "Tadaksahak "/g, replacement: '{ name: "Tadaksahak"' },
    { pattern: /{ name: "Sammarinese "/g, replacement: '{ name: "Sammarinese"' },
    { pattern: /{ name: "Sardinian "/g, replacement: '{ name: "Sardinian"' },
    { pattern: /{ name: "Sardo-Corsican "/g, replacement: '{ name: "Sardo-Corsican"' },
    { pattern: /{ name: "Sassarese "/g, replacement: '{ name: "Sassarese"' },
    { pattern: /{ name: "Savoyard "/g, replacement: '{ name: "Savoyard"' },
    { pattern: /{ name: "Senese "/g, replacement: '{ name: "Senese"' },
    { pattern: /{ name: "Sicilian "/g, replacement: '{ name: "Sicilian"' },
    { pattern: /{ name: "Somontanés "/g, replacement: '{ name: "Somontanés"' },
    { pattern: /{ name: "Southeast Metafonetica "/g, replacement: '{ name: "Southeast Metafonetica"' },
    { pattern: /{ name: "Southern Aragonese "/g, replacement: '{ name: "Southern Aragonese"' },
    { pattern: /{ name: "Surmiran "/g, replacement: '{ name: "Surmiran"' },
    { pattern: /{ name: "Sursilvan "/g, replacement: '{ name: "Sursilvan"' },
    { pattern: /{ name: "Tuscan "/g, replacement: '{ name: "Tuscan"' },
    { pattern: /{ name: "Southern Cilentan "/g, replacement: '{ name: "Southern Cilentan"' },
    { pattern: /{ name: "Tabarchino "/g, replacement: '{ name: "Tabarchino"' },
    { pattern: /{ name: "Talian "/g, replacement: '{ name: "Talian"' },
    { pattern: /{ name: "Tetuan "/g, replacement: '{ name: "Tetuan"' },
    { pattern: /{ name: "Transylvanian "/g, replacement: '{ name: "Transylvanian"' },
    { pattern: /{ name: "Tuscia "/g, replacement: '{ name: "Tuscia"' },
    { pattern: /{ name: "Umbrian "/g, replacement: '{ name: "Umbrian"' },
    { pattern: /{ name: "Uruguayan Portuguese "/g, replacement: '{ name: "Uruguayan Portuguese"' },
    { pattern: /{ name: "Uruguayan Spanish "/g, replacement: '{ name: "Uruguayan Spanish"' },
    { pattern: /{ name: "Valencian "/g, replacement: '{ name: "Valencian"' },
    { pattern: /{ name: "Venezuelan Spanish "/g, replacement: '{ name: "Venezuelan Spanish"' },
    { pattern: /{ name: "Venetian "/g, replacement: '{ name: "Venetian"' },
    { pattern: /{ name: "Vivarais "/g, replacement: '{ name: "Vivarais"' },
    { pattern: /{ name: "Walser "/g, replacement: '{ name: "Walser"' },
    { pattern: /{ name: "West Flemish "/g, replacement: '{ name: "West Flemish"' },
    { pattern: /{ name: "Western Romance "/g, replacement: '{ name: "Western Romance"' },
    { pattern: /{ name: "Western Slovak "/g, replacement: '{ name: "Western Slovak"' },
    { pattern: /{ name: "Western Slovenian "/g, replacement: '{ name: "Western Slovenian"' },
    { pattern: /{ name: "Western Spanish "/g, replacement: '{ name: "Western Spanish"' },
    { pattern: /{ name: "Western Ukrainian "/g, replacement: '{ name: "Western Ukrainian"' },
    { pattern: /{ name: "Xhosa "/g, replacement: '{ name: "Xhosa"' },
    { pattern: /{ name: "Yucatec "/g, replacement: '{ name: "Yucatec"' },
    { pattern: /{ name: "Yucatec Maya "/g, replacement: '{ name: "Yucatec Maya"' },
    { pattern: /{ name: "Zulu "/g, replacement: '{ name: "Zulu"' },

    // Remove duplicate Castelmezzano at index 700
    { pattern: /    { name: "Castelmezzano", i: 700, min: 4, max: 11, d: "lnrt", m: 0, b: "Castelmezzano,Pietrapertosa,Potenza,Matera,Tricarico,Avigliano,Pignola,Vaglio Basilicata,Tito,Laurenzana,Albano di Lucania,Anzi" },\n/g, replacement: '' },

    // Fix placeholder cities in Butler English
    { pattern: /{ name: "Butler English", i: 665, min: 4, max: 11, d: "lnrt", m: 0, b: "butlerenglishmemsahib,butlerenglishkhansamah,butlerenglishtiffinwallah,butlerenglishdakbungalow,butlerenglishpukka,butlerenglishburra,butlerenglishnautch,butlerenglishayah,butlerenglishshikari,butlerenglishwallah,butlerenglishghat,butlerenglishraj" }/g, replacement: '{ name: "Butler English", i: 665, min: 4, max: 11, d: "lnrt", m: 0, b: "Kolkata,Chennai,Mumbai,Delhi,Bangalore,Hyderabad,Pune,Ahmedabad,Jaipur,Lucknow,Kanpur,Nagpur" }' },

    // Fix placeholder cities in Kru Pidgin English
    { pattern: /{ name: "Kru Pidgin English", i: 666, min: 4, max: 11, d: "lnrt", m: 0, b: "krupidginpalaver,krupidginsmallsmall,krupidginplentybook,krupidginpeppersoup,krupidgincassava,krupidgingbagba,krupidginkpalongo,krupidginsenesi,krupidginnyenbo,krupidginjojo,krupidginbush,krupidginmarket" }/g, replacement: '{ name: "Kru Pidgin English", i: 666, min: 4, max: 11, d: "lnrt", m: 0, b: "Monrovia,Harper,Buchanan,Gbarnga,Kakata,Tubmanburg,Robertsport,Greenville,Bensonville" }' },

    // Fix placeholder cities in Liberian Interior Pidgin English
    { pattern: /{ name: "Liberian Interior Pidgin English", i: 667, min: 4, max: 11, d: "lnrt", m: 0, b: "libintpidginhowfar,libintpidginmypeople,libintpidginleh,libintpidginweh,libintpidginbookman,libintpidginbrushmouth,libintpidginheartman,libintpidginyaanbo,libintpidginkpokpo,libintpidginnyenbo,libintpidginpeople,libintpidgintown" }/g, replacement: '{ name: "Liberian Interior Pidgin English", i: 667, min: 4, max: 11, d: "lnrt", m: 0, b: "Monrovia,Gbarnga,Harper,Buchanan,Kakata,Zwedru,Voinjama,Tappita,Sanniquellie" }' },

    // Fix placeholder cities in Cairene Arabic
    { pattern: /{ name: "Cairene Arabic", i: 682, min: 4, max: 11, d: "lnrt", m: 0, b: "cairenearabic_cairo,cairenearabic_giza,cairenearabic_helwan,cairenearabic_shubra,cairenearabic_maadi,cairenearabic_nascity,cairenearabic_imbaba,cairenearabic_oldcairo,cairenearabic_abbassia,cairenearabic_zamalek,cairenearabic_elmarg,cairenearabic_elmatariya" }/g, replacement: '{ name: "Cairene Arabic", i: 682, min: 4, max: 11, d: "lnrt", m: 0, b: "Cairo,Giza,Hilwan,Shubra El-Kheima,Maadi,Nasr City,Imbaba,Old Cairo,Abbasiya,Zamalek,Al-Marg,Al-Matariya" }' },

    // Fix placeholder cities in Central Asian Arabic
    { pattern: /{ name: "Central Asian Arabic", i: 683, min: 4, max: 11, d: "lnrt", m: 0, b: "centralasianarabic_bukhara,centralasianarabic_samarkand,centralasianarabic_kattakurgan,centralasianarabic_karshi,centralasianarabic_termez,centralasianarabic_dushanbe,centralasianarabic_khujand,centralasianarabic_panjakent,centralasianarabic_shahrisabz,centralasianarabic_navoi,centralasianarabic_tashkent,centralasianarabic_balkh" }/g, replacement: '{ name: "Central Asian Arabic", i: 683, min: 4, max: 11, d: "lnrt", m: 0, b: "Bukhara,Samarkand,Kattakurgan,Karshi,Termez,Dushanbe,Khujand,Panjakent,Shahrisabz,Navoi,Tashkent,Balkh" }' },

    // Fix placeholder cities in Orleanais
    { pattern: /{ name: "Orleanais", i: 762, min: 4, max: 11, d: "lnrt", m: 0, b: "orleanais_orleans,orleanais_olivet,orleanais_fleury,orleanais_stjeandelabraye,orleanais_stjeanleblanc,orleanais_saran,orleanais_la-chapelle,orleanais_gien,orleanais_montargis,orleanais_pithiviers,orleanais_beaugency,orleanais_meung" }/g, replacement: '{ name: "Orleanais", i: 762, min: 4, max: 11, d: "lnrt", m: 0, b: "Orléans,Oliviers,Fleury,Saint-Jean-de-la-Raye,Saint-Jean-de-Braye,Saran,La Chapelle,Gien,Montargis,Pithiviers,Beaugency,Meung-sur-Loire" }' },

    // Fix typos in Australian Spanish
    { pattern: /{ name: "Australian Spanish", i: 867, min: 4, max: 11, d: "lnrt", m: 0, b: "Sydney,Melbourne,Perth,Adelaide,Brisbane,Canberra,Hobart,Geelong,Wollongong,Ballarat,Newcastle,Fremantle" }/g, replacement: '{ name: "Australian Spanish", i: 867, min: 4, max: 11, d: "lnrt", m: 0, b: "Madrid,Barcelona,Valencia,Sevilla,Zaragoza,Málaga,Murcia,Ciudad Real,Bilbao,Alicante" }' },

    // Fix French city names (e.g., "Orléans" not "Orleanais")
    { pattern: /{ name: "Orléans", i: [0-9]+, b: "Orléans[^"]*"}/g, replacement: '' },
];

let fixedContent = content;

// Apply all fixes
for (const fix of fixes) {
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
}

// Write back
fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('Fixed all placeholder entries');
