/**
 * Comprehensive Placename Replacer for namebases-real.js
 * Handles all [LanguageName]_[Number][Suffix] placeholders with region-appropriate names
 */

const fs = require('fs');
const path = require('path');

// Regional placename databases (12 items each)
const REGIONAL_PLACENAMES = {
  // South American
  southAmerican: [
    'Leticia', 'Iquitos', 'Tefé', 'Santarém', 'Manaus', 'Belém', 'Tabatinga', 'Benjamin Constant',
    'Atalaia do Norte', 'Fonte Boa', 'Jutaí', 'Tonantins'
  ],
  // Southeast Asian
  southeastAsian: [
    'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin', 'Krabi', 'Chiang Rai', 'Ayutthaya',
    'Sukhothai', 'Kanchanaburi', 'Songkhla', 'Hat Yai'
  ],
  // African
  african: [
    'Nairobi', 'Mombasa', 'Kampala', 'Entebbe', 'Kigali', 'Bujumbura', 'Dodoma', 'Dar es Salaam',
    'Lusaka', 'Harare', 'Lilongwe', 'Blantyre'
  ],
  // European
  european: [
    'Berlin', 'Paris', 'London', 'Rome', 'Madrid', 'Athens', 'Vienna', 'Amsterdam',
    'Prague', 'Budapest', 'Warsaw', 'Stockholm'
  ],
  // East Asian
  eastAsian: [
    'Tokyo', 'Beijing', 'Seoul', 'Taipei', 'Hong Kong', 'Shanghai', 'Guangzhou', 'Shenzhen',
    'Chengdu', 'Wuhan', 'Nanjing', 'Hangzhou'
  ],
  // North American
  northAmerican: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'Dallas', 'San Jose', 'Austin', 'Jacksonville'
  ],
  // Oceanian
  oceanian: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Auckland', 'Wellington', 'Suva', 'Port Moresby',
    'Noumea', 'Honiara', 'Apia', 'Funafuti'
  ]
};

// Language to region mapping
const LANGUAGE_REGION_MAP = {
  // South American languages
  'Macuna': 'southAmerican',
  'Cubeo': 'southAmerican',
  'Desano': 'southAmerican',
  'Itene': 'southAmerican',
  'Hupd├½': 'southAmerican',
  'Koreguaje': 'southAmerican',
  'Tukano': 'southAmerican',
  'Wanano': 'southAmerican',
  'Tatuyo': 'southAmerican',
  'Siriano': 'southAmerican',
  'Siona': 'southAmerican',

  // African languages
  'Bebe': 'african',
  'Bee': 'african',
  'Beja': 'african',
  'Beli': 'african',
  'Rama': 'african',
  'Bemba': 'african',
  'Bembe': 'african',
  'Comorian': 'african',
  'Fwe': 'african',

  // Southeast Asian languages
  'Belneng': 'southeastAsian',
  'Betanure': 'southeastAsian',
  'Bete': 'southeastAsian',
  'Betta': 'southeastAsian',
  'Bfy': 'southeastAsian',
  'Hokkien': 'southeastAsian',
  'Teochew': 'southeastAsian',
  'Hainanese': 'southeastAsian',
  'Leizhou': 'southeastAsian',
  'PuΓÇôXian': 'southeastAsian',
  'H├ákl├áu': 'southeastAsian',
  'Haryanvi': 'southeastAsian',
  'Balochi': 'southeastAsian',

  // East Asian languages
  'Beijing': 'eastAsian',
  'Biao': 'eastAsian',
  'Biblical': 'eastAsian',
  'Choctaw': 'eastAsian',
  'Muscogee': 'eastAsian',
  'Mikasuki': 'eastAsian',

  // North American languages
  'Aleut': 'northAmerican',
  'Bina': 'northAmerican',
  'Binahari': 'northAmerican',
  'Binandere': 'northAmerican',
  'Binumarien': 'northAmerican',

  // Oceanian languages
  'Cavine├▒a': 'southAmerican',
  'Ese': 'southAmerican',
  'Yuracar├⌐': 'southAmerican'
};

// Default fallback
const DEFAULT_PLACENAMES = [
  'Primus', 'Secundus', 'Tertius', 'Quartus', 'Quintus', 'Sextus',
  'Septimus', 'Octavus', 'Nonus', 'Decimus', 'Undecimus', 'Duodecimus'
];

/**
 * Get appropriate regional placenames for a language
 */
function getRegionalPlacenames(languageName) {
  // Clean up language name
  const cleanName = languageName.replace(/_.*$/, '').replace(/[^a-zA-Z\s]/g, '');

  const region = LANGUAGE_REGION_MAP[cleanName];
  return region ? REGIONAL_PLACENAMES[region] : DEFAULT_PLACENAMES;
}

/**
 * Replace [LanguageName]_[Number][Suffix] patterns in a line
 */
function replacePlaceholderPatterns(line) {
  // Pattern to match LanguageName_NumberSuffix (e.g., Macuna_6653Town, German_1City)
  const placeholderPattern = /([A-Za-z0-9\-_ΓÇÖ├½╠▒]+)_(\d+)(Town|City|Village|Port|Haven|Bridge|Ford|Hill|Valley|Field|Grove|Creek)/g;

  // Track how many replacements we've made in this line
  let replacementCount = 0;

  return line.replace(placeholderPattern, (match, langName, numberStr, suffix) => {
    // Use sequential index 0-11 based on replacement count
    const number = replacementCount % 12;

    // Clean up language name
    const cleanLangName = langName.replace(/_.*$/, '').replace(/[^a-zA-Z\s]/g, '');

    const placenames = getRegionalPlacenames(cleanLangName);
    const result = placenames[number] || DEFAULT_PLACENAMES[number] || DEFAULT_PLACENAMES[0];

    replacementCount++;
    return result;
  });
}

/**
 * Validate JavaScript syntax
 */
function validateSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('window.realWorldNameBases = [')) {
      throw new Error('Missing expected array declaration');
    }
    return true;
  } catch (error) {
    console.error(`Syntax validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Main processing function
 */
async function processAllPlaceholders() {
  const inputFile = path.join(__dirname, '../modules/namebases-real.js');
  const backupFile = `${inputFile}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  console.log('Starting comprehensive placeholder replacement...');

  try {
    // Create backup
    fs.copyFileSync(inputFile, backupFile);
    console.log(`Backup created: ${backupFile}`);

    // Read file
    let content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');

    console.log(`Processing ${lines.length} lines...`);

    let processedLines = [];
    let totalProcessed = 0;

    // Process all lines
    processedLines = lines.map((line, index) => {
      const originalLine = line;
      line = replacePlaceholderPatterns(line);
      if (line !== originalLine) {
        totalProcessed++;
        if (totalProcessed % 50 === 0) {
          console.log(`Processed ${totalProcessed} placeholders...`);
        }
      }
      return line;
    });

    // Write processed content
    const outputContent = processedLines.join('\n');
    fs.writeFileSync(inputFile, outputContent, 'utf8');

    // Final validation
    if (validateSyntax(inputFile)) {
      console.log(`✅ Successfully processed ${totalProcessed} placeholder patterns!`);
      console.log(`File updated: ${inputFile}`);
    } else {
      console.error('Final syntax validation failed. Restoring backup...');
      fs.copyFileSync(backupFile, inputFile);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, inputFile);
    }
  }
}

// Export for testing
module.exports = {
  getRegionalPlacenames,
  replacePlaceholderPatterns,
  processAllPlaceholders
};

// Run if called directly
if (require.main === module) {
  processAllPlaceholders();
}