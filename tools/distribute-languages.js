/**
 * Language Distribution Script
 * Extracts languages from backup and distributes to continent files
 */

const fs = require('fs');
const path = require('path');

// File paths
const backupFile = 'modules/namebases-real.backup-20251228-221152.js';
const outputDir = 'modules';
const tempJsonFile = 'modules/all-languages-temp.json';

// Continent classification sets
const continents = {
  europe: new Set([
    // Germanic
    'German', 'English', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Icelandic', 'Faroese', 'Luxembourgish', 'Austrian', 'Swiss German', 'Limburgish', 'Frisian', 'Low German', 'Scots', 'Yiddish', 'Afrikaans',
    // Romance
    'French', 'Italian', 'Spanish', 'Castillian', 'Portuguese', 'Romanian', 'Catalan', 'Galician', 'Occitan', 'Provençal', 'Sardinian', 'Corsican', 'Ladin', 'Friulian', 'Romansh', 'Neapolitan', 'Sicilian', 'Moldovan',
    // Slavic
    'Russian', 'Ukrainian', 'Polish', 'Czech', 'Slovak', 'Bulgarian', 'Serbian', 'Croatian', 'Bosnian', 'Slovenian', 'Macedonian', 'Belarusian', 'Kashubian', 'Silesian', 'Macedo-Romanian', 'Lusatian',
    // Baltic
    'Lithuanian', 'Latvian', 'Old Prussian',
    // Finno-Ugric
    'Finnish', 'Estonian', 'Hungarian', 'Karelian', 'Veps', 'Erzya', 'Moksha', 'Udmurt', 'Mari', 'Komi', 'Khanty', 'Mansi', 'Saami', 'Sami',
    // Celtic
    'Irish', 'Scottish Gaelic', 'Welsh', 'Breton', 'Cornish', 'Manx',
    // Greek
    'Greek', 'Romance', // Roman is also included
    // Other European
    'Albanian', 'Armenian', 'Georgian', 'Basque', 'Maltese', 'Turkish', 'Gagauz', 'Karaim', 'Kashubian', 'Votic', 'Voro',
    // Nordic
    'Nordic'
  ]),
  
  asia: new Set([
    // East Asian
    'Chinese', 'Mandarin', 'Cantonese', 'Wu Chinese', 'Min Chinese', 'Japanese', 'Korean', 'Mongolian', 'Tibetan', 'Burmese',
    // Southeast Asian
    'Vietnamese', 'Thai', 'Lao', 'Khmer', 'Malay', 'Indonesian', 'Javanese', 'Sundanese', 'Tagalog', 'Filipino', 'Cebuano', 'Ilocano', 'Hiligaynon', 'Bicol', 'Waray', 'Malagasy', 'Samoan', 'Tonga', 'Fijian', 'Hawaiian', 'Maori',
    // South Asian
    'Hindi', 'Bengali', 'Punjabi', 'Marathi', 'Gujarati', 'Urdu', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Sinhala', 'Nepali', 'Sanskrit', 'Pali', 'Konkani', 'Assamese', 'Odia', 'Sindhi', 'Kashmiri', 'Gujarati',
    // Central Asian
    'Kazakh', 'Uzbek', 'Turkmen', 'Kyrgyz', 'Tajik', 'Uyghur',
    // Middle Eastern
    'Arabic', 'Persian', 'Farsi', 'Pashto', 'Turkish', 'Azerbaijani', 'Uzbek', 'Kurdish', 'Hebrew', 'Syriac', 'Amharic', 'Tigrinya', 'Somali', 'Oromo', 'Hausa', 'Yoruba', 'Igbo', 'Zulu', 'Xhosa', 'Swahili',
    // Other Asian
    'Ainu', 'Chukchi', 'Evenki', 'Yakut', 'Buryat', 'Tatar', 'Bashkir', 'Chuvash', 'Sakha', 'Monguor', 'Dongxiang', 'Bonan', 'Salar', 'Hezhen', 'Nanai', 'Uilta', 'Orok', 'Nivkh', 'Ainu', 'Korean'
  ]),
  
  africa: new Set([
    // West African
    'Hausa', 'Yoruba', 'Igbo', 'Fula', 'Wolof', 'Manding', 'Bambara', 'Songhay', 'Moore', 'Dogon', 'Twi', 'Fante', 'Ga', 'Ewe', 'Fon', 'Beti', 'Fang', 'Bulu', 'Edo', 'Ibibio', 'Efik', 'Kanuri', 'Nupe', 'Gbayi',
    // East African
    'Swahili', 'Lingala', 'Kinyarwanda', 'Rundi', 'Ganda', 'Luganda', 'Luo', 'Chichewa', 'Nyanja', 'Bemba', 'Shona', 'Ndebele', 'Chewa', 'Tumbuka', 'Sena', 'Makhuwa', 'Makonde', 'Yao', 'Mijikenda', 'Giriama', 'Pokomo', 'Meru', 'Kikuyu', 'Embu', 'Kamba', 'Kisii', 'Luhya', 'Masai', 'Kalenjin', 'Karamojong', 'Acholi', 'Lango', 'Alur', 'Adhola', 'Jaluo',
    // Central African
    'French', 'Arabic', 'Sango', 'Zande', 'Ngbaka', 'Gbaya', 'Kongo', 'Kikongo', 'Venda', 'Tsonga',
    // Southern African
    'Zulu', 'Xhosa', 'Ndebele', 'Sotho', 'Tswana', 'Pedi', 'Venda', 'Tsonga', 'Chichewa', 'Nyanja', 'Bemba', 'Lozi', 'Shona', 'Nambya', 'Kgalagadi',
    // North African
    'Arabic', 'Berber', 'Kabyle', 'Tamazight', 'Shilha', 'Tuareg', 'Egyptian', 'Sudanese Arabic', 'Hassaniya',
    // Horn of Africa
    'Amharic', 'Tigrinya', 'Tigre', 'Oromo', 'Somali', 'Afar', 'Saho', 'Hadiyya', 'Kafa', 'Gurage', 'Silt\'e', 'Wolaytta', 'Kambaata', 'Alaba', 'Gamo', 'Gofa', 'Dizi', 'Mekan', 'Yeem', 'Basketo', 'Dira', 'Mao', 'Harari', 'Sidaama', 'Alagwa', 'Burji', 'Gurage', 'Mesmes', 'Nuer', 'Dinka', 'Shilluk', 'Nuba', 'Fur', 'Berti', 'Maba', 'Masalit', 'Kunama', 'Nara',
    // Other African languages
    'Bambara', 'Manding', 'Malinke', 'Dioula', 'Bobo', 'Boboola', 'Minianka', 'Senufo', 'Tagbana', 'Baoulé', 'Akan', 'Anyi', 'Aowin', 'Sebi', 'Alladian', 'Avikam', 'Ebrie', 'Krobou', 'Abé', 'Attie', 'Moyere', 'Ngere', 'Tchaman', 'Wè', 'Yoa', 'Zabrana', 'Wé', 'Kouya', 'Godie', 'Kodie', 'Nié', 'Palaka', 'Seme', 'Dida', 'Ngodjika', 'Nwa', 'Bakwe', 'Beti', 'Eton', 'Ewe', 'Ane', 'Congo', 'Kikongo', 'Monokutuba', 'Kisanga', 'Luba', 'Chiluba', 'Luo', 'Acholi', 'Alur', 'Adhola', 'Kumam', 'Masai', 'Teso', 'Karimojong', 'Pökoot', 'Nandi', 'Kipsigis', 'Elgeyo', 'Markweta', 'Sengwer', 'Ogiek', 'Kuria', 'Zimba', 'Mijikenda', 'Mijikenda'
  ]),
  
  northAmerica: new Set([
    // Native American - North
    'Navajo', 'Apache', 'Cherokee', 'Choctaw', 'Chickasaw', 'Creek', 'Seminole', 'Lakota', 'Dakota', 'Nakota', 'Ojibwe', 'Chippewa', 'Anishinaabe', 'Cree', 'Inuktitut', 'Inupiaq', 'Yupik', 'Aleut', 'Tlingit', 'Haida', 'Tsimshian', 'Kwakiutl', 'Nootka', 'Chinook', 'Pueblo', 'Hopi', 'Zuni', 'Pima', 'Papago', 'Yaqui', 'Mayo', 'Cochimí', 'Yuma', 'Mojave', 'Yavapai', 'Paiute', 'Shoshone', 'Ute', 'Comanche', 'Kiowa', 'Cheyenne', 'Arapaho', 'Blackfoot', 'Assiniboine', 'Crow', 'Hidatsa', 'Mandan', 'Arikara', 'Pawnee', 'Wichita', 'Kansa', 'Osage', 'Quapaw', 'Omaha', 'Ponca', 'Iroquois', 'Mohawk', 'Oneida', 'Onondaga', 'Cayuga', 'Seneca', 'Tuscarora', 'Delaware', 'Lenape', 'Susquehannock', 'Algonquin', 'Fox', 'Sauk', 'Kickapoo', 'Miami', 'Illinois', 'Menominee', 'Ho-Chunk', 'Winnebago', 'Maha', 'Quileute', 'Chinook', 'Salish', 'Okanagan', 'Spokane', 'Coeur d\'Alene', 'Kalispell', 'Flathead', 'Kootenai', 'Nez Perce', 'Palus', 'Walla Walla', 'Yakama', 'Klamath', 'Modoc', 'Yurok', 'Wiyot', 'Yana', 'Maidu', 'Miwok', 'Costanoan', 'Ohlone', 'Patwin', 'Wintun', 'Pomo', 'Yuki', 'Wappo', 'Lake Miwok', 'Coast Miwok', 'Miwok', 'Chumash', 'Tongva', 'Gabrielino', 'Fernandeño', 'Juaneño', 'Cupeño', 'Cahuilla', 'Serrano', 'Tataviam', 'Tongva', 'Kitanemuk', 'Vanyume', 'Chemehuevi', 'Southern Paiute',
    // European colonial languages
    'English', 'French', 'Spanish', 'Dutch', 'German', 'Norwegian', 'Swedish', 'Danish', 'Finnish', 'Russian',
    // Other North American
    'Haitian', 'Creole', 'Inuktitut', 'Cree', 'Ojibwa', 'Oji-Cree', 'Dene', 'Dene', 'Koyukon', 'Gwich\'in', 'Hän', 'Northern Tutchone', 'Southern Tutchone', 'Tagish', 'Kluane', 'Upper Tanana', 'Lower Tanana', 'Tanacross', 'Han', 'Doyakon', 'Kutchin', 'Koyukon', 'Holikachuk', 'Ingalik', 'Upper Kuskokwim', 'Lower Kuskokwim', 'Stoney', 'Cree', 'Metis', 'Michif', 'Cree', 'Saulteaux', 'Nisichow', 'Algonquin', 'Nishnaabe', 'Anishinaabemowin', 'Odawa', 'Potawatomi', 'Bodewadmimwen', 'Peoria', 'Wazhazhe', 'Osage', 'Káwahka', 'Quapaw', 'Chiwere', 'Ioway', 'Missouria', 'Otoe', 'Kansa', 'Omaha', 'Ponca', 'Dakota', 'Lakhota', 'Diné', 'Dził', 'Áshįįhí', 'Nááts\'íílí', 'Ma\'ii', 'Hashtł\'ishn', 'Naabeehó', 'Chííł', 'Hooghan', 'Tsé\'Bii\'Ndzisgaii', 'Mą\'ii\'hodoołí', 'Tʼááłáhí', 'Tséhootsooí', 'Dził', 'Tó', 'Ahéé\'', 'Shádi\'ááhí', 'Tsé', 'Nééz', 'Nahat\'á', 'Tsídii', 'Nááts\'íílí', 'Hozó', 'Kǫ́', 'Tsin', 'Báah', 'Mą', 'Béésh', 'Áshįįhí', 'Naaki', 'Nááshoó\'ą́', 'Téél', 'Hó', 'Gah', 'Tłéé\'é', 'Mósí', 'Łéé\'é', 'Dził', 'Hózhó', 'Dóó', 'Náá', 'K\'é', 'Shá', 'Yá', 'Bá', 'T\'áá', 'Nééz', 'Wózhó', 'T\'óó', 'Shé', 'Tłé', 'Há', 'Gó', 'Jó', 'Kó', 'Mó', 'Nó', 'Óó', 'Pó', 'Ró', 'Só', 'Tó', 'Wó', 'Xó', 'Yó', 'Zó', 'Áá', 'Éé', 'Íí', 'Óó', 'Úú'
  ]),
  
  southAmerica: new Set([
    // Native American - South
    'Quechua', 'Aymara', 'Guarani', 'Mapudungun', 'Nahuatl', 'Maya', 'Mayan', 'Chibcha', 'Tupi', 'Guarani', 'Warao', 'Cariban', 'Arawak', 'Maipurean', 'Panoan', 'Tacanan', 'Peba-Yaguan', 'Quechua', 'Aymara', 'Mapuche', 'Araucanian', 'Quechua', 'Aymara', 'Uru', 'Pukina', 'Mochica', 'Chimu', 'Chancay', 'Chincha', 'Huanca', 'Pallara', 'Chachapoyan', 'Cañari', 'Puruhá', 'Manta', 'Huancavillca', 'Tallán', 'Sechura', 'Chancay', 'Ichma', 'Chimú', 'Inca', 'Ayacucho', 'Cusco', 'Puno', 'Arequipa', 'Cuzco', 'Potosí', 'La Paz', 'Oruro', 'Sucre', 'Tarija', 'Beni', 'Santa Cruz', 'Asunción', 'Corrientes', 'Misiones', 'Paraguay', 'Chaco', 'Gran Chaco', 'Pantanal', 'Mato Grosso', 'Amazonas', 'Orinoco', 'Guiana', 'Suriname', 'Guyana', 'Venezuela', 'Colombia', 'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Brazil', 'Uruguay',
    // Colonial languages
    'Spanish', 'Portuguese', 'Quechua', 'Aymara', 'Guarani', 'French', 'Dutch',
    // Other South American
    'Brazillian', 'Portugese', 'Brasileiro', 'Rioplatense', 'Andalusian', 'Canary', 'Castilian'
  ]),
  
  oceania: new Set([
    // Australian Aboriginal
    'Warlpiri', 'Marrithiyel', 'Kunwinjku', 'Pitjantjatjara', 'Arrernte', 'Walpiri', 'Yolŋu', 'Dhuwal', 'Dhuwala', 'Gupapuyngu', 'Yolngu Matha', 'Tiwi', 'Ngan\'gikurungkurr', 'Kularri', 'Wajarri', 'Yamatji', 'Noongar', 'Nyoongar', 'Ngunnawal', 'Wiradjuri', 'Dharug', 'Dharawal', 'Gadigal', 'Eora', 'Awabakal', 'Kamilaroi', 'Gamilaraay', 'Yuwaalaraay', 'Wailan', 'Baraba Baraba', 'Wemba Wemba', 'Wergaia', 'Kulin', 'Boon Wurrung', 'Wurundjeri', 'Kulin', 'Ngunnawal', 'Wiradjuri', 'Djangadi', 'Yanyuwa', 'Rembarrnga', 'Rembarga', 'Nakkara', 'Marrithiyel', 'Marriamo', 'Marri Ngarr', 'Marri Tjevin', 'Worrorra', 'Wunambal', 'Gaambera', 'Wajarri', 'Yamatji', 'Marriman', 'Baiyungu', 'Miriwoong', 'Gurindji', 'Ngarinyman', 'Djaru', 'Walmajarri', 'Manjarr', 'Wangkatha', 'Noongar', 'Nyoongar', 'Yamatji', 'Miriuwung', 'Gidley', 'Thura-Yura', 'Nukunu', 'Kaurna', 'Pertame', 'Diyari', 'Kariyarra', 'Ngarluma', 'Yindjibarndi', 'Ngarti', 'Walmajarri', 'Djaru', 'Tjupany', 'Pintupi', 'Luritja', 'Pintupi', 'Wati', 'Ngaanyatjarra', 'Pitjantjatjara', 'Yankunytjatjara', 'Ngunytjung', 'Marri Tjevin', 'Bardi', 'Nyulnyul', 'Yawuru', 'Karrajong', 'Gambera', 'Ngarinyin', 'Wunambal', 'Worrorra', 'Woonkana', 'Bunuba', 'Gooniyandi', 'Ngarti', 'Djaru', 'Kukatja', 'Luritja', 'Pitjantjatjara', 'Antikarinya', 'Arabana', 'Wanggkandha', 'Mithaka', 'Kariyarra', 'Ngarluma', 'Yindjibarndi', 'Ngarti', 'Walmajarri', 'Djaru', 'Kukatja', 'Miriwoong', 'Gurindji', 'Ngarinyman', 'Dhuwal', 'Dhuwala', 'Gupapuyngu', 'Rembarrnga', 'Nakkara', 'Marrithiyel',
    // Papuan
    'Tok Pisin', 'Hiri Motu', 'Motu', 'Papuan', 'Enga', 'Welsh', 'Chin', 'Bantu', 'Sepik', 'Trans-New Guinea', 'Mekeo', 'Magi', 'Barok', 'Kewa', 'Huli', 'Duna', 'Kamoro', 'Amungme', 'Dani', 'Yali', 'Asmat', 'Marind', 'Mek', 'Kunimaipa', 'Gahuku', 'Fore', 'Kukukuku', 'Motu', 'Hiri', 'Pidgin', 'Bislama', 'Banyjima', 'Ngarluma', 'Yindjibarndi', 'Ngarti', 'Walmajarri', 'Djaru', 'Kukatja', 'Miriwoong', 'Gurindji', 'Ngarinyman', 'Dhuwal', 'Dhuwala', 'Gupapuyngu', 'Rembarrnga', 'Nakkara', 'Marrithiyel',
    // Pacific Island
    'Hawaiian', 'Maori', 'Samoan', 'Tongan', 'Fijian', 'Tahitian', 'Rapa Nui', 'Cook Islands', 'Māori', 'Reo Māori', 'Gagana Samoa', 'Gagana Tonga', 'Vosa Vakaviti', 'Hawaiian', 'Olelo', 'Niihau', 'Māori', 'Reo', 'Cook Islands Māori', 'Rapa', 'Tuamotuan', 'Mangarevan', 'Marquesan', 'Nuku Hiva', 'Uvea', 'Wallisian', 'Futunan', 'Niuean', 'Tokelauan', 'Tuvaluan', 'Kiribati', 'Gilbertese', 'Marshallese', 'Chuukese', 'Pohnpeian', 'Kosraean', 'Yapese', 'Palau', 'Chamorro', 'Carolinian', 'Nauruan', 'Fijian', 'Hawaiian', 'Maori', 'Samoan', 'Tongan', 'Tahitian', 'Rapa Nui', 'Māori', 'Reo Māori', 'Gagana Samoa', 'Gagana Tonga', 'Vosa Vakaviti', 'Hawaiian', 'Olelo', 'Niihau', 'Māori', 'Reo', 'Cook Islands Māori', 'Rapa', 'Tuamotuan', 'Mangarevan', 'Marquesan', 'Nuku Hiva', 'Uvea', 'Wallisian', 'Futunan', 'Niuean', 'Tokelauan', 'Tuvaluan', 'Kiribati', 'Gilbertese', 'Marshallese', 'Chuukese', 'Pohnpeian', 'Kosraean', 'Yapese', 'Palau', 'Chamorro', 'Carolinian', 'Nauruan', 'Fijian',
    // New Zealand
    'New Zealand', 'Aotearoa', 'Māori', 'English', 'Samoan', 'Tongan', 'Fijian', 'Cook Islands', 'Niuean', 'Tokelauan'
  ]),
  
  fantasy: new Set([
    'Elvish', 'Dwarven', 'Orcish', 'Gnomish', 'Halfling', 'Dragon', 'Goblin', 'Troll', 'Giant', 'Fairy', 'Pixie', 'Sprite', 'Nymph', 'Dryad', 'Centaur', 'Minotaur', 'Satyr', 'Faun', 'Mermaid', 'Merman', 'Siren', 'Phoenix', 'Dragon', 'Wyvern', 'Griffin', 'Pegasus', 'Unicorn', 'Basilisk', 'Chimera', 'Hydra', 'Sphinx', 'Gargoyle', 'Quetzalcoatl', 'Kitsune', 'Kappa', 'Tengu', 'Oni', 'Jorogumo', 'Kumiho', 'Naga', 'Garuda', 'Baku', 'Huli jing', 'Jiangshi', 'Banshee', 'Dullahan', 'Kelpie', 'Selkie', 'Kitsune', 'Tanuki', 'Kumiho', 'Huli jing', 'Nian', 'Qilin', 'Fenghuang', 'Long', 'Hu', 'Hound', 'Cú Chulainn', 'Conall Cernach', 'Fionn mac Cumhaill', 'Cú Roí', 'Medb', 'Morrígan', 'Badb', 'Macha', 'Niamh', 'Tír na nÓg', 'Avalon', 'Camelot', 'El Dorado', 'Shangri-La', 'Utopia', 'Atlantis', 'Lemuria', 'Mu', 'Hyperborea', 'Thule', 'Hy-Brasil', 'Irminsul', 'Yggdrasil', 'World Tree', 'Tree of Life', 'Dreamtime', 'Walkabout', 'Dreaming', 'Songlines', 'Tao', 'Qi', 'Prana', 'Chakra', 'Moksha', 'Nirvana', 'Satori', 'Zen', 'Taoism', 'Buddhism', 'Hinduism', 'Veda', 'Upanishad', 'Mahabharata', 'Ramayana', 'Edda', 'Kalevala', 'Mabinogion', 'Beowulf', 'Nibelungenlied', 'Song of Roland', 'Kalevala', 'Iliad', 'Odyssey', 'Aeneid', 'Mahabharata', 'Ramayana', 'Shahnameh', 'Heike', 'Genji'
  ])
};

// Read backup file
console.log('Reading backup file...');
const content = fs.readFileSync(backupFile, 'utf8');

// Extract all languages using regex
console.log('Extracting languages...');
const regex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*(\d+),\s*"max":\s*(\d+),\s*"d":\s*"([^"]*)",\s*"m":\s*([\d.]+),\s*"b":\s*"([^"]+)"\s*\}/g;
const languages = [];
let match;

while ((match = regex.exec(content)) !== null) {
  languages.push({
    name: match[1],
    i: parseInt(match[2]),
    min: parseInt(match[3]),
    max: parseInt(match[4]),
    d: match[5],
    m: parseFloat(match[6]),
    b: match[7]
  });
}

console.log(`Found ${languages.length} languages`);

// Save to temp JSON
console.log('Saving to temp JSON...');
fs.writeFileSync(tempJsonFile, JSON.stringify(languages, null, 2));
console.log(`Saved ${languages.length} languages to ${tempJsonFile}`);

// Function to classify a language
function classifyLanguage(langName) {
  const name = langName.trim();
  
  if (continents.europe.has(name)) return 'europe';
  if (continents.asia.has(name)) return 'asia';
  if (continents.africa.has(name)) return 'africa';
  if (continents.northAmerica.has(name)) return 'northAmerica';
  if (continents.southAmerica.has(name)) return 'southAmerica';
  if (continents.oceania.has(name)) return 'oceania';
  if (continents.fantasy.has(name)) return 'fantasy';
  
  // Fallback to keyword-based classification
  const lower = name.toLowerCase();
  
  // Asia keywords
  if (lower.includes('chinese') || lower.includes('mandarin') || lower.includes('cantonese') ||
      lower.includes('japanese') || lower.includes('korean') || lower.includes('vietnamese') ||
      lower.includes('thai') || lower.includes('lao') || lower.includes('khmer') ||
      lower.includes('malay') || lower.includes('indonesian') || lower.includes('javanese') ||
      lower.includes('tagalog') || lower.includes('filipino') || lower.includes('tibetan') ||
      lower.includes('mongolian') || lower.includes('burmese') || lower.includes('sanskrit') ||
      lower.includes('hindi') || lower.includes('bengali') || lower.includes('tamil') ||
      lower.includes('telugu') || lower.includes('kannada') || lower.includes('malayalam') ||
      lower.includes('urdu') || lower.includes('punjabi') || lower.includes('arabic') ||
      lower.includes('persian') || lower.includes('turkish') || lower.includes('urdu') ||
      lower.includes('pashto') || lower.includes('kurdish') || lower.includes('hebrew') ||
      lower.includes('amharic') || lower.includes('somali') || lower.includes('swahili') ||
      lower.includes('hausa') || lower.includes('yoruba') || lower.includes('igbo')) {
    return 'asia';
  }
  
  // Africa keywords
  if (lower.includes('swahili') || lower.includes('zulu') || lower.includes('xhosa') ||
      lower.includes('amharic') || lower.includes('somali') || lower.includes('oromo') ||
      lower.includes('hausa') || lower.includes('yoruba') || lower.includes('igbo') ||
      lower.includes('lingala') || lower.includes('kinyarwanda') || lower.includes('chichewa') ||
      lower.includes('wolof') || lower.includes('fula') || lower.includes('bambara') ||
      lower.includes('berber') || lower.includes('arabic')) {
    return 'africa';
  }
  
  // North America keywords
  if (lower.includes('navajo') || lower.includes('cherokee') || lower.includes('cree') ||
      lower.includes('ojibwe') || lower.includes('inuit') || lower.includes('inuktitut') ||
      lower.includes('dakota') || lower.includes('lakota') || lower.includes('choctaw') ||
      lower.includes('apache') || lower.includes('comanche') || lower.includes('sioux') ||
      lower.includes('pueblo') || lower.includes('hopi') || lower.includes('pima') ||
      lower.includes('haitian') || lower.includes('creole')) {
    return 'northAmerica';
  }
  
  // South America keywords
  if (lower.includes('quechua') || lower.includes('aymara') || lower.includes('guarani') ||
      lower.includes('mapuche') || lower.includes('nahuatl') || lower.includes('maya') ||
      lower.includes('mayan') || lower.includes('tupi') || lower.includes('araucanian')) {
    return 'southAmerica';
  }
  
  // Oceania keywords
  if (lower.includes('hawaiian') || lower.includes('maori') || lower.includes('samoan') ||
      lower.includes('tongan') || lower.includes('fijian') || lower.includes('tahitian') ||
      lower.includes('aboriginal') || lower.includes('australian') || lower.includes('papuan') ||
      lower.includes('tok pisin') || lower.includes('hiri') || lower.includes('motu')) {
    return 'oceania';
  }
  
  // Fantasy keywords
  if (lower.includes('elvish') || lower.includes('dwarven') || lower.includes('orcish') ||
      lower.includes('gnomish') || lower.includes('halfling') || lower.includes('draconic') ||
      lower.includes('infernal') || lower.includes('celestial') || lower.includes('primordial') ||
      lower.includes('sylvan') || lower.includes('abyssal') || lower.includes('underdark')) {
    return 'fantasy';
  }
  
  // Default to Europe
  return 'europe';
}

// Classify languages
console.log('\nClassifying languages...');
const continentData = {
  europe: [],
  asia: [],
  africa: [],
  northAmerica: [],
  southAmerica: [],
  oceania: [],
  fantasy: []
};

const unclassified = [];

for (const lang of languages) {
  const continent = classifyLanguage(lang.name);
  if (continentData[continent]) {
    continentData[continent].push(lang);
  } else {
    unclassified.push(lang);
  }
}

// Print statistics
console.log('\n=== CLASSIFICATION STATISTICS ===');
for (const [continent, langs] of Object.entries(continentData)) {
  console.log(`${continent}: ${langs.length} languages`);
}
console.log(`Unclassified: ${unclassified.length} languages`);

// Generate continent files
console.log('\nGenerating continent files...');

for (const [continent, langs] of Object.entries(continentData)) {
  const fileName = `namebases-${continent === 'northAmerica' ? 'northAmerica' : continent === 'southAmerica' ? 'southAmerica' : continent}.js`;
  const filePath = path.join(outputDir, fileName);
  
  // Generate file content
  let fileContent = `"use strict";

window.${continent === 'northAmerica' ? 'NorthAmericaNameBases' : continent === 'southAmerica' ? 'SouthAmericaNameBases' : continent.charAt(0).toUpperCase() + continent.slice(1) + 'NameBases'} = [
`;
  
  for (const lang of langs) {
    fileContent += `  {
    "name": "${lang.name}",
    "i": ${lang.i},
    "min": ${lang.min},
    "max": ${lang.max},
    "d": "${lang.d}",
    "m": ${lang.m},
    "b": "${lang.b}"
  },
`;
  }
  
  fileContent += `];
`;
  
  fs.writeFileSync(filePath, fileContent);
  console.log(`Generated ${fileName} with ${langs.length} languages`);
}

// Save unclassified languages
if (unclassified.length > 0) {
  const unclassifiedFile = 'modules/unclassified-languages.json';
  fs.writeFileSync(unclassifiedFile, JSON.stringify(unclassified, null, 2));
  console.log(`Saved ${unclassified.length} unclassified languages to ${unclassifiedFile}`);
}

console.log('\nDone! Distribution complete.');
