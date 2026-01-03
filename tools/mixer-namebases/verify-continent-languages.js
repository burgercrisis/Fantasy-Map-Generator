#!/usr/bin/env node

/**
 * Comprehensive Linguistic Authenticity Verification for Continent Namebase Files
 *
 * This script checks all continent namebase files for linguistic authenticity by:
 * 1. Extracting language names from all continent files
 * 2. Checking each language against known language databases (ISO codes, Ethnologue)
 * 3. Identifying invalid, misspelled, or extraneous language names
 * 4. Generating reports and suggested fixes
 */

const fs = require('fs');
const path = require('path');

// Continent namebase files to check
const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

// Known language database - comprehensive ISO 639 codes and common names
const knownLanguages = new Set([
  // ISO 639-1 (major languages)
  'Abkhaz', 'Afar', 'Afrikaans', 'Akan', 'Albanian', 'Amharic', 'Arabic', 'Aragonese', 'Armenian', 'Assamese',
  'Avaric', 'Avestan', 'Aymara', 'Azerbaijani', 'Bambara', 'Bashkir', 'Basque', 'Belarusian', 'Bengali', 'Bihari',
  'Bislama', 'Bosnian', 'Breton', 'Bulgarian', 'Burmese', 'Catalan', 'Chamorro', 'Chechen', 'Chichewa', 'Chinese',
  'Chuvash', 'Cornish', 'Corsican', 'Cree', 'Croatian', 'Czech', 'Danish', 'Divehi', 'Dutch', 'Dzongkha',
  'English', 'Esperanto', 'Estonian', 'Ewe', 'Faroese', 'Fijian', 'Finnish', 'French', 'Fula', 'Galician',
  'Georgian', 'German', 'Greek', 'Guarani', 'Gujarati', 'Haitian', 'Hausa', 'Hebrew', 'Herero', 'Hindi',
  'Hiri Motu', 'Hungarian', 'Icelandic', 'Ido', 'Igbo', 'Indonesian', 'Interlingua', 'Interlingue', 'Inuktitut',
  'Inupiaq', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kalaallisut', 'Kannada', 'Kanuri', 'Kashmiri', 'Kazakh',
  'Khmer', 'Kikuyu', 'Kinyarwanda', 'Kirghiz', 'Komi', 'Kongo', 'Korean', 'Kurdish', 'Kwanyama', 'Lao',
  'Latin', 'Latvian', 'Limburgish', 'Lingala', 'Lithuanian', 'Luba-Katanga', 'Luxembourgish', 'Macedonian',
  'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Manx', 'Maori', 'Marathi', 'Marshallese', 'Mongolian',
  'Nauru', 'Navajo', 'Ndonga', 'Nepali', 'Northern Sami', 'Norwegian', 'Nyanja', 'Occitan', 'Ojibwe', 'Oriya',
  'Oromo', 'Ossetian', 'Pali', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Quechua', 'Romanian',
  'Romansh', 'Rundi', 'Russian', 'Samoan', 'Sango', 'Sanskrit', 'Sardinian', 'Scottish Gaelic', 'Serbian',
  'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Southern Sotho', 'Spanish', 'Sundanese',
  'Swahili', 'Swati', 'Swedish', 'Tagalog', 'Tahitian', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Tibetan',
  'Tigrinya', 'Tonga', 'Tsonga', 'Tswana', 'Turkish', 'Turkmen', 'Twi', 'Uighur', 'Ukrainian', 'Urdu', 'Uzbek',
  'Venda', 'Vietnamese', 'Volapük', 'Walloon', 'Welsh', 'Western Frisian', 'Wolof', 'Xhosa', 'Yiddish', 'Yoruba',
  'Zhuang', 'Zulu',

  // Additional ISO 639-3 and Ethnologue languages (common ones)
  'Adyghe', 'Akan', 'Altai', 'Amdo Tibetan', 'Ancient Greek', 'Arabic', 'Aramaic', 'Assyrian Neo-Aramaic',
  'Avar', 'Aymara', 'Balinese', 'Balochi', 'Balti', 'Bambara', 'Bengali', 'Bhojpuri', 'Bislama', 'Bodo',
  'Brahui', 'Breton', 'Burmese', 'Cantonese', 'Catalan', 'Cebuano', 'Chechen', 'Cherokee', 'Chhattisgarhi',
  'Chuvash', 'Cornish', 'Corsican', 'Cree', 'Crimean Tatar', 'Croatian', 'Czech', 'Dakota', 'Danish', 'Dargwa',
  'Dhimal', 'Dinka', 'Doteli', 'Dungan', 'Dutch', 'Dzongkha', 'English', 'Estonian', 'Evenki', 'Faroese',
  'Fijian', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Greenlandic', 'Guarani',
  'Gujarati', 'Gurani', 'Haitian Creole', 'Hakka', 'Hausa', 'Hawaiian', 'Hebrew', 'Herero', 'Hiligaynon',
  'Hindi', 'Hungarian', 'Icelandic', 'Ido', 'Igbo', 'Ilocano', 'Indonesian', 'Ingush', 'Interlingua', 'Irish',
  'Italian', 'Japanese', 'Javanese', 'Kabardian', 'Kachchi', 'Kalaallisut', 'Kannada', 'Kapampangan', 'Karakalpak',
  'Kashmiri', 'Kazakh', 'Khaling', 'Khmer', 'Khowar', 'Kirghiz', 'Konkani', 'Korean', 'Kurdish', 'Kurukh',
  'Ladin', 'Lak', 'Lao', 'Latgalian', 'Latin', 'Latvian', 'Lezgian', 'Limbu', 'Lingala', 'Lithuanian', 'Livonian',
  'Low German', 'Lower Sorbian', 'Luba-Kasai', 'Luganda', 'Luri', 'Luxembourgish', 'Macedonian', 'Madurese',
  'Magahi', 'Maithili', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Mandarin', 'Manx', 'Maori', 'Marathi',
  'Minangkabau', 'Mirandese', 'Moksha', 'Mongolian', 'Nauru', 'Navajo', 'Ndonga', 'Neapolitan', 'Nepali', 'Nogai',
  'Norwegian', 'Occitan', 'Old English', 'Old Norse', 'Oriya', 'Oromo', 'Ossetic', 'Papiamento', 'Pashto', 'Persian',
  'Polish', 'Portuguese', 'Punjabi', 'Quechua', 'Romani', 'Romanian', 'Romansh', 'Russian', 'Sami', 'Samoan',
  'Sango', 'Sanskrit', 'Sardinian', 'Scottish Gaelic', 'Serbian', 'Serer', 'Shan', 'Shona', 'Sicilian', 'Sindhi',
  'Sinhala', 'Skolt Sami', 'Slovak', 'Slovenian', 'Somali', 'Sorbian', 'Spanish', 'Sundanese', 'Swahili', 'Swedish',
  'Tabasaran', 'Tagalog', 'Tahitian', 'Tai Dam', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Tetum', 'Thai', 'Tibetan',
  'Tigrinya', 'Tok Pisin', 'Tonga', 'Tswana', 'Tumbuka', 'Tupi', 'Turkish', 'Turkmen', 'Tuvan', 'Udmurt', 'Uighur',
  'Ukrainian', 'Upper Sorbian', 'Urdu', 'Uzbek', 'Vietnamese', 'Volapük', 'Walloon', 'Welsh', 'Western Frisian',
  'Wolof', 'Xhosa', 'Yiddish', 'Yoruba', 'Zhuang', 'Zulu',

  // Additional languages from Ethnologue with regional variants
  'Acehnese', 'Achang', 'Adi', 'Aer', 'Ahirani', 'Aka-Bea', 'Aka-Bo', 'Aka-Jeru', 'Altai', 'American English',
  'American Sign Language', 'Amis', 'Angolar', 'Annobonese', 'Archi', 'Assamese', 'Assyrian Neo-Aramaic',
  'Austro-Bavarian', 'Badeshi', 'Bahasa Indonesia', 'Bahasa Melayu', 'Bai', 'Baima', 'Balochi', 'Balti',
  'Bangladeshi English', 'Bantawa', 'Baram', 'Belhare', 'Bengali', 'Bhojpuri', 'Bikol', 'Bishnupriya Manipuri',
  'Bodo', 'Bokar', 'Bonan', 'Brahui', 'British English', 'Bulgarian', 'Bunaq', 'Bunun', 'Burmish', 'Burushaski',
  'Caijia', 'Cantonese', 'Catalan', 'Central Kurdish', 'Central Min', 'Chakma', 'Chepang', 'Chhattisgarhi',
  'Chinese', 'Chukchi', 'Cimbrian', 'Corsican', 'Czech', 'Dakhini', 'Dakota', 'Danish', 'Dari', 'Dhimal',
  'Dholuo', 'Dinka', 'Doteli', 'Dungan', 'Dutch', 'Dzongkha', 'English', 'Estonian', 'Even', 'Filipino',
  'Finnish', 'Flemish', 'Forro', 'French', 'Frisian', 'Fuyu Kyrgyz', 'Garo', 'Garhwali', 'Gawri', 'Gawar-Bati',
  'Georgian', 'German', 'Ghale', 'Gola', 'Gondi', 'Gourmanchéma', 'Greek', 'Guajajara', 'Guarani', 'Gujarati',
  'Gujari', 'Gurage', 'Gurindji', 'Hadza', 'Hainanese', 'Hakka', 'Hausa', 'Hawaiian', 'Hayu', 'Hebrew', 'Hindi',
  'Hindko', 'Hinglish', 'Hokkien', 'Hungarian', 'Huizhou Chinese', 'Icelandic', 'Ido', 'Igbo', 'Ilocano',
  'Indian English', 'Indonesian', 'Ingush', 'Interlingua', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Jerriais',
  'Jurchen', 'Kabardian', 'Kachchi', 'Kalaallisut', 'Kannada', 'Kapampangan', 'Karakalpak', 'Kashmiri', 'Kazakh',
  'Khaling', 'Khams Tibetan', 'Khmer', 'Khowar', 'Kirghiz', 'Kodi', 'Konkani', 'Korean', 'Korku', 'Koya',
  'Kurdish', 'Kurukh', 'Ladin', 'Lak', 'Lao', 'Latgalian', 'Latin', 'Latvian', 'Lezgian', 'Limbu', 'Lingala',
  'Lithuanian', 'Livonian', 'Lohorung', 'Low German', 'Lower Sorbian', 'Luba-Kasai', 'Luganda', 'Luhya', 'Luri',
  'Luxembourgish', 'Macedonian', 'Madurese', 'Magahi', 'Maithili', 'Majhi', 'Malagasy', 'Malay', 'Malayalam',
  'Maltese', 'Mandarin', 'Manx', 'Maori', 'Marathi', 'Mewahang', 'Minangkabau', 'Min Nan', 'Mirandese', 'Mishmi',
  'Mizo', 'Moksha', 'Mongolian', 'Mundari', 'Mycenaean Greek', 'Nachhiring', 'Nagamese', 'Naga', 'Nahuatl',
  'Nama', 'Nanai', 'Nara', 'Nauru', 'Navajo', 'Ndonga', 'Neapolitan', 'Nepalese English', 'Nepali', 'Nogai',
  'Norwegian', 'Nuer', 'Occitan', 'Old Church Slavonic', 'Old English', 'Old Norse', 'Oriya', 'Oromo', 'Ossetic',
  'Pali', 'Papiamento', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Principense', 'Proto-Georgian–Zan',
  'Punjabi', 'Puma', 'Purepecha', 'Quechua', 'Querétaro Otomi', 'Rajasthani', 'Rangpuri', 'Romani', 'Romanian',
  'Romansh', 'Russian', 'Saami', 'Salar', 'Samoan', 'Sango', 'Sanskrit', 'Santali', 'Sardinian', 'Scottish Gaelic',
  'Seraiki', 'Serbian', 'Serer', 'Shan', 'Shona', 'Siberian Tatar', 'Sicilian', 'Silesian', 'Sindhi', 'Sinhala',
  'Skolt Sami', 'Slovak', 'Slovenian', 'Somali', 'Sorbian', 'Southern Kurdish', 'Spanish', 'Sranan Tongo', 'Sundanese',
  'Surigaonon', 'Swahili', 'Swedish', 'Sylheti', 'Tabasaran', 'Tagalog', 'Tahitian', 'Tai Dam', 'Tajik', 'Tamil',
  'Tatar', 'Teochew', 'Telugu', 'Tetum', 'Thai', 'Tharu', 'Thulung', 'Tibetan', 'Tigrinya', 'Tilung', 'Tok Pisin',
  'Tolaki', 'Tonga', 'Tswana', 'Tumbuka', 'Tunisian Arabic', 'Tupi', 'Turkish', 'Turkmen', 'Tuvan', 'Udmurt',
  'Uighur', 'Ukrainian', 'Upper Sorbian', 'Urdu', 'Uzbek', 'Vietnamese', 'Volapük', 'Walloon', 'Warlpiri', 'Welsh',
  'Western Frisian', 'Wolof', 'Wu', 'Xhosa', 'Yiddish', 'Yoruba', 'Zhuang', 'Zulu'
]);

// Suspicious patterns that indicate fake or problematic names
const suspiciousPatterns = [
  /^.{1,2}$/,  // Very short names (likely abbreviations)
  /^[A-Z]{3,}$/,  // All caps abbreviations
  /language$/i,  // Ends with "language"
  /dialect$/i,  // Ends with "dialect"
  /family$/i,  // Ends with "family"
  /^test/i,  // Test entries
  /^temp/i,  // Temporary entries
  /^fake/i,  // Fake entries
  /^dummy/i,  // Dummy entries
  /Â/,  // Encoding artifacts
  /â/,  // Encoding artifacts
  /€/,  // Encoding artifacts
  /â‚¬/,  // Encoding artifacts
  /â€/,  // Encoding artifacts
  /â€"/,  // Encoding artifacts
];

// Function to extract languages from a continent file
function extractLanguagesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const languages = [];

  for (const line of lines) {
    const match = line.match(/"name":\s*"([^"]+)"/);
    if (match) {
      languages.push({
        name: match[1],
        file: path.basename(filePath),
        line: lines.indexOf(line) + 1
      });
    }
  }

  return languages;
}

// Function to check if a language name is authentic
function isAuthenticLanguage(name) {
  // Clean the name for checking
  const cleanName = name.replace(/\s*\([^)]*\)$/, ''); // Remove parentheses content
  const normalizedName = cleanName.replace(/[-\s]/g, ' ').trim();

  // Check direct match
  if (knownLanguages.has(cleanName) || knownLanguages.has(normalizedName)) {
    return { authentic: true, reason: 'Direct match in known languages database' };
  }

  // Check for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(cleanName)) {
      return { authentic: false, reason: `Matches suspicious pattern: ${pattern.source}` };
    }
  }

  // Check for very short or very long names
  if (cleanName.length < 3) {
    return { authentic: false, reason: 'Name too short (likely abbreviation or error)' };
  }

  if (cleanName.length > 50) {
    return { authentic: false, reason: 'Name suspiciously long' };
  }

  // Check for non-alphabetic characters (except spaces, hyphens, apostrophes)
  if (!/^[A-Za-z\s\-'À-ÿ]+$/.test(cleanName)) {
    return { authentic: false, reason: 'Contains invalid characters or encoding issues' };
  }

  // If we can't confirm it's authentic but it doesn't match suspicious patterns,
  // mark as potentially authentic but needing verification
  return { authentic: null, reason: 'Not found in database - requires manual verification' };
}

// Main execution
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║      COMPREHENSIVE LINGUISTIC AUTHENTICITY VERIFICATION                     ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

let allLanguages = [];
let results = {
  authentic: [],
  suspicious: [],
  needsVerification: [],
  invalid: []
};

// Process each continent file
for (const file of continentFiles) {
  const filePath = path.join(__dirname, '../../modules', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  console.log(`📁 Processing ${file}...`);
  const languages = extractLanguagesFromFile(filePath);
  allLanguages = allLanguages.concat(languages);
  console.log(`   Found ${languages.length} languages\n`);
}

// Analyze each language
console.log('🔍 Analyzing language authenticity...\n');

for (const lang of allLanguages) {
  const authCheck = isAuthenticLanguage(lang.name);

  const result = {
    name: lang.name,
    file: lang.file,
    line: lang.line,
    ...authCheck
  };

  if (authCheck.authentic === true) {
    results.authentic.push(result);
  } else if (authCheck.authentic === false) {
    results.invalid.push(result);
  } else {
    results.needsVerification.push(result);
  }
}

// Output results
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              VERIFICATION RESULTS                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`Total languages analyzed: ${allLanguages.length}`);
console.log(`✅ Authentic: ${results.authentic.length}`);
console.log(`⚠️  Needs verification: ${results.needsVerification.length}`);
console.log(`❌ Invalid/Suspicious: ${results.invalid.length}\n`);

// Show invalid entries first (highest priority)
if (results.invalid.length > 0) {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ❌ INVALID/SUSPICIOUS ENTRIES (HIGH PRIORITY - REMOVE OR FIX)                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  results.invalid.forEach(entry => {
    console.log(`  ❌ ${entry.name}`);
    console.log(`     File: ${entry.file}:${entry.line}`);
    console.log(`     Reason: ${entry.reason}`);
    console.log('');
  });
}

// Show entries needing verification
if (results.needsVerification.length > 0) {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ❓ ENTRIES NEEDING VERIFICATION (MEDIUM PRIORITY)                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  results.needsVerification.slice(0, 20).forEach(entry => {
    console.log(`  ❓ ${entry.name}`);
    console.log(`     File: ${entry.file}:${entry.line}`);
    console.log(`     Reason: ${entry.reason}`);
    console.log('');
  });

  if (results.needsVerification.length > 20) {
    console.log(`  ... and ${results.needsVerification.length - 20} more entries\n`);
  }
}

// Show sample of authentic entries
if (results.authentic.length > 0) {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ SAMPLE AUTHENTIC ENTRIES (CONFIRMED VALID)                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  results.authentic.slice(0, 10).forEach(entry => {
    console.log(`  ✅ ${entry.name} (${entry.file})`);
  });

  if (results.authentic.length > 10) {
    console.log(`  ... and ${results.authentic.length - 10} more authentic entries\n`);
  }
}

// Recommendations
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                           RECOMMENDED ACTIONS                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

if (results.invalid.length > 0) {
  console.log('1. 🛠️  FIX INVALID ENTRIES:');
  console.log('   Remove or correct the following suspicious language names:');
  results.invalid.slice(0, 5).forEach(entry => {
    console.log(`   - ${entry.name} (${entry.file})`);
  });
  if (results.invalid.length > 5) {
    console.log(`   ... and ${results.invalid.length - 5} more`);
  }
  console.log('');
}

if (results.needsVerification.length > 0) {
  console.log('2. 🔍 VERIFY UNCERTAIN ENTRIES:');
  console.log('   Research these languages on Ethnologue or Glottolog:');
  results.needsVerification.slice(0, 5).forEach(entry => {
    console.log(`   - ${entry.name}`);
  });
  if (results.needsVerification.length > 5) {
    console.log(`   ... and ${results.needsVerification.length - 5} more`);
  }
  console.log('');
}

console.log('3. 📊 VERIFICATION SOURCES:');
console.log('   - Ethnologue: https://www.ethnologue.com/');
console.log('   - Glottolog: https://glottolog.org/');
console.log('   - ISO 639-3: https://iso639-3.sil.org/');
console.log('   - Wikipedia language lists');
console.log('');

console.log('═══════════════════════════════════════════════════════════════════════════════\n');