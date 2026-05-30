"use strict";

/**
 * Continental Namebase Distributor
 * 
 * Distributes all languages from namebases-all.js into appropriate continent files,
 * then generates a consolidated namebases-all.js from the distributed data.
 * 
 * Usage: node tools/distribute-continental-namebases.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'modules');
const CONTINENT_FILES = {
    'Africa': 'namebases-africa.js',
    'Asia': 'namebases-asia.js',
    'Europe': 'namebases-europe.js',
    'NorthAmerica': 'namebases-northAmerica.js',
    'SouthAmerica': 'namebases-southAmerica.js',
    'Oceania': 'namebases-oceania.js',
    'Fantasy': 'namebases-fantasy.js',
    'Unknown': 'namebases-unknown.js'
};

// Comprehensive continent mapping based on language families and regions
const CONTINENT_BY_LANGUAGE = {
    // === AFRICAN LANGUAGES ===
    // Niger-Congo
    'Berber': 'Africa', 'Arabic': 'Africa', 'Nigerian': 'Africa', 'Swahili': 'Africa',
    'Bemba': 'Africa', 'Zulu': 'Africa', 'Xhosa': 'Africa', 'Yoruba': 'Africa',
    'Igbo': 'Africa', 'Hausa': 'Africa', 'Amharic': 'Africa', 'Oromo': 'Africa',
    'Somali': 'Africa', 'Gurage': 'Africa', 'Wolof': 'Africa', 'Mossi': 'Africa',
    'Kanuri': 'Africa', 'Luba': 'Africa', 'Mbunda': 'Africa', 'Sandawe': 'Africa',
    'Hadza': 'Africa', 'Khoisan': 'Africa', 'Nama': 'Africa', 'Taa': 'Africa',
    'Nǁng': 'Africa', 'Naro': 'Africa', 'Sekele': 'Africa', 'Taa Click': 'Africa',
    'Nǁng Click': 'Africa', 'Naro Click': 'Africa', 'Ju': 'Africa', 'ǂKxʼauǁʼein': 'Africa',
    'Kgalagadi': 'Africa', 'Lozi': 'Africa', 'Ndebele': 'Africa', 'Shona': 'Africa',
    'Chewa': 'Africa', 'Lunda': 'Africa', 'Luvale': 'Africa', 'Chokwe': 'Africa',
    'Luyia': 'Africa', 'Kikuyu': 'Africa', 'Kamba': 'Africa', 'Meru': 'Africa',
    'Embu': 'Africa', 'Mijikenda': 'Africa', 'Mau': 'Africa', 'Maa': 'Africa',
    'Barabaig': 'Africa', 'Dinka': 'Africa', 'Nuer': 'Africa', 'Shilluk': 'Africa',
    'Nubi': 'Africa', 'Krio': 'Africa', 'Jola': 'Africa', 'Fula': 'Africa',
    'Wodaabe': 'Africa', 'Maba': 'Africa', 'Soninke': 'Africa', 'Mandinka': 'Africa',
    'Manding': 'Africa', 'Bambara': 'Africa', 'Malinke': 'Africa', 'Dioula': 'Africa',
    'Maninka': 'Africa', 'Susu': 'Africa', 'Yalunka': 'Africa', 'Kpelle': 'Africa',
    'Gola': 'Africa', 'Mende': 'Africa', 'Temne': 'Africa', 'Limba': 'Africa',
    'Wolaytta': 'Africa', 'Kafa': 'Africa', 'Gamo': 'Africa', 'Dawro': 'Africa',
    'Gofa': 'Africa', 'Karo': 'Africa', 'Basket': 'Africa', 'Dizi': 'Africa',
    'Mo': 'Africa', 'Shinasha': 'Africa', 'Bokoni': 'Africa', 'Opuuo': 'Africa',
    'Anyua': 'Africa', 'Ariol': 'Africa', 'Lese': 'Africa', 'Mbum': 'Africa',
    'Njem': 'Africa', 'Baya': 'Africa', 'Ngondi': 'Africa', 'Maka': 'Africa',
    'Beti': 'Africa', 'Eton': 'Africa', 'Bulu': 'Africa', 'Fang': 'Africa',
    'Bassa': 'Africa', 'Duala': 'Africa', 'Kumz': 'Africa', 'Deg': 'Africa',
    'Mofa': 'Africa', 'Ninma': 'Africa', 'Isu': 'Africa', 'Wulna': 'Africa',
    'Mundan': 'Africa', 'Mbay': 'Africa', 'Sara': 'Africa', 'Lai': 'Africa',
    'Gula': 'Africa', 'Mubi': 'Africa', 'Runga': 'Africa', 'Tobanga': 'Africa',
    'Kimr': 'Africa', 'Guruntal': 'Africa', 'Mbo': 'Africa', 'Bati': 'Africa',
    'Banka': 'Africa', 'Baya': 'Africa', 'Bodo': 'Africa', 'Uldeme': 'Africa',
    'Doul': 'Africa', 'Fiture': 'Africa', 'Mofor': 'Africa', 'Pangseng': 'Africa',
    'Jimbaya': 'Africa', 'Kumhio': 'Africa', 'Karekare': 'Africa', 'Ruthug': 'Africa',
    'Hdi': 'Africa', 'Mofu-Gudur': 'Africa', 'Mbre': 'Africa', 'Mada': 'Africa',
    'Wandala': 'Africa', 'Malgbe': 'Africa', 'Moloko': 'Africa', 'Vemgo-Mabas': 'Africa',
    'Musgu': 'Africa', 'Mundang': 'Africa', 'Tera': 'Africa', 'Ninam': 'Africa',
    'Bokoto': 'Africa', 'Dongo': 'Africa', 'Kpo': 'Africa', 'Kolak': 'Africa',
    'Gurdu': 'Africa', 'Mabire': 'Africa', 'Lele': 'Africa', 'Bua': 'Africa',
    'Fur': 'Africa', 'Saba': 'Africa', 'Birri': 'Africa', 'Baka': 'Africa',
    'Beli': 'Africa', 'Tuc': 'Africa', 'Wala': 'Africa', 'Yako': 'Africa',
    'Banda': 'Africa', 'Langbase': 'Africa', 'Pepo': 'Africa', 'Ngando': 'Africa',
    'Mpidie': 'Africa', 'Kota': 'Africa', 'Ndumu': 'Africa', 'Kela': 'Africa',
    'Kum': 'Africa', 'Pande': 'Africa', 'Mongo': 'Africa', 'Sakata': 'Africa',
    'Tetela': 'Africa', 'Humbu': 'Africa', 'Songo': 'Africa', 'Nzadi': 'Africa',
    'Mfinu': 'Africa', 'Ntomba': 'Africa', 'Libinza': 'Africa', 'Salampasu': 'Africa',
    'Luo': 'Africa', 'Kuria': 'Africa', 'Zigzag': 'Africa', 'Mbe': 'Africa',
    'Pokomo': 'Africa', 'Ngurimi': 'Africa', 'Iraqw': 'Africa', 'Burunge': 'Africa',
    'Gorwa': 'Africa', 'Alagwa': 'Africa', 'Bahi': 'Africa', 'Bena': 'Africa',
    'Hehe': 'Africa', 'Kinga': 'Africa', 'Manda': 'Africa', 'Ndali': 'Africa',
    'Samba': 'Africa', 'Wanda': 'Africa', 'Mwera': 'Africa', 'Zigula': 'Africa',
    'Senga': 'Africa', 'Tumbuka': 'Africa', 'Tonga': 'Africa', 'Lala': 'Africa',
    'Karanga': 'Africa', 'Zezuru': 'Africa', 'Korekore': 'Africa', 'Ndau': 'Africa',
    'Nambya': 'Africa', 'Kalanga': 'Africa', 'Venda': 'Africa', 'Tsonga': 'Africa',
    'Xitsonga': 'Africa', 'Ronga': 'Africa', 'Changana': 'Africa', 'Sesotho': 'Africa',
    'Tswana': 'Africa', 'Subiya': 'Africa', 'Totela': 'Africa', 'Fwe': 'Africa',
    'Kua': 'Africa', 'Yeyi': 'Africa', 'Mbariku': 'Africa', 'Soli': 'Africa',
    
    // Nilo-Saharan
    'Lezghian': 'Africa', 'Kumzari': 'Africa', 'Bashkar': 'Africa', 'Mahu': 'Africa',
    'Sao': 'Africa', 'Mbwa': 'Africa', 'Kujark': 'Africa', 'Kaw': 'Africa',
    'Sork': 'Africa', 'Koyra': 'Africa', 'Dendi': 'Africa', 'Kaado': 'Africa',
    'Tay': 'Africa', 'Mamara': 'Africa', 'Samogo': 'Africa', 'Bisa': 'Africa',
    'Wara': 'Africa', 'Jalka': 'Africa', 'Bangu': 'Africa', 'Pana': 'Africa',
    'Siamou': 'Africa', 'Tukuli': 'Africa', 'Gurma': 'Africa', 'Miyobe': 'Africa',
    'Nomaande': 'Africa', 'Busa': 'Africa', 'T coro': 'Africa', 'Gbii': 'Africa',
    'Loko': 'Africa', 'Kono': 'Africa', 'Loma': 'Africa', 'Kisi': 'Africa',
    'Sherbro': 'Africa', 'Krim': 'Africa', 'Bullom': 'Africa', 'Temi': 'Africa',
    'Balanta': 'Africa', 'Toucouleur': 'Africa', 'Serer': 'Africa',
    
    // Austroasiatic in Africa
    'Nubi': 'Africa',
    
    // === ASIAN LANGUAGES ===
    // Sino-Tibetan
    'Chinese': 'Asia', 'Japanese': 'Asia', 'Korean': 'Asia', 'Tibetan': 'Asia',
    'Dzongkha': 'Asia', 'Burmese': 'Asia', 'Assamese': 'Asia', 'Bodo': 'Asia',
    'Sichuan': 'Asia', 'Cantonese': 'Asia', 'Wu': 'Asia', 'Min': 'Asia',
    'Hakka': 'Asia', 'Jinyu': 'Asia', 'Xiang': 'Asia', 'Gan': 'Asia',
    'Hokkien': 'Asia', 'Teochew': 'Asia', 'Shanghainese': 'Asia', 'Hokchew': 'Asia',
    'Amoy': 'Asia', 'Fuzhou': 'Asia', 'Penang': 'Asia', 'Tibeto': 'Asia',
    'Lahu': 'Asia', 'Akha': 'Asia', 'Hani': 'Asia', 'Yi': 'Asia',
    'Lisu': 'Asia', 'Qiang': 'Asia', 'Naxi': 'Asia', 'Pumi': 'Asia',
    'Tujia': 'Asia', 'Bai': 'Asia', 'Dongxiang': 'Asia', 'Dong': 'Asia',
    'Buyi': 'Asia', 'Miao': 'Asia', 'Yao': 'Asia', 'She': 'Asia',
    'Jingpho': 'Asia', 'Kachin': 'Asia', 'Karen': 'Asia', 'Mon': 'Asia',
    'Rakhine': 'Asia', 'Arakanese': 'Asia', 'Shan': 'Asia', 'Rawang': 'Asia',
    
    // Austroasiatic
    'Vietnamese': 'Asia', 'Khmer': 'Asia', 'Mon': 'Asia', 'Bahnar': 'Asia',
    'Ede': 'Asia', 'Gia Rai': 'Asia', 'Ba Na': 'Asia', 'Xo Dang': 'Asia',
    'Brau': 'Asia', 'Co': 'Asia', 'Reng': 'Asia', 'Tay': 'Asia',
    'Nung': 'Asia', 'Mien': 'Asia', 'Hmong': 'Asia', 'Dao': 'Asia',
    
    // Tai-Kadai
    'Thai': 'Asia', 'Lao': 'Asia', 'Shan': 'Asia', 'Isan': 'Asia',
    'Lao': 'Asia', 'Phutai': 'Asia', 'Thai': 'Asia', 'Chiang': 'Asia',
    
    // Austronesian - Indonesian/Malay
    'Malay': 'Asia', 'Indonesian': 'Asia', 'Tagalog': 'Asia', 'Javanese': 'Asia',
    'Sundanese': 'Asia', 'Balinese': 'Asia', 'Madurese': 'Asia', 'Minangkabau': 'Asia',
    'Lampung': 'Asia', 'Banjarese': 'Asia', 'Buginese': 'Asia', 'Makassar': 'Asia',
    'Mongondow': 'Asia', 'Sangirese': 'Asia', 'Talaud': 'Asia', 'Gorontalo': 'Asia',
    'Cham': 'Asia', 'Roglai': 'Asia', 'Haroi': 'Asia', 'Filipino': 'Asia',
    'Hiligaynon': 'Asia', 'Cebuano': 'Asia', 'Ilocano': 'Asia', 'Kapampangan': 'Asia',
    'Pangasinan': 'Asia', 'Bikol': 'Asia', 'Waray': 'Asia', 'Manobo': 'Asia',
    'Maguindanao': 'Asia', 'Maranao': 'Asia', 'Tausug': 'Asia', 'Sama': 'Asia',
    'Yakan': 'Asia', 'Kalanguya': 'Asia', 'Ibaloi': 'Asia', 'Kalinga': 'Asia',
    'Ifugao': 'Asia', 'Bontok': 'Asia', 'Ilongot': 'Asia', 'Tagbanwa': 'Asia',
    'Hanunoo': 'Asia', 'Buhid': 'Asia', 'Ratagnon': 'Asia', 'Cuyunon': 'Asia',
    'Abaknon': 'Asia', 'Kedah': 'Asia', 'Kelantan': 'Asia', 'Pattani': 'Asia',
    'Banjar': 'Asia', 'Bugis': 'Asia', 'Toraja': 'Asia', 'Tontemboan': 'Asia',
    'Minahasa': 'Asia', 'Sangir': 'Asia', 'Lembata': 'Asia', 'Rote': 'Asia',
    'Timor': 'Asia', 'Bau': 'Asia', 'Mambae': 'Asia', 'Kemak': 'Asia',
    'Tetum': 'Asia', 'Galoli': 'Asia', 'Makalero': 'Asia', 'Makasae': 'Asia',
    'Loted': 'Asia', 'Waiwai': 'Asia', 'Biak': 'Asia', 'Yapen': 'Asia',
    'Serui': 'Asia', 'Nabire': 'Asia', 'Samarinda': 'Asia', 'Balikpapan': 'Asia',
    'Pontianak': 'Asia', 'Banjarmasin': 'Asia', 'Palangkaraya': 'Asia', 'Bun': 'Asia',
    'Amungme': 'Asia', 'Dani': 'Asia', 'Asmat': 'Asia', 'Korowai': 'Asia',
    'Marind': 'Asia', 'Yali': 'Asia', 'Mek': 'Asia', 'Hatam': 'Asia',
    'Mansim': 'Asia', 'Sulod': 'Asia', 'Panayan': 'Asia', 'Bohol': 'Asia',
    'Siquijor': 'Asia', 'Negros': 'Asia', 'Cebu': 'Asia', 'Manila': 'Asia',
    'Luzon': 'Asia', 'Mindanao': 'Asia', 'Visayas': 'Asia', 'Mindoro': 'Asia',
    'Palawan': 'Asia', 'Romblon': 'Asia', 'Masbate': 'Asia', 'Sorsogon': 'Asia',
    'Albay': 'Asia', 'Camarines': 'Asia', 'Kalayaan': 'Asia', 'Ati': 'Asia',
    'Iraya': 'Asia', 'Alangan': 'Asia', 'Tao': 'Asia', 'Ivatan': 'Asia',
    'Itbayat': 'Asia', 'Bashi': 'Asia', 'Yami': 'Asia', 'Manado': 'Asia',
    
    // Indo-Aryan
    'Hindi': 'Asia', 'Bengali': 'Asia', 'Punjabi': 'Asia', 'Tamil': 'Asia',
    'Telugu': 'Asia', 'Marathi': 'Asia', 'Urdu': 'Asia', 'Farsi': 'Asia',
    'Pashto': 'Asia', 'Kurdish': 'Asia', 'Nepali': 'Asia', 'Sinhala': 'Asia',
    'Dhivehi': 'Asia', 'Oriya': 'Asia', 'Gujarati': 'Asia', 'Rajasthani': 'Asia',
    'Pahari': 'Asia', 'Dogri': 'Asia', 'Kashmiri': 'Asia', 'Sindhi': 'Asia',
    'Balochi': 'Asia', 'Gilaki': 'Asia', 'Mazandarani': 'Asia', 'Luri': 'Asia',
    
    // Turkic
    'Uzbek': 'Asia', 'Kazakh': 'Asia', 'Turkmen': 'Asia', 'Kyrgyz': 'Asia',
    'Tajik': 'Asia', 'Azerbaijani': 'Asia', 'Uighur': 'Asia', 'Uyghur': 'Asia',
    
    // Mongolic
    'Mongolian': 'Asia',
    
    // === EUROPEAN LANGUAGES ===
    // Indo-European
    'German': 'Europe', 'English': 'Europe', 'French': 'Europe', 'Spanish': 'Europe',
    'Italian': 'Europe', 'Portuguese': 'Europe', 'Russian': 'Europe', 'Polish': 'Europe',
    'Ukrainian': 'Europe', 'Dutch': 'Europe', 'Greek': 'Europe', 'Hungarian': 'Europe',
    'Czech': 'Europe', 'Slovak': 'Europe', 'Romanian': 'Europe', 'Bulgarian': 'Europe',
    'Serbian': 'Europe', 'Croatian': 'Europe', 'Slovenian': 'Europe', 'Bosnian': 'Europe',
    'Macedonian': 'Europe', 'Albanian': 'Europe', 'Lithuanian': 'Europe', 'Latvian': 'Europe',
    'Estonian': 'Europe', 'Finnish': 'Europe', 'Swedish': 'Europe', 'Norwegian': 'Europe',
    'Danish': 'Europe', 'Icelandic': 'Europe', 'Irish': 'Europe', 'Welsh': 'Europe',
    'Breton': 'Europe', 'Cornish': 'Europe', 'Scottish': 'Europe', 'Gaelic': 'Europe',
    'Catalan': 'Europe', 'Basque': 'Europe', 'Galician': 'Europe', 'Occitan': 'Europe',
    'Provencal': 'Europe', 'Corsican': 'Europe', 'Sardinian': 'Europe', 'Friulian': 'Europe',
    'Ladin': 'Europe', 'Romansh': 'Europe', 'Swiss': 'Europe', 'Nordic': 'Europe',
    'Scandinavian': 'Europe', 'Sami': 'Europe', 'Lapp': 'Europe', 'Kven': 'Europe',
    'Faroese': 'Europe', 'Norn': 'Europe', 'Silesian': 'Europe', 'Lusatian': 'Europe',
    'Sorbian': 'Europe', 'Wendish': 'Europe', 'Kashubian': 'Europe', 'Moldovan': 'Europe',
    'Vlach': 'Europe', 'Aromanian': 'Europe', 'Megleno': 'Europe', 'Istro': 'Europe',
    'Macedo': 'Europe', 'Balkan': 'Europe', 'Cappadocian': 'Europe', 'Pontic': 'Europe',
    'Tsakonian': 'Europe', 'Judeo': 'Europe', 'Yiddish': 'Europe', 'Ladino': 'Europe',
    'Hebrew': 'Europe', 'Maltese': 'Europe', 'Malay': 'Europe', 'Larantuka': 'Europe',
    'Malaccan': 'Europe', 'Kristang': 'Europe', 'Papia': 'Europe', 'Manado': 'Europe',
    'Creole': 'Europe', 'Portugese': 'Europe', 'Spanish': 'Europe', 'Dutch': 'Europe',
    'British': 'Europe', 'Australian': 'Europe', 'American': 'Europe', 'Canadian': 'Europe',
    'New': 'Europe', 'Zealand': 'Europe', 'South': 'Europe', 'African': 'Europe',
    'Caribbean': 'Europe', 'West': 'Europe', 'Indian': 'Europe', 'Singapore': 'Europe',
    
    // === NORTH AMERICAN LANGUAGES ===
    // Uto-Aztecan
    'Nahuatl': 'NorthAmerica', 'Pima': 'NorthAmerica', 'O\'odham': 'NorthAmerica',
    'Yaqui': 'NorthAmerica', 'Mayo': 'NorthAmerica', 'Cora': 'NorthAmerica',
    'Huichol': 'NorthAmerica', 'Otomi': 'NorthAmerica', 'Mazahua': 'NorthAmerica',
    
    // Siouan
    'Dakota': 'NorthAmerica', 'Lakota': 'NorthAmerica', 'Sioux': 'NorthAmerica',
    'Chickasaw': 'NorthAmerica', 'Choctaw': 'NorthAmerica',
    
    // Algonquian
    'Cree': 'NorthAmerica', 'Ojibwe': 'NorthAmerica', 'Cherokee': 'NorthAmerica',
    'Muscogee': 'NorthAmerica', 'Creek': 'NorthAmerica', 'Seminole': 'NorthAmerica',
    'Miccosukee': 'NorthAmerica', 'Cheyenne': 'NorthAmerica', 'Arapaho': 'NorthAmerica',
    'Blackfoot': 'NorthAmerica', 'Cree': 'NorthAmerica', 'Montagnais': 'NorthAmerica',
    'Fox': 'NorthAmerica', 'Sauk': 'NorthAmerica', 'Kickapoo': 'NorthAmerica',
    'Menominee': 'NorthAmerica', 'Ojibwa': 'NorthAmerica', 'Ottawa': 'NorthAmerica',
    'Algonquin': 'NorthAmerica', 'Micmac': 'NorthAmerica', 'Malecite': 'NorthAmerica',
    
    // Iroquoian
    'Iroquois': 'NorthAmerica', 'Mohawk': 'NorthAmerica', 'Onondaga': 'NorthAmerica',
    'Cayuga': 'NorthAmerica', 'Seneca': 'NorthAmerica', 'Tuscarora': 'NorthAmerica',
    'Wyandot': 'NorthAmerica', 'Huron': 'NorthAmerica', 'Petun': 'NorthAmerica',
    
    // Athabaskan
    'Navajo': 'NorthAmerica', 'Apache': 'NorthAmerica', 'Chipewyan': 'NorthAmerica',
    'Dene': 'NorthAmerica', 'Slavey': 'NorthAmerica', 'Gwich\'in': 'NorthAmerica',
    
    // Salishan
    'Salish': 'NorthAmerica', 'Coeur d\'Alene': 'NorthAmerica', 'Flathead': 'NorthAmerica',
    'Kalispel': 'NorthAmerica', 'Spokane': 'NorthAmerica', 'Nez Perce': 'NorthAmerica',
    
    // Mayan
    'Maya': 'NorthAmerica', 'Yucatec': 'NorthAmerica', 'Kaqchikel': 'NorthAmerica',
    'K\'iche\'': 'NorthAmerica', 'Q\'eqchi\'': 'NorthAmerica', 'Mam': 'NorthAmerica',
    'Ixil': 'NorthAmerica', 'Q\'anjob\'al': 'NorthAmerica', 'Jakaltek': 'NorthAmerica',
    'Awakatek': 'NorthAmerica', 'Totonic': 'NorthAmerica', 'Chuj': 'NorthAmerica',
    'Acateco': 'NorthAmerica',
    
    // Mixe-Zoquean
    'Mixe': 'NorthAmerica', 'Zapotec': 'NorthAmerica', 'Chatino': 'NorthAmerica',
    'Triqui': 'NorthAmerica', 'Cuicatec': 'NorthAmerica', 'Chocho': 'NorthAmerica',
    'Popoloca': 'NorthAmerica', 'Mazatec': 'NorthAmerica', 'Chinantec': 'NorthAmerica',
    'Amuzgo': 'NorthAmerica', 'Mixtec': 'NorthAmerica', 'Trique': 'NorthAmerica',
    
    // Other North American
    'Hopi': 'NorthAmerica', 'Zuni': 'NorthAmerica', 'Pueblo': 'NorthAmerica',
    'Keres': 'NorthAmerica', 'Tiwa': 'NorthAmerica', 'Tewa': 'NorthAmerica',
    'Guarani': 'NorthAmerica', 'Paraguayan': 'NorthAmerica', 'Garifuna': 'NorthAmerica',
    'Miskito': 'NorthAmerica', 'Sumo': 'NorthAmerica', 'Cuna': 'NorthAmerica',
    'Kuna': 'NorthAmerica', 'Chibcha': 'NorthAmerica', 'Talamanca': 'NorthAmerica',
    'Bribri': 'NorthAmerica', 'Cabecar': 'NorthAmerica', 'Guaymi': 'NorthAmerica',
    
    // === SOUTH AMERICAN LANGUAGES ===
    // Quechuan
    'Quechua': 'SouthAmerica', 'Nheengatu': 'SouthAmerica',
    
    // Aymaran
    'Aymara': 'SouthAmerica',
    
    // Tupi-Guarani
    'Guarani': 'SouthAmerica', 'Tupi': 'SouthAmerica', 'Guajajara': 'SouthAmerica',
    'Tenetehara': 'SouthAmerica', 'Kaingang': 'SouthAmerica',
    
    // Other South American
    'Shipibo': 'SouthAmerica', 'Asháninka': 'SouthAmerica', 'Ashéninka': 'SouthAmerica',
    'Shuar': 'SouthAmerica', 'Achuar': 'SouthAmerica', 'Aguaruna': 'SouthAmerica',
    'Huambisa': 'SouthAmerica', 'Matsés': 'SouthAmerica', 'Matsigenka': 'SouthAmerica',
    'Yine': 'SouthAmerica', 'Capanawa': 'SouthAmerica', 'Kawap': 'SouthAmerica',
    'Xingu': 'SouthAmerica', 'Xavante': 'SouthAmerica', 'Bororo': 'SouthAmerica',
    'Carajá': 'SouthAmerica', 'Krahô': 'SouthAmerica', 'Kanela': 'SouthAmerica',
    'Kurum': 'SouthAmerica', 'Maku': 'SouthAmerica', 'Hupda': 'SouthAmerica',
    'Yuhup': 'SouthAmerica', 'Nadëb': 'SouthAmerica', 'Wará': 'SouthAmerica',
    'Dâw': 'SouthAmerica', 'Siona': 'SouthAmerica', 'Secoya': 'SouthAmerica',
    'Cofán': 'SouthAmerica', 'Inga': 'SouthAmerica', 'Kichwa': 'SouthAmerica',
    'Mapuche': 'SouthAmerica', 'Mapudungun': 'SouthAmerica', 'Araucano': 'SouthAmerica',
    'Huilliche': 'SouthAmerica', 'Selk\'nam': 'SouthAmerica', 'Ona': 'SouthAmerica',
    'Yagan': 'SouthAmerica', 'Yámana': 'SouthAmerica', 'Tehuelche': 'SouthAmerica',
    'Huarpe': 'SouthAmerica', 'Diaguita': 'SouthAmerica', 'Puelche': 'SouthAmerica',
    'Ranquel': 'SouthAmerica', 'Moloss': 'SouthAmerica', 'Poya': 'SouthAmerica',
    
    // === OCEANIAN LANGUAGES ===
    // Polynesian
    'Maori': 'Oceania', 'Hawaiian': 'Oceania', 'Samoan': 'Oceania', 'Tongan': 'Oceania',
    'Niuean': 'Oceania', 'Cook Islands': 'Oceania', 'Tahitian': 'Oceania', 'Rapa': 'Oceania',
    'Marquesas': 'Oceania', 'Tuamotu': 'Oceania', 'Mangareva': 'Oceania', 'Austral': 'Oceania',
    'Rapa': 'Oceania', 'Olelo': 'Oceania', 'Hawaii': 'Oceania', 'Oahu': 'Oceania',
    'Maui': 'Oceania', 'Kauai': 'Oceania', 'Lanai': 'Oceania', 'Molokai': 'Oceania',
    'Niihau': 'Oceania', 'Kahoolawe': 'Oceania', 'Aotearoa': 'Oceania',
    
    // Micronesian
    'Guam': 'Oceania', 'Chamorro': 'Oceania', 'Mariana': 'Oceania', 'Saipan': 'Oceania',
    'Palau': 'Oceania', 'Yapese': 'Oceania', 'Chuukese': 'Oceania', 'Trukese': 'Oceania',
    'Pohnpeian': 'Oceania', 'Kosraean': 'Oceania', 'Marshallese': 'Oceania',
    'Gilbertese': 'Oceania', 'Kiribati': 'Oceania', 'Nauruan': 'Oceania',
    
    // Fijian
    'Fijian': 'Oceania', 'Fiji': 'Oceania', 'Viti': 'Oceania',
    
    // Vanuatu
    'Bislama': 'Oceania', 'New Caledonia': 'Oceania', 'Kanak': 'Oceania',
    
    // Australian Aboriginal
    'Aboriginal': 'Oceania', 'Australian': 'Oceania', 'Pama': 'Oceania', 'Nyungan': 'Oceania',
    'Wiradjuri': 'Oceania', 'Wurundjeri': 'Oceania', 'Eora': 'Oceania', 'Darug': 'Oceania',
    'Dharawal': 'Oceania', 'Dharug': 'Oceania', 'Gadigal': 'Oceania', 'Wangal': 'Oceania',
    'Cammeraygal': 'Oceania', 'Kuringgai': 'Oceania', 'Awabakal': 'Oceania', 'Kamilaroi': 'Oceania',
    'Gamilaraay': 'Oceania', 'Yorta': 'Oceania', 'Murrinh': 'Oceania', 'Patha': 'Oceania',
    'Djinang': 'Oceania', 'Warray': 'Oceania', 'Kunwinjku': 'Oceania', 'Gunwinggu': 'Oceania',
    'Kunbarlang': 'Oceania', 'Miriwoong': 'Oceania', 'Gurindji': 'Oceania', 'Walmajarri': 'Oceania',
    'Martuthunira': 'Oceania', 'Yindjibarndi': 'Oceania', 'Ngarluma': 'Oceania', 'Yawuru': 'Oceania',
    'Bardi': 'Oceania', 'Nyulnyul': 'Oceania', 'Worrorra': 'Oceania', 'Wunambal': 'Oceania',
    'Gaambera': 'Oceania', 'Nyangumarta': 'Oceania', 'Wadjarri': 'Oceania', 'Badimaya': 'Oceania',
    'Pitjantjatjara': 'Oceania', 'Pintupi': 'Oceania', 'Luritja': 'Oceania', 'Arrernte': 'Oceania',
    'Anmatyerre': 'Oceania', 'Warlpiri': 'Oceania', 'Djiwarr': 'Oceania', 'Jaru': 'Oceania',
    'Gija': 'Oceania', 'Djaru': 'Oceania', 'Tjupany': 'Oceania', 'Yarli': 'Oceania',
    'Wangkatha': 'Oceania', 'Noongar': 'Oceania', 'Nyoongar': 'Oceania', 'Nyungar': 'Oceania',
    'Ngunnawal': 'Oceania', 'Ngunawal': 'Oceania', 'Ngarinyman': 'Oceania', 'Kukatja': 'Oceania',
    'Mudbura': 'Oceania', 'Kariyarra': 'Oceania', 'Mantharta': 'Oceania', 'Kartujarra': 'Oceania',
    
    // Papuan
    'Papua': 'Oceania', 'Papuan': 'Oceania', 'Trans': 'Oceania', 'New Guinea': 'Oceania',
    'West': 'Oceania', 'Irian': 'Oceania', 'Jaya': 'Oceania', 'Tok Pisin': 'Oceania',
    'Hiri': 'Oceania',
    
    // === FANTASY LANGUAGES ===
    'Fantasy': 'Fantasy', 'Elvish': 'Fantasy', 'Dwarvish': 'Fantasy', 'Orcish': 'Fantasy',
    'Goblin': 'Fantasy', 'Kobold': 'Fantasy', 'Gnome': 'Fantasy', 'Giant': 'Fantasy',
    'Draconic': 'Fantasy', 'Celestial': 'Fantasy', 'Abyssal': 'Fantasy', 'Infernal': 'Fantasy',
    'Primordial': 'Fantasy', 'Elemental': 'Fantasy', 'Sylvan': 'Fantasy', 'Druidic': 'Fantasy',
    'Runic': 'Fantasy', 'Thieves': 'Fantasy', 'Cant': 'Fantasy', 'Argot': 'Fantasy',
    'Necromancer': 'Fantasy', 'Arcane': 'Fantasy', 'Bardic': 'Fantasy', 'Sage': 'Fantasy'
};

function detectContinent(name) {
    // Try exact match first
    if (CONTINENT_BY_LANGUAGE[name]) return CONTINENT_BY_LANGUAGE[name];
    
    // Try partial match
    for (const [pattern, continent] of Object.entries(CONTINENT_BY_LANGUAGE)) {
        if (name.includes(pattern) || pattern.includes(name)) return continent;
    }
    
    return 'Unknown';
}

function parseNamebaseFile(content) {
    const entries = [];
    const namePattern = /\{\s*"name":\s*"([^"]+)"\s*,\s*"i":\s*(\d+)/g;
    
    let match;
    while ((match = namePattern.exec(content)) !== null) {
        const startPos = match.index;
        const name = match[1];
        const i = parseInt(match[2], 10);
        
        let endPos = content.indexOf('},', startPos);
        if (endPos === -1) endPos = content.length - 1;
        
        const entryBlock = content.substring(startPos, endPos + 2);
        const dMatch = entryBlock.match(/"d":\s*"([^"]*)"/);
        const bMatch = entryBlock.match(/"b":\s*"([^"]*)"/);
        const minMatch = entryBlock.match(/"min":\s*(\d+)/);
        const maxMatch = entryBlock.match(/"max":\s*(\d+)/);
        const mMatch = entryBlock.match(/"m":\s*([\d.]+)/);
        
        entries.push({
            name: name,
            i: i,
            min: minMatch ? parseInt(minMatch[1], 10) : 5,
            max: maxMatch ? parseInt(maxMatch[1], 10) : 12,
            d: dMatch ? dMatch[1] : '',
            m: mMatch ? mMatch[1] : '0',
            b: bMatch ? bMatch[1] : '',
            continent: detectContinent(name)
        });
    }
    
    return entries;
}

function generateEntryBlock(entry) {
    return `  {
    "name": "${entry.name}",
    "i": ${entry.i},
    "min": ${entry.min},
    "max": ${entry.max},
    "d": "${entry.d}",
    "m": ${entry.m},
    "b": "${entry.b}"
  }`;
}

function distributeEntries(entries) {
    const distributed = {};
    
    for (const entry of entries) {
        const continent = entry.continent;
        if (!distributed[continent]) distributed[continent] = [];
        distributed[continent].push(entry);
    }
    
    return distributed;
}

function generateFileContent(continent, entries) {
    const sortedEntries = entries.sort((a, b) => a.i - b.i);
    const entryBlocks = sortedEntries.map(generateEntryBlock).join(',\n');
    
    // Determine global name for this continent
    const globalNames = {
        'Africa': 'africaNameBases',
        'Asia': 'asiaNameBases',
        'Europe': 'europeNameBases',
        'NorthAmerica': 'northAmericaNameBases',
        'SouthAmerica': 'southAmericaNameBases',
        'Oceania': 'oceaniaNameBases',
        'Fantasy': 'fantasyNameBases',
        'Unknown': 'unknownNameBases'
    };
    
    const globalName = globalNames[continent] || 'unknownNameBases';
    
    return `"use strict";

window.${globalName} = [
${entryBlocks}
];

module.exports = window.${globalName};
`;
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    console.log('=== Continental Namebase Distributor ===\n');
    
    if (dryRun) {
        console.log('⚠️  DRY RUN MODE - No files will be modified\n');
    }
    
    // Load namebases-all.js
    const allFile = path.join(MODULES_DIR, 'namebases-all.js');
    if (!fs.existsSync(allFile)) {
        console.error('❌ namebases-all.js not found!');
        return;
    }
    
    const content = fs.readFileSync(allFile, 'utf8');
    const entries = parseNamebaseFile(content);
    
    console.log(`✅ Loaded ${entries.length} languages from namebases-all.js\n`);
    
    // Distribute entries by continent
    const distributed = distributeEntries(entries);
    
    // Show distribution
    console.log('Distribution by continent:');
    for (const [continent, langs] of Object.entries(distributed)) {
        console.log(`  ${continent}: ${langs.length} languages`);
    }
    console.log('');
    
    // Generate and write continent files
    for (const [continent, langs] of Object.entries(distributed)) {
        const filename = CONTINENT_FILES[continent];
        if (!filename) continue;
        
        const filepath = path.join(MODULES_DIR, filename);
        const fileContent = generateFileContent(continent, langs);
        
        console.log(`📝 ${filename}: ${langs.length} languages`);
        
        if (!dryRun) {
            fs.writeFileSync(filepath, fileContent, 'utf8');
            console.log(`   ✅ Written to ${filename}`);
        }
    }
    
    console.log('\n=== Done ===');
    
    if (dryRun) {
        console.log('⚠️  Run without --dry-run to actually write files');
    }
}

if (require.main === module) {
    main();
}

module.exports = { parseNamebaseFile, distributeEntries, detectContinent };
