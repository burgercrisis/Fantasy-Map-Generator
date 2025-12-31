/**
 * Placename Replacer for namebases-real.js
 * Processes unq1-unq12 placeholders with real geographical data
 */

const fs = require('fs');

// Sample geographical data by region/language family
const PLACE_DATABASE = {
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
    
    // African languages (with numeric suffixes)
    'tsamai_5872': ['ArbaMinch', 'Chencha', 'Konso', 'Jinka', 'Mago', 'Dimeka', 'Turmi', 'Karo', 'Hamer', 'Benna', 'Ari', 'Mursi'],
    'el-molo_5873': ['Loyangalani', 'Marsabit', 'NorthHorror', 'Illeret', 'Kargi', 'NorthHorror', 'Loyangalani', 'Marsabit', 'Moyale', 'Sololo', 'NorthHorror', 'Loyangalani'],
    'saho_5874': ['Dekemhare', 'Foro', 'Beilul', 'Tio', 'Hirgigo', 'Massawa', 'Ghinda', 'Nakfa', 'Afabet', 'Keren', 'Asmara', 'AdiKeyh'],
    'somali_5875': ['Mogadishu', 'Hargeisa', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa', 'Jowhar', 'Beledweyne', 'Burao', 'Galkayo', 'Bardheere', 'Jalalaqsi'],
    
    // European regional languages
    'bavarian': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Wurzburg', 'Erlangen', 'Bayreuth', 'Bamberg', 'Kempten', 'Landshut', 'Passau'],
    'cim': ['Luserna', 'Lavarone', 'Folgaria', 'Asiago', 'Enego', 'Roana', 'Rotzo', 'Gallio', 'Foza', 'Pedemonte', 'Trento', 'Vicenza'],
    'limburgish': ['Maastricht', 'Heerlen', 'Sittard', 'Geleen', 'Kerkrade', 'Vaals', 'Venlo', 'Roermond', 'Weert', 'Eindhoven', 'Helmond', 'DenBosch']
};

/**
 * Generate real place names for a given language identifier
 * @param {string} prefix - Language identifier (e.g., 'mtp', 'wlv', etc.)
 * @returns {string} - Comma-separated list of 12 place names
 */
function generatePlaceNames(prefix) {
    // Check if we have predefined data for this language
    if (PLACE_DATABASE[prefix]) {
        return PLACE_DATABASE[prefix].join(',');
    }
    
    // Generate generic but realistic placeholders based on language family
    const generators = {
        'south_american': () => generateSouthAmericanPlaces(prefix),
        'southeast_asian': () => generateSoutheastAsianPlaces(prefix),
        'african': () => generateAfricanPlaces(prefix),
        'european': () => generateEuropeanPlaces(prefix),
        'default': () => generateGenericPlaces(prefix)
    };
    
    // Detect language family from prefix or use default
    const family = detectLanguageFamily(prefix);
    return generators[family]();
}

function detectLanguageFamily(prefix) {
    if (['mtp', 'wlv', 'poi', 'tpx', 'ppi', 'slj', 'tsi'].includes(prefix)) return 'south_american';
    if (['gelao', 'tongzha', 'telue', 'then-kam-sui', 'nong-zhuang'].includes(prefix)) return 'southeast_asian';
    if (['tsamai', 'el-molo', 'saho', 'somali'].includes(prefix)) return 'african';
    if (['bavarian', 'cim', 'limburgish', 'low-german'].includes(prefix)) return 'european';
    return 'default';
}

function generateSouthAmericanPlaces(prefix) {
    const baseNames = ['SantaCruz', 'SanJuan', 'LaPaz', 'ElAlto', 'Cochabamba', 'Sucre', 'Potosi', 'Oruro', 'Tarija', 'Beni', 'Pando', 'Riberalta'];
    return baseNames.join(',');
}

function generateSoutheastAsianPlaces(prefix) {
    const baseNames = ['Bangkok', 'ChiangMai', 'Phuket', 'Pattaya', 'ChiangRai', 'KhonKaen', 'UdonThani', 'NakhonRatchasima', 'Phitsanulok', 'SuratThani', 'HatYai', 'Songkhla'];
    return baseNames.join(',');
}

function generateAfricanPlaces(prefix) {
    const baseNames = ['Nairobi', 'Mombasa', 'Kampala', 'Entebbe', 'Kigali', 'Bujumbura', 'Dodoma', 'DarEsSalaam', 'Lusaka', 'Harare', 'Lilongwe', 'Blantyre'];
    return baseNames.join(',');
}

function generateEuropeanPlaces(prefix) {
    const baseNames = ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz', 'Klagenfurt', 'Bregenz', 'Villach', 'Wels', 'Steyr', 'Dornbirn', 'Eisenstadt'];
    return baseNames.join(',');
}

function generateGenericPlaces(prefix) {
    // Create meaningful names based on prefix
    const suffixes = ['Town', 'City', 'Village', 'Port', 'Haven', 'Bridge', 'Ford', 'Hill', 'Valley', 'Field', 'Grove', 'Creek'];
    return suffixes.map(suffix => prefix.charAt(0).toUpperCase() + prefix.slice(1) + suffix).join(',');
}

/**
 * Main processing function
 */
function processNamebasesFile() {
    const inputFile = 'E:/code/Fantasy-Map-Generator/modules/namebases-real.js';
    
    try {
        // Read file
        let content = fs.readFileSync(inputFile, 'utf8');
        
        // Process each line that contains unq1-unq12 patterns
        const lines = content.split('\n');
        let processedCount = 0;
        
        const processedLines = lines.map(line => {
            // Match patterns like "mtp_unq1,mtp_unq2,...,mtp_unq12" or "tsamai_5872_unq1,tsamai_5872_unq2,..."
            const match = line.match(/b: "([^_]+(?:_\d+)?)_unq1,([^_]+(?:_\d+)?)_unq2,([^_]+(?:_\d+)?)_unq3,([^_]+(?:_\d+)?)_unq4,([^_]+(?:_\d+)?)_unq5,([^_]+(?:_\d+)?)_unq6,([^_]+(?:_\d+)?)_unq7,([^_]+(?:_\d+)?)_unq8,([^_]+(?:_\d+)?)_unq9,([^_]+(?:_\d+)?)_unq10,([^_]+(?:_\d+)?)_unq11,([^_]+(?:_\d+)?)_unq12"/);
            
            if (match) {
                const prefix = match[1]; // Extract language prefix
                const newPlaces = generatePlaceNames(prefix);
                const newLine = line.replace(/b: "[^"]+"/, `b: "${newPlaces}"`);
                processedCount++;
                return newLine;
            }
            
            return line;
        });
        
        // Write processed content back
        const outputContent = processedLines.join('\n');
        fs.writeFileSync(inputFile, outputContent, 'utf8');
        
        console.log(`Processed ${processedCount} language entries with real place names.`);
        console.log('File updated successfully!');
        
    } catch (error) {
        console.error('Error processing file:', error.message);
    }
}

// Run a small test first
function runTest() {
    const testCases = ['mtp', 'wlv', 'poi', 'unknown'];
    testCases.forEach(prefix => {
        console.log(`${prefix}: ${generatePlaceNames(prefix)}`);
    });
}

// Run processor
if (require.main === module) {
    // runTest(); // Uncomment to test generation first
    processNamebasesFile();
}

module.exports = {
    generatePlaceNames,
    processNamebasesFile,
    PLACE_DATABASE
};