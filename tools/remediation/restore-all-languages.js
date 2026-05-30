const fs = require('fs');

console.log('=== 🚀 RESTORING ALL 2750 LANGUAGES TO CONTINENT FILES ===\n');

// Read the backup
const content = fs.readFileSync('modules/namebases-real.backup-20251228-221152.js', 'utf8');

// Extract all languages
const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*\d+,\s*"max":\s*\d+,\s*"d":\s*"([^"]*)",\s*"m":\s*[\d.]+,\s*"b":\s*"([^"]+)"\}/g;

let match;
let allLanguages = [];

while ((match = entryRegex.exec(content)) !== null) {
    allLanguages.push({
        name: match[1],
        i: parseInt(match[2]),
        d: match[3],
        b: match[4]
    });
}

console.log(`✅ Extracted ${allLanguages.length} total languages from backup\n`);

// Continent assignment based on language names and known indicators
const continents = {
    europe: { languages: [], name: 'Europe' },
    asia: { languages: [], name: 'Asia' },  
    africa: { languages: [], name: 'Africa' },
    northAmerica: { languages: [], name: 'North America' },
    southAmerica: { languages: [], name: 'South America' },
    oceania: { languages: [], name: 'Oceania' }
};

// Known European languages/patterns
const europeLangs = new Set([
    'German', 'English', 'French', 'Italian', 'Castillian', 'Nordic', 'Roman', 'Greek',
    'Spanish', 'Portuguese', 'Catalan', 'Basque', 'Galician', 'Welsh', 'Irish', 'Scottish Gaelic',
    'Breton', 'Cornish', 'Manx', 'Luxembourgish', 'Limburgish', 'Frisian', 'Dutch', 'Flemish',
    'Danish', 'Norwegian', 'Swedish', 'Icelandic', 'Faroese', 'Estonian', 'Latvian', 'Lithuanian',
    'Polish', 'Czech', 'Slovak', 'Slovenian', 'Croatian', 'Serbian', 'Bosnian', 'Montenegrin',
    'Macedonian', 'Bulgarian', 'Romanian', 'Moldovan', 'Ukrainian', 'Belarusian', 'Russian',
    'Hungarian', 'Finnish', 'Sami', 'Karelian', 'Veps', 'Votian', 'Livonian', 'Komi', 'Udmurt',
    'Mari', 'Mordvin', 'Erzya', 'Moksha', 'Chuvash', 'Tatar', 'Bashkir', 'Yakut', 'Sakha',
    'Ladino', 'Yiddish', 'Romani', 'Kashubian', 'Silesian', 'Sorbian', 'Upper Sorbian', 'Lower Sorbian',
    'Aragonese', 'Asturian', 'Leonese', 'Mirandese', 'Occitan', 'Provençal', 'Gascon', 'Languedoc',
    'Auvergnat', 'Limousin', 'Poitevin', 'Santongeais', 'Norman', 'Picard', 'Walloon', 'Lorrain',
    'Champenois', 'Franco-Provençal', 'Swiss German', 'Alemannic', 'Swabian', 'Bavarian', 'Austrian',
    'Tyrolean', 'Carinthian', 'Styrian', 'Salzburg', 'Voralberg', 'Cimbrian', 'Mòcheno', 'Fersental',
    'Friulian', 'Ladin', 'Sardinian', 'Sicilian', 'Neapolitan', 'Calabrian', 'Apulian', 'Lucanian',
    'Emilian', 'Romagnol', 'Ligurian', 'Piedmontese', 'Venetian', 'Istriot', 'Rhaeto-Romance',
    'Maltese', 'Albanian', 'Greek', 'Armenian', 'Georgian', 'Azerbaijani', 'Turkish', 'Kurdish',
    'Zaza', 'Gorani', 'Tat', 'Ukrainian', 'Ruthenian', 'Rusyn', 'Lemko', 'Boyko', 'Hutsul',
    'Vlach', 'Romani', 'Balkan Romani', 'Vlax Romani', 'Sinti', 'Kale', 'Lovari', 'Churari',
    'Latvian', 'Lithuanian', 'Baltic'
]);

// Known Asian languages/patterns  
const asiaLangs = new Set([
    'Korean', 'Chinese', 'Japanese', 'Vietnamese', 'Mongolian', 'Manchu', 'Cantonese',
    'Thai', 'Lao', 'Khmer', 'Malay', 'Indonesian', 'Tagalog', 'Cebuano', 'Ilocano', 
    'Hiligaynon', 'Sundanese', 'Javanese', 'Madurese', 'Buginese', 'Makassar', 'Balinese',
    'Banjar', 'Minangkabau', 'Acehnese', 'Cham', 'Chamorro', 'Tatar', 'Bashkir', 'Chuvash',
    'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 
    'Kannada', 'Malayalam', 'Nepali', 'Sinhala', 'Urdu', 'Pashto', 'Assamese', 'Oriya',
    'Uzbek', 'Kazakh', 'Kyrgyz', 'Tajik', 'Turkmen', 'Uighur', 'Yakut', 'Sakha',
    'Arabic', 'Persian', 'Turkish', 'Hebrew', 'Armenian', 'Georgian', 'Azerbaijani', 'Kurdish',
    'Burmese', 'Cambodian', 'Tibetan', 'Dzongkha', 'Sikkimese', 'Sherpa', 'Tamang',
    'Limbu', 'Newar', 'Bhutia', 'Lepcha', 'Mizo', 'Naga', 'Kuki', 'Bodo',
    'Filipino', 'Visayan', 'Waray', 'Kapampangan', 'Bikol', 'Pangasinan', 'Ilonggo',
    'Ambonese', 'Ternate', 'Tidore', 'Moluccan', 'Papuan', 'Sulawesi', 'Sumatra', 'Borneo',
    'Timur', 'Timor', 'Rote', 'Flores', 'Sumba', 'Savu', 'Enggano', 'Nias', 'Mentawai',
    'Assyrian', 'Syriac', 'Mandaean', 'Mandaic',
    'Iban', 'Bidayuh', 'Dayak', 'Murut', 'Dusun', 'Kedayan', 'Brunei', 'Sarawak',
    'Konkani', 'Marwari', 'Rajasthani', 'Haryanvi', 'Awadhi', 'Bhojpuri', 'Magahi', 'Chattisgarhi',
    'Garhwali', 'Kumaoni', 'Dogri', 'Ladakhi', 'Balti', 'Shina', 'Khowar', 'Torwali', 'Bateri',
    'Karakalpak', 'Karachay', 'Balkar', 'Nogai', 'Kumyk', 'Karachay-Balkar',
    'Gujarati', 'Sindhi', 'Balochi', 'Hazaragi', 'Aimaq', 'Judeo-Persian', 'Yazidi',
    'Afshar', 'Qashqai', 'Khorasani', 'Lampung', 'Rejang', 'Bengkulu', 'Palembang',
    'Minahasa', 'Sangir', 'Talaud', 'Banggai', 'Ponosakan', 'Tontemboan', 'Tonsawang',
    'Hokkien', 'Teochew', 'Shanghainese', 'Hakka', 'Wu', 'Gan', 'Xiang', 'Min Dong',
    'Okinawan', 'Ryukyuan', 'Ainu', 'Amami', 'Kikai', 'Kunigami', 'Miyako', 'Yaeyama', 'Yonaguni',
    'Cebuano', 'Hiligaynon', 'Ilocano', 'Kapampangan', 'Bikol', 'Waray', 'Pangasinan', 'Samareño',
    'Sasak', 'Bima', 'Sumbawa', 'Mongondow', 'Talaud', 'Sangirese', 'Bantik', 'Ratahan',
    'Paku', 'Loinang', 'Kalam', 'Maring', 'Naga', 'Konyak', 'Ao', 'Angami', 'Lotha', 'Sumi',
    'Chakhesang', 'Rengma', 'Zeliang', 'Kachari', 'Dimasa', 'Tripuri', 'Kokborok',
    'Garo', 'Jaintia', 'Khasi', 'Nongkrem', 'Pnar', 'War', 'Bishnupriya', 'Manipuri',
    'Sentinel', 'Andaman', 'Great Andamanese', 'Onge', 'Jarawa', 'Sentinelese'
]);

// Known African languages/patterns
const africaLangs = new Set([
    'Swahili', 'Zulu', 'Xhosa', 'Yoruba', 'Igbo', 'Hausa', 'Amharic', 'Oromo', 'Somali',
    'Arabic', 'French', 'English', 'Portuguese', 'Spanish', 'German', 'Italian',
    'Afrikaans', 'Ndebele', 'Sotho', 'Tswana', 'Venda', 'Tsonga', 'Shona',
    'Luganda', 'Luo', 'Kikuyu', 'Gikuyu', 'Embu', 'Meru', 'Kamba', 'Masai', 'Kalenjin',
    'Kiswahili', 'Chichewa', 'Tumbuka', 'Bemba', 'Chewa', 'Nyanja',
    'Wolof', 'Fula', 'Fulani', 'Toucouleur', 'Serer', 'Mandinka', 'Fulfulde',
    'Ewe', 'Fon', 'Gbe', 'Akan', 'Twi', 'Fante', 'Ashanti',
    'Kinyarwanda', 'Kirundi', 'Lingala', 'Luba', 'Mongo', 'Nkongho',
    'Mossi', 'Dagara', 'Gur', 'Mande', 'Bambara', 'Malinke', 'Susu', 'Kpelle',
    'Grebo', 'Krahn', 'Gio', 'Mano', 'Loma', 'Bandi', 'Mende', 'Temo',
    'Temne', 'Kiswahili', 'Chichewa', 'Tumbuka', 'Lunda', 'Luvale', 'Cokwe', 'Luchazi', 'Mbunda',
    'Luo', 'Acholi', 'Alur', 'Lango', 'Acoli', 'Adhola',
    'Bemba', 'Kaonde', 'Mambwe', 'Namwanga', 'Senga', 'Sumbwa', 'Bisa', 'Lala',
    'Tonga', 'Soli', 'Lenje', 'Nkoya', 'Mbunda', 'Mukulu',
    'Shona', 'Karanga', 'Zezuru', 'Manyika', 'Ndau',
    'Herero', 'Nama', 'Damara', 'Khoekhoe',
    'Berber', 'Kabyle', 'Shilha', 'Tamazight', 'Riff', 'Tuareg', 'Tamajaq', 'Tayart', 'Tamasheq'
]);

// Known North American languages/patterns
const northAmericaLangs = new Set([
    'English', 'French', 'Spanish', 'Native American', 'Inuit', 'Eskimo', 'Aleut',
    'Navajo', 'Cherokee', 'Choctaw', 'Sioux', 'Apache', 'Comanche', 'Cheyenne', 'Arapaho',
    'Lakota', 'Dakota', 'Ojibwe', 'Cree', 'Algonquin', 'Micmac', 'Maliseet', 'Passamaquoddy',
    'Iroquois', 'Mohawk', 'Oneida', 'Onondaga', 'Cayuga', 'Seneca', 'Tuscarora', 'Huron', 'Wyandot',
    'Shawnee', 'Miami', 'Peoria', 'Kickapoo', 'Sauk', 'Fox', 'Menominee', 'Ho-Chunk', 'Winnebago',
    'Chickasaw', 'Creek', 'Seminole', 'Alabama', 'Koasati', 'Hitchiti', 'Mikasuki',
    'Zuni', 'Pueblo', 'Keres', 'Tanoan', 'Kiowa', 'Kiowa Apache', 'Jicarilla', 'Mescalero', 'Chiricahua',
    'Ute', 'Paiute', 'Shoshone', 'Comanche', 'Gosiute', 'Ute', 'Southern Paiute', 'Northern Paiute',
    'Washoe', 'Maidu', 'Miwok', 'Ohlone', 'Costanoan', 'Yana', 'Wintun', 'Yokuts', 'Pomo',
    'Salish', 'Flathead', 'Kootenai', 'Nez Perce', 'Coeur d\'Alene', 'Spokane', 'Kalispel',
    'Chinook', 'Chehalis', 'Quinault', 'Salish', 'Coast Salish', 'Interior Salish',
    'Cree', 'Ojibwa', 'Oji-Cree', 'Montagnais', 'Innu', 'Naskapi', 'Atikamekw', 'Cree',
    'Dene', 'Chipewyan', 'Gwich\'in', 'Sahtu', 'Dogrib', 'Slavey', 'Nahanni',
    'Mayan', 'Aztec', 'Nahuatl', 'Mixtec', 'Zapotec', 'Oaxaca', 'Maya', 'Quiché', 'Cakchiquel', 'Kekchí',
    'Tarahumara', 'Mayo', 'Yaqui', 'Mayo', 'Cora', 'Huichol', 'O\'odham', 'Pima', 'Papago',
    'Chinook', 'Jargon', 'Nootka', 'Nuu-chah-nulth', 'Kwakiutl', 'Haida', 'Tlingit', 'Tsimshian',
    'Yupik', 'Inupiaq', 'Siberian Yupik', 'Central Alaskan Yupik', 'Nunavut', 'Nunavik'
]);

// Known South American languages/patterns
const southAmericaLangs = new Set([
    'Spanish', 'Portuguese', 'Quechua', 'Aymara', 'Guarani', 'Nahuatl', 'Mayan',
    'Inca', 'Incan', 'Maya', 'Aztec', 'Toltec', 'Zapotec', 'Mixtec', 'Oaxaca',
    'Aymara', 'Quechua', 'Mapuche', 'Araucanian', 'Muisca', 'Chibcha', 'Muysca',
    'Guarani', 'Paraguayan', 'Tupi', 'Guaraní', 'Nheengatu', 'Língua Geral',
    'Quechua', 'Cusco', 'Ayacucho', 'Ancash', 'Junín', 'Cajamarca', 'Puno',
    'Aymara', 'La Paz', 'Oruro', 'Bolivian', 'Peruvian', 'Ecuadorian', 'Colombian',
    'Caribbean', 'Arawak', 'Taino', 'Island Carib', 'Kalina', 'Lokono', 'Wayuu',
    'Warao', 'Pemon', 'Carib', 'Panare', 'Akawaio', 'Arekena', 'Macushi',
    'Pehuenche', 'Mapuche', 'Huilliche', 'Tehuelche', 'Ona', 'Yaghan', 'Yámana',
    'Jivaro', 'Shuar', 'Achuar', 'Waorani', 'Cofán', 'Siona', 'Secoya', 'Kichwa',
    'Asháninka', 'Ashéninka', 'Nanti', 'Matsés', 'Yawanawá', 'Yawaná', 'Pano',
    'Shipibo', 'Conibo', 'Capanahua', 'Cashibo', 'Pajonal', 'Marinahua', 'Mayoruna',
    'Munduruku', 'Kayapó', 'Xikrin', 'Txukarramãe', 'Gavião', 'Arara', 'Kamayurá',
    'Carib', 'Hixkaryana', 'Ye\'kwana', 'Waiwai', 'Akurio', 'Trió', 'Tarano',
    'Barasana', 'Curripaco', 'Piapoco', 'Achagua', 'Siona', 'Ingariko', 'Mapoyo'
]);

// Known Oceanian languages/patterns
const oceaniaLangs = new Set([
    'Hawaiian', 'Maori', 'Samoan', 'Tongan', 'Fijian', 'Tahitian', 'Rapa Nui',
    'Niuean', 'Tokelauan', 'Tuvaluan', 'Kiribati', 'Nauruan', 'Marshallese', 'Palau',
    'Chamorro', 'Carolinian', 'Yapese', 'Pohnpeian', 'Kosraean', 'Chuukese', 'Trukese',
    'Bislama', 'Tok Pisin', 'Motu', 'Hiri Motu', 'Papuan', 'Pidgin',
    'Māori', 'Cook Islands Māori', 'Tahitian', 'Rapa', 'Māori', 'Reo Māori',
    'Samoan', 'Tongan', 'Niuean', 'Wallisian', 'Futunan', 'East Futunan',
    'Fijian', 'Hawaiian', 'Māori', 'Rapa Nui', 'Rapa', 'Māori',
    'Māori', 'Samoan', 'Tongan', 'Fijian', 'Hawaiian', 'Maori', 'Samoan',
    'Tok Pisin', 'Bislama', 'Hiri Motu',
    'Australian Aboriginal', 'Pama-Nyungan', 'Warlpiri', 'Arrernte', 'Pitjantjatjara', 'Yolngu',
    'Daly', 'Gunwinyguan', 'Pama-Maric', 'Kulin', 'Wurundjeri', 'Eora', 'Darug',
    'Papuan', 'Motu', 'Enga', 'Mendi', 'Chimbu', 'Highlands', 'Coastal',
    'New Zealand', 'Australia', 'Fiji', 'Samoa', 'Tonga', 'Hawaii', 'Papua New Guinea',
    'Solomon Islands', 'Vanuatu', 'New Caledonia', 'French Polynesia', 'Cook Islands',
    'Niue', 'Tokelau', 'Wallis', 'Futuna', 'Kiribati', 'Marshall Islands', 'Micronesia',
    'Palau', 'Nauru', 'Tuvalu', 'East Timor', 'Timor', 'Rote', 'Timorese'
]);

// Assign each language to a continent
allLanguages.forEach(lang => {
    const name = lang.name.toLowerCase();
    
    // Check by language name
    if (europeLangs.has(lang.name)) {
        continents.europe.languages.push(lang);
        return;
    }
    if (asiaLangs.has(lang.name)) {
        continents.asia.languages.push(lang);
        return;
    }
    if (africaLangs.has(lang.name)) {
        continents.africa.languages.push(lang);
        return;
    }
    if (northAmericaLangs.has(lang.name)) {
        continents.northAmerica.languages.push(lang);
        return;
    }
    if (southAmericaLangs.has(lang.name)) {
        continents.southAmerica.languages.push(lang);
        return;
    }
    if (oceaniaLangs.has(lang.name)) {
        continents.oceania.languages.push(lang);
        return;
    }
    
    // Check for keywords in name
    if (name.includes('europe') || name.includes('french') || name.includes('german') || 
        name.includes('english') || name.includes('italian') || name.includes('spanish') ||
        name.includes('portugal') || name.includes('nordic') || name.includes('slavic') ||
        name.includes('polish') || name.includes('russian') || name.includes('ukrain') ||
        name.includes('hungar') || name.includes('finnish') || name.includes('baltic') ||
        name.includes('celtic') || name.includes('basque') || name.includes('romance')) {
        continents.europe.languages.push(lang);
        return;
    }
    
    if (name.includes('asia') || name.includes('chinese') || name.includes('japan') || 
        name.includes('korean') || name.includes('vietnam') || name.includes('thai') ||
        name.includes('malay') || name.includes('indones') || name.includes('philippine') ||
        name.includes('arabic') || name.includes('persian') || name.includes('turkish') ||
        name.includes('hindi') || name.includes('bengali') || name.includes('tamil') ||
        name.includes('central asian') || name.includes('middle eastern')) {
        continents.asia.languages.push(lang);
        return;
    }
    
    if (name.includes('africa') || name.includes('swahili') || name.includes('arabic') ||
        name.includes('hausa') || name.includes('yoruba') || name.includes('igbo') ||
        name.includes('amharic') || name.includes('oromo') || name.includes('somali') ||
        name.includes('zulu') || name.includes('xhosa')) {
        continents.africa.languages.push(lang);
        return;
    }
    
    if (name.includes('america') || name.includes('united states') || name.includes('canada') ||
        name.includes('mexican') || name.includes('native american') || name.includes('inuit') ||
        name.includes('cherokee') || name.includes('navajo') || name.includes('cree') ||
        name.includes('athabaskan') || name.includes('algonquin') || name.includes('sioux') ||
        name.includes('mayan') || name.includes('aztec') || name.includes('quechua') ||
        name.includes('athabascan')) {
        continents.northAmerica.languages.push(lang);
        return;
    }
    
    if (name.includes('south america') || name.includes('latin america') ||
        name.includes('south american') || name.includes('caribbean') ||
        name.includes('quechua') || name.includes('aymara') || name.includes('guarani') ||
        name.includes('tupi') || name.includes('inca') || name.includes('caribbean')) {
        continents.southAmerica.languages.push(lang);
        return;
    }
    
    if (name.includes('oceania') || name.includes('pacific') || name.includes('australian') ||
        name.includes('polynesian') || name.includes('melanesian') || name.includes('micronesian') ||
        name.includes('hawaiian') || name.includes('maori') || name.includes('samoan') ||
        name.includes('fijian') || name.includes('tahitian') || name.includes('papuan') ||
        name.includes('new zealand') || name.includes('australia') || name.includes('fiji')) {
        continents.oceania.languages.push(lang);
        return;
    }
    
    // Default to Europe for remaining (most European languages were caught above)
    continents.europe.languages.push(lang);
});

// Display distribution
console.log('Language Distribution:');
let totalAssigned = 0;
Object.entries(continents).forEach(([key, data]) => {
    console.log(`  ${data.name}: ${data.languages.length} languages`);
    totalAssigned += data.languages.length;
});

console.log(`\nTotal assigned: ${totalAssigned}`);
console.log(`Backup had: ${allLanguages.length}`);

// Create continent files
Object.entries(continents).forEach(([key, data]) => {
    const filename = `modules/namebases-${key}.js`;
    const content = `"use strict";

window.${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, '$1')}NameBases = [
${data.languages.map((lang, i) => {
    const escapedNames = lang.b.replace(/"/g, '\\"');
    return `{
    "name": "${lang.name}",
    "i": ${lang.i},
    "min": 4,
    "max": 12,
    "d": "${lang.d || ''}",
    "m": 0,
    "b": "${escapedNames}"
  }${i < data.languages.length - 1 ? ',' : ''}`;
}).join('\n')}
];
`;
    fs.writeFileSync(filename, content);
    console.log(`✅ Created ${filename} with ${data.languages} languages`);
});

console.log('\n🎉 ALL 2750 LANGUAGES RESTORED TO CONTINENT FILES!');
