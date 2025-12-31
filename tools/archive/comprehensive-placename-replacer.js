/**
 * Comprehensive Placename Replacer for namebases-real.js
 * Handles all remaining _unq# placeholders with region-appropriate names
 */

const fs = require('fs');

// Extensive regional placename database
const PLACENAME_DATABASE = {
    // South American languages
    'mtp': ['Manu', 'MadreDeDios', 'Beni', 'Heath', 'Orthon', 'Pariamanu', 'BocaManu', 'PuertoMaldonado', 'CuscoAmazonico', 'Tambopata', 'Acre', 'Pando'],
    'wlv': ['Bermejo', 'Tarija', 'Yacuiba', 'Villamontes', 'Carapari', 'Padcaya', 'EntreRios', 'SanLorenzo', 'PalosBlancos', 'Carando', 'CampoPajoso', 'Villazon'],
    'poi': ['Soteapan', 'Tatahuicapan', 'Pajapan', 'Mecayapan', 'Tatahuicapa', 'Oluta', 'Texistepec', 'Sayula', 'Hueyapan', 'Mixtla', 'Texhuacan', 'Zongolica'],
    'tpx': ['Ayutla', 'Tlacoapa', 'Malinaltepec', 'Tlapa', 'Xochistlahuaca', 'Pinotepa', 'Juquila', 'Santiago', 'Putla', 'Tlacolula', 'Yutanduchi', 'SantoDomingo'],
    'ppi': ['SantaCatarina', 'SanJose', 'SanIsidro', 'SantaMaria', 'SanJuan', 'SanPedro', 'SanMiguel', 'SanLuis', 'SanAntonio', 'SanDiego', 'SanPablo', 'SanMartin'],
    'slj': ['SanLorenzo', 'SantaRosa', 'SanCarlos', 'SanMiguel', 'SanPedro', 'SanJuan', 'SanJose', 'SantaMaria', 'SanAntonio', 'SanLuis', 'SanDiego', 'SanPablo'],
    'tsi': ['Ketchikan', 'Sitka', 'Juneau', 'Petersburg', 'Wrangell', 'Klawock', 'Craig', 'Kasaan', 'Hoonah', 'Angoon', 'Gustavus', 'Tenakee'],

    // Southeast Asian languages
    'gelao': ['Liuzhi', 'Longlin', 'Zhenfeng', 'PuAn', 'Qinglong', 'Wangmo', 'Ceheng', 'Xingren', 'Ziyun', 'GuAn', 'Pingba', 'Anshun'],
    'tongzha': ['Tongzhang', 'Wuming', 'Shanglin', 'Baise', 'Pingguo', 'Debao', 'Jingxi', 'Longan', 'Xilin', 'Leye', 'Napoh', 'Tianyang'],
    'telue': ['Telukbetung', 'Liwa', 'Kotabumi', 'Metro', 'Bandarlampung', 'Pringsewu', 'Pesawaran', 'Tanggamus', 'LampungSelatan', 'Mesuji', 'Tulangbawang', 'WayKanan'],
    'then-kam-sui': ['Sanjiang', 'Rongshui', 'Congjiang', 'RongAn', 'Sanjiang', 'Luocheng', 'Yizhou', 'Hechi', 'Nandan', 'TianE', 'Fengshan', 'DuAn'],
    'nong-zhuang': ['Nanning', 'Liuzhou', 'Guilin', 'Wuzhou', 'Beihai', 'Fangchenggang', 'Qinzhou', 'Guigang', 'Yulin', 'Baise', 'Hezhou', 'Hechi'],

    // African languages
    'tsamai_5872': ['ArbaMinch', 'Chencha', 'Konso', 'Jinka', 'Mago', 'Dimeka', 'Turmi', 'Karo', 'Hamer', 'Benna', 'Ari', 'Mursi'],
    'el-molo_5873': ['Loyangalani', 'Marsabit', 'NorthHorror', 'Illeret', 'Kargi', 'NorthHorror', 'Loyangalani', 'Marsabit', 'Moyale', 'Sololo', 'NorthHorror', 'Loyangalani'],
    'saho_5874': ['Dekemhare', 'Foro', 'Beilul', 'Tio', 'Hirgigo', 'Massawa', 'Ghinda', 'Nakfa', 'Afabet', 'Keren', 'Asmara', 'AdiKeyh'],
    'somali_5875': ['Mogadishu', 'Hargeisa', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa', 'Jowhar', 'Beledweyne', 'Burao', 'Galkayo', 'Bardheere', 'Jalalaqsi'],

    // European regional languages
    'bavarian': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Wurzburg', 'Erlangen', 'Bayreuth', 'Bamberg', 'Kempten', 'Landshut', 'Passau'],
    'cim': ['Luserna', 'Lavarone', 'Folgaria', 'Asiago', 'Enego', 'Roana', 'Rotzo', 'Gallio', 'Foza', 'Pedemonte', 'Trento', 'Vicenza'],
    'limburgish': ['Maastricht', 'Heerlen', 'Sittard', 'Geleen', 'Kerkrade', 'Vaals', 'Venlo', 'Roermond', 'Weert', 'Eindhoven', 'Helmond', 'DenBosch'],
    'low-german': ['Hamburg', 'Bremen', 'Hanover', 'Oldenburg', 'Bielefeld', 'Muenster', 'Osnabrueck', 'Braunschweig', 'Wolfsburg', 'Goettingen', 'Hildesheim', 'Salzgitter'],

    // Asian languages
    'ghe': ['Ghale', 'Gorkha', 'Lamjung', 'Manang', 'Mustang', 'Dolpo', 'Mugu', 'Jumla', 'Kalikot', 'Dailekh', 'Surkhet', 'Banke'],
    'ghh': ['Ghale', 'Gorkha', 'Lamjung', 'Manang', 'Mustang', 'Dolpo', 'Mugu', 'Jumla', 'Kalikot', 'Dailekh', 'Surkhet', 'Banke'],
    'ghr': ['Ghara', 'Tharparkar', 'MirpurKhas', 'Umerkot', 'Sanghar', 'NausheroFeroze', 'Khairpur', 'Sukkur', 'Larkana', 'Jacobabad', 'Shikarpur', 'Kashmore'],
    'ghomara': ['Ghazaouet', 'Tlemcen', 'Nedroma', 'BeniSaf', 'Sebbah', 'Hennaya', 'Maghnia', 'OuledMimoun', 'Chetouane', 'HammamBouhadjar', 'Honaïne', 'AïnTallout'],
    'gidar-language': ['Gidar', 'Guddu', 'Kashmore', 'Jacobabad', 'Shikarpur', 'Larkana', 'Kambar', 'Shahdadkot', 'Kandhkot', 'Sukkur', 'Rohri', 'Khairpur'],
    'hruso': ['Hrusso', 'Lohit', 'Anjaw', 'Changlang', 'Tirap', 'Longding', 'Kamle', 'KraDaadi', 'Namsai', 'Chowkham', 'Hayuliang', 'Manmao'],
    'hto': ['Hitoto', 'Minica', 'Muinane', 'Bora', 'Miranya', 'Resigaro', 'Andoque', 'Ocaina', 'Nonuya', 'Yagua', 'Ticuna', 'Cocama'],
    'huba': ['Huba', 'Kilba', 'Dugong', 'Bali', 'Ngizim', 'Sukur', 'Waja', 'Mburku', 'Maka', 'Nggwahyi', 'Mwaghavul', 'Zul'],
    'huizhou': ['Huizhou', 'Jixi', 'Wuyuan', 'Qimen', 'Shitai', 'Xiuning', 'Huangshan', 'Tunxi', 'Shexian', 'YiXian', 'Qingyang', 'Jingde'],
    'huilliche': ['Osorno', 'PuertoMontt', 'Castro', 'Ancud', 'Quellon', 'Chonchi', 'Dalcahue', 'Puqueldon', 'Queilen', 'Quinchao', 'Curaco', 'Quemchi'],
    'huishui': ['Huishui', 'Zhenning', 'Guanling', 'Ziyun', 'Wangmo', 'Luodian', 'Dushan', 'Libo', 'Sandu', 'Longli', 'Daozhen', 'Wuchuan'],
    'huli': ['Tari', 'Komo', 'Koroba', 'Hewa', 'Angal', 'Kandep', 'Lufa', 'Imbonggu', 'Kagua', 'Erave', 'Salt', 'Yuna'],
    'humene': ['Humene', 'Koiari', 'Barai', 'Orokolo', 'MountainKoiari', 'GrassKoiari', 'Koiari', 'Koita', 'Aeka', 'Barai', 'Opao', 'Kare'],
    'hun-saare': ['Saare', 'Hun', 'Duka', 'Kukawa', 'Monguno', 'Gubio', 'Marte', 'Abadam', 'Mobbar', 'KalaBalge', 'Jere', 'Maiduguri'],
    'hupla': ['Hupla', 'Dani', 'Yali', 'Nduga', 'Lani', 'Nggem', 'Wanggom', 'Yonggom', 'Momuna', 'Tsaukambo', 'Dem', 'Una'],
    'kvx': ['Parkari', 'Koli', 'Tharparkar', 'MirpurKhas', 'Umerkot', 'Sanghar', 'NausheroFeroze', 'Khairpur', 'Sukkur', 'Larkana', 'Jacobabad', 'Shikarpur'],
    'kwoma-manambu-pidgin': ['Kwoma', 'Manambu', 'Arapesh', 'Teptep', 'Pahi', 'Singsing', 'Sengo', 'Mianmin', 'Mundugumor', 'Miani', 'Siliput', 'Hagahai'],
    'kxu': ['Kui', 'Kondh', 'Khond', 'Kandha', 'Kutia', 'Dongria', 'Pengo', 'Muria', 'Dora', 'Gumba', 'Sodia', 'Jatapu'],
    'kyaka': ['Kyaka', 'Engenni', 'Kalabari', 'Nembe', 'Ogbia', 'Okrika', 'Degema', 'Eleme', 'Gokana', 'Khana', 'Odual', 'Opobo'],
    'kyakhta-russian-chinese-pidgin': ['Kyakhta', 'Maimaicheng', 'Altanbulag', 'Tamsagbulag', 'Zuunmod', 'Sainshand', 'Choir', 'Zamiin-Uud', 'Bulgan', 'Mandalgobi', 'Bayankhongor', 'Ulaanbaatar'],
    'kyowa-go': ['Kyowa', 'Yamato', 'Okinawa', 'Ryukyu', 'Sakishima', 'Miyako', 'Yaeyama', 'Daito', 'Oki', 'Sado', 'Tsushima', 'Izu'],
    'kyv': ['Kewat', 'Mallah', 'Nishad', 'Bhojpuri', 'Maithili', 'Magahi', 'Sadri', 'Khortha', 'Kurukh', 'Mundari', 'Santali', 'Oraon'],
    'kyw': ['Kurmali', 'Sadri', 'Nagpuria', 'Sadani', 'Khortha', 'Kurukh', 'Mundari', 'Santali', 'Oraon', 'Ho', 'Birhor', 'Asur'],
    'kzi': ['Kelabit', 'LunDayeh', 'Murut', 'Tidong', 'Tagal', 'Sembakung', 'Berau', 'Bulungan', 'Nunukan', 'TanaTidung', 'Malinau', 'Kayan'],
    'l-ngua-geral-paulista': ['SaoPaulo', 'Campinas', 'Santos', 'Sorocaba', 'RibeiraoPreto', 'SaoJoseCampos', 'Bauru', 'SaoCarlos', 'Piracicaba', 'Jundiai', 'Americana', 'Marilia'],
    'laal': ['Laal', 'Mbum', 'Kpere', 'Voko', 'Mbere', 'Mada', 'Karang', 'Gude', 'Nizaa', 'Mefele', 'Kpasam', 'Tikari'],
    'labrador-inuit-pidgin-french': ['Labrador', 'Newfoundland', 'Quebec', 'Montreal', 'TroisRivieres', 'QuebecCity', 'Rimouski', 'Matane', 'Gaspe', 'SeptIles', 'BaieComeau', 'BlancSablon'],
    'lachi': ['Lachi', 'Zhuang', 'Tai', 'Nung', 'Thai', 'Lao', 'Shan', 'Dai', 'Buyei', 'Dong', 'Miao', 'Yao'],
    'laha': ['Laha', 'Ambon', 'Seram', 'Haruku', 'Saparua', 'Nusalaut', 'Manipa', 'Tulang', 'Latu', 'Seho', 'Sila', 'Alang'],
    'lahu': ['Lahu', 'Wa', 'Bulang', 'Deang', 'Blang', 'U', 'Yi', 'Hani', 'Akha', 'Jino', 'Bisu', 'Pho'],
    'laiuse-romani': ['Romani', 'Kalderash', 'Lovari', 'Machvaya', 'Sinti', 'Roma', 'Domari', 'Lomavren', 'Balkan', 'Vlax', 'Gurvari', 'Xoraxane'],
    'lakota': ['PineRidge', 'Rosebud', 'StandingRock', 'CheyenneRiver', 'LowerBrule', 'CrowCreek', 'Yankton', 'Santee', 'Flandreau', 'PrairieIsland', 'LowerSioux', 'Shakopee'],
    'lampung': ['Lampung', 'Bandarlampung', 'Metro', 'Pringsewu', 'Tanggamus', 'LampungSelatan', 'LampungTengah', 'LampungUtara', 'LampungTimur', 'LampungBarat', 'PesisirBarat', 'WayKanan'],
    'land-dayak': ['Sarawak', 'Kalimantan', 'Pontianak', 'Sambas', 'Singkawang', 'Bengkayang', 'Landak', 'Sekadau', 'Sintang', 'KapuasHulu', 'Melawi', 'KayongUtara'],
    'lanping-bai-dialect': ['Lanping', 'Lijiang', 'Dali', 'Baoshan', 'Tengchong', 'Ruili', 'Luxi', 'Yongping', 'Yangbi', 'Weishan', 'Nanjian', 'Yongsheng'],
    'tura': ['Tura', 'Meghalaya', 'GaroHills', 'WestGaroHills', 'EastGaroHills', 'SouthGaroHills', 'NorthGaroHills', 'WestKhasiHills', 'EastKhasiHills', 'JaintiaHills', 'RiBhoi', 'SouthWestKhasiHills'],
    'northern-khanty': ['KhantyMansiysk', 'Surgut', 'Nizhnevartovsk', 'Beloyarsky', 'Raduzhny', 'Langepas', 'Megion', 'Kogalym', 'PytYakh', 'Lyantor', 'Pokachi', 'Uray'],
    'sherkal': ['Sherkal', 'Uzbek', 'Tajik', 'Kazakh', 'Kyrgyz', 'Turkmen', 'Uyghur', 'Tatar', 'Bashkir', 'Chuvash', 'Sakha', 'Tuvinian'],
    'southern-khanty': ['KhantyMansiysk', 'Surgut', 'Nizhnevartovsk', 'Beloyarsky', 'Raduzhny', 'Langepas', 'Megion', 'Kogalym', 'PytYakh', 'Lyantor', 'Pokachi', 'Uray'],
    'upper-demjanka': ['Demjanka', 'UpperOb', 'MiddleOb', 'LowerOb', 'Irtysh', 'Tobol', 'Tura', 'Tavda', 'Sось', 'Vagay', 'Uvat', 'Nizhnevartovsk'],
    'surgut-khanty': ['Surgut', 'KhantyMansiysk', 'Nizhnevartovsk', 'Beloyarsky', 'Raduzhny', 'Langepas', 'Megion', 'Kogalym', 'PytYakh', 'Lyantor', 'Pokachi', 'Uray'],
    'malij-jugan': ['Jugan', 'Khanty', 'Mansi', 'Ob', 'Irtysh', 'Surgut', 'KhantyMansiysk', 'Nizhnevartovsk', 'Beloyarsky', 'Raduzhny', 'Langepas', 'Megion'],
    'tremjugan': ['Tremjugan', 'Khanty', 'Mansi', 'Ob', 'Irtysh', 'Surgut', 'KhantyMansiysk', 'Nizhnevartovsk', 'Beloyarsky', 'Raduzhny', 'Langepas', 'Megion'],
    'lusoga': ['Lusoga', 'Buganda', 'Busoga', 'Bukedi', 'Teso', 'Lango', 'Acholi', 'WestNile', 'Bunyoro', 'Tooro', 'Ankole', 'Kigezi'],
    'tetserret': ['Tetserret', 'Tamahaq', 'Tamashek', 'Touareg', 'Ahaggar', 'Aïr', 'Azawagh', 'Adrar', 'Tanezrouft', 'Hoggar', 'Tassili', 'Acacus'],
    'ber-family': ['Berber', 'Amazigh', 'Kabyle', 'Chaoui', 'Riffian', 'Tamazight', 'Tachelhit', 'Tarifit', 'Zenati', 'Sanusi', 'Tuareg', 'Zenaga'],
    'tasawaq': ['Tasawaq', 'Ingal', 'Dawsahak', 'Tadaksahak', 'Tagdal', 'Takadaksahak', 'Tegali', 'Timbuktu', 'Gao', 'Ansongo', 'Bandiagara', 'Douentza'],
    'tagdal': ['Tagdal', 'Tasawaq', 'Ingal', 'Dawsahak', 'Tadaksahak', 'Takadaksahak', 'Tegali', 'Timbuktu', 'Gao', 'Ansongo', 'Bandiagara', 'Douentza'],
    'talodi': ['Talodi', 'Nuba', 'Dilling', 'Nyimang', 'Tulishi', 'Tira', 'Keiga', 'Fungor', 'Katcha', 'Wali', 'Laro', 'Tocho'],
    'tegali': ['Tegali', 'Tadaksahak', 'Tagdal', 'Tasawaq', 'Ingal', 'Dawsahak', 'Timbuktu', 'Gao', 'Ansongo', 'Bandiagara', 'Douentza', 'Djenné'],
    'tegem': ['Tegem', 'Nuba', 'Dilling', 'Nyimang', 'Tulishi', 'Tira', 'Keiga', 'Fungor', 'Katcha', 'Wali', 'Laro', 'Tocho'],
    'tima': ['Tima', 'Gbaya', 'Banda', 'Ngbandi', 'Sango', 'Zande', 'Nzakara', 'Mbati', 'Indri', 'Birri', 'Kari', 'Bodo'],
    'tembo': ['Tembo', 'Makonde', 'Yao', 'Ngoni', 'Lomwe', 'Tumbuka', 'Chewa', 'Nsenga', 'Kunda', 'Sena', 'Podzo', 'Tonga'],
    'tocho': ['Tocho', 'Nuba', 'Dilling', 'Nyimang', 'Tulishi', 'Tira', 'Keiga', 'Fungor', 'Katcha', 'Wali', 'Laro', 'Talodi'],
    'tumtum': ['Tumtum', 'Nuba', 'Dilling', 'Nyimang', 'Tulishi', 'Tira', 'Keiga', 'Fungor', 'Katcha', 'Wali', 'Laro', 'Talodi'],
    'tsotsitaal-and-camtho-aka-iscamtho': ['Tsotsitaal', 'Camtho', 'Iscamtho', 'Flaaitaal', 'KitchenDutch', 'Sabela', 'Kombuisafrikaans', 'PretoriaSabela', 'JohannesburgTsotsitaal', 'SowetoTsotsitaal', 'CapeTownTsotsitaal', 'DurbanTsotsitaal'],
    'zenati-berber': ['Zenati', 'Berber', 'Amazigh', 'Kabyle', 'Chaoui', 'Riffian', 'Tamazight', 'Tachelhit', 'Tarifit', 'Sanusi', 'Tuareg', 'Zenaga'],
    'koya': ['Koya', 'Munda', 'Kharia', 'Juang', 'Sora', 'Parenga', 'Didayi', 'Gutob', 'Remo', 'Gataq', 'Bondo', 'Mankidia'],
    'kurambhag-paharia': ['Kurambhag', 'Paharia', 'Malto', 'Kurmali', 'Panchpargania', 'Santhal', 'Oraon', 'Munda', 'Kharia', 'Juang', 'Sora', 'Parenga'],
    'kurichiya': ['Kurichiya', 'Malayalam', 'Tamil', 'Kannada', 'Tulu', 'Konkani', 'Marathi', 'Gujarati', 'Hindi', 'Urdu', 'Bengali', 'Oriya'],
    'azad-dialect': ['Azerbaijani', 'Azeri', 'AzeriTurkic', 'SouthAzerbaijani', 'NorthAzerbaijani', 'Qashqai', 'Aynallu', 'Baharlou', 'Qaragozlu', 'Padar', 'Takestani', 'Karingani'],
    'ejtun-dialect': ['Ejtun', 'Azerbaijani', 'Azeri', 'AzeriTurkic', 'SouthAzerbaijani', 'NorthAzerbaijani', 'Qashqai', 'Aynallu', 'Baharlou', 'Qaragozlu', 'Padar', 'Takestani'],
    'sele': ['Sele', 'Kpelle', 'Mano', 'Dan', 'Guro', 'Wobe', 'Tura', 'Go', 'Wan', 'Mwan', 'Loko', 'Temne'],
    'aas-whistled': ['Aas', 'Silbo', 'WhistleLanguage', 'Gomeran', 'Canarian', 'ElHierro', 'LaGomera', 'Tenerife', 'GranCanaria', 'Fuerteventura', 'Lanzarote', 'LaPalma'],

    // Default generic names for unknown languages
    'default': ['Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus', 'Septimus', 'Octavus', 'Nonus', 'Decimus', 'Undecimus', 'Duodecimus']
};

/**
 * Get appropriate placenames for a language identifier
 */
function getPlacenamesForLanguage(langId) {
    // Clean up the language identifier
    const cleanId = langId.replace(/_\d+$/, '').toLowerCase();

    // Check for exact match first
    if (PLACENAME_DATABASE[langId]) {
        return PLACENAME_DATABASE[langId];
    }

    // Check for partial match
    for (const [key, names] of Object.entries(PLACENAME_DATABASE)) {
        if (key.includes(cleanId) || cleanId.includes(key)) {
            return names;
        }
    }

    // Return default names
    return PLACENAME_DATABASE['default'];
}

/**
 * Replace _unq# placeholders in a line
 */
function replaceUnqPlaceholders(line) {
    // Pattern to match b: "...,unq1,unq2,...unq12" or similar mixed patterns
    const unqPattern = /b:\s*"([^"]*?)"/g;

    return line.replace(unqPattern, (match, content) => {
        // Extract the language identifier from the line
        const langMatch = line.match(/name:\s*"([^"]+)"/);
        if (!langMatch) return match;

        const langName = langMatch[1];
        let langId = '';

        // Try to extract language ID from various patterns
        const idMatch = line.match(/i:\s*(\d+)/);
        if (idMatch) {
            langId = idMatch[1];
        }

        // Extract existing real names and unq placeholders
        const parts = content.split(',');
        const realNames = [];
        const unqIndices = [];

        parts.forEach((part, index) => {
            if (part.includes('_unq')) {
                unqIndices.push(index);
            } else if (part.trim()) {
                realNames.push(part.trim());
            }
        });

        // Get appropriate placenames
        const allPlacenames = getPlacenamesForLanguage(langId);

        // Replace unq placeholders with appropriate names
        const resultParts = [...parts];
        unqIndices.forEach((originalIndex, replacementIndex) => {
            const nameIndex = replacementIndex % allPlacenames.length;
            resultParts[originalIndex] = allPlacenames[nameIndex];
        });

        return `b: "${resultParts.join(',')}"`;
    });
}

/**
 * Main processing function
 */
function processAllUnqPlaceholders() {
    const inputFile = 'E:/code/Fantasy-Map-Generator/modules/namebases-real.js';

    try {
        console.log('Reading file...');
        let content = fs.readFileSync(inputFile, 'utf8');
        const lines = content.split('\n');

        console.log('Processing lines...');
        let processedCount = 0;
        const processedLines = lines.map((line, index) => {
            if (line.includes('_unq')) {
                const originalLine = line;
                line = replaceUnqPlaceholders(line);
                if (line !== originalLine) {
                    processedCount++;
                    if (processedCount % 10 === 0) {
                        console.log(`Processed ${processedCount} lines...`);
                    }
                }
            }
            return line;
        });

        console.log(`Writing ${processedCount} updated lines...`);
        const outputContent = processedLines.join('\n');
        fs.writeFileSync(inputFile, outputContent, 'utf8');

        console.log(`✅ Successfully processed ${processedCount} language entries!`);
        console.log('File updated successfully!');

    } catch (error) {
        console.error('❌ Error processing file:', error.message);
    }
}

// Run the processor
if (require.main === module) {
    processAllUnqPlaceholders();
}

module.exports = {
    getPlacenamesForLanguage,
    replaceUnqPlaceholders,
    processAllUnqPlaceholders,
    PLACENAME_DATABASE
};