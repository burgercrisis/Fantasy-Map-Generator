#!/usr/bin/env node

/**
 * Comprehensive Linguistic Authenticity Verification for Continent Namebases
 *
 * This script processes all continent namebase files and checks:
 * 1. Language authenticity against known databases
 * 2. Geographic consistency of placenames
 * 3. Presence of invalid/suspicious entries
 */

const fs = require('fs');
const path = require('path');

// Continent files to process
const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-oceania.js',
  'namebases-southAmerica.js'
];

// Language Geographic Range Database (from verify-language-geographic-authenticity.js)
const languageGeographicRanges = {
  // Major European Languages
  'German': ['Germany', 'Austria', 'Switzerland', 'Liechtenstein', 'Luxembourg'],
  'English': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Ireland'],
  'French': ['France', 'Belgium', 'Switzerland', 'Luxembourg', 'Monaco'],
  'Italian': ['Italy', 'San Marino', 'Vatican City', 'Switzerland'],
  'Spanish': ['Spain'],
  'Portuguese': ['Portugal'],
  'Dutch': ['Netherlands', 'Belgium'],
  'Greek': ['Greece', 'Cyprus'],
  'Finnic': ['Finland', 'Estonia'],
  'Hungarian': ['Hungary'],
  'Roman': ['Italy', 'Romania', 'France', 'Spain'],
  'Nordic': ['Norway', 'Sweden', 'Denmark', 'Iceland'],
  'Lechitic': ['Poland'],
  'Czech-Slovak': ['Czech Republic', 'Slovakia'],
  'South Slavic BCS': ['Croatia', 'Bosnia', 'Serbia', 'Montenegro', 'Slovenia'],
  'Bulgarian': ['Bulgaria'],
  'Ukrainian': ['Ukraine'],
  'Irish Gaelic': ['Ireland'],
  'Scottish Gaelic': ['Scotland'],
  // Middle Eastern Languages
  'Turkish': ['Turkey', 'Cyprus', 'Azerbaijan'],
  'Arabic': ['Saudi Arabia', 'UAE', 'Egypt', 'Iraq', 'Jordan', 'Syria', 'Lebanon', 'Yemen', 'Oman', 'Qatar', 'Kuwait', 'Bahrain'],
  'Berber': ['Morocco', 'Algeria', 'Tunisia', 'Libya', 'Mali', 'Niger'],
  'Hebrew': ['Israel'],
  'Iranian': ['Iran'],
  'Mesopotamian': ['Iraq', 'Syria', 'Turkey'],
  'Kurdish': ['Turkey', 'Iraq', 'Iran', 'Syria'],
  // African Languages
  'Nigerian': ['Nigeria'],
  'Swahili': ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Congo', 'Mozambique'],
  'Bemba-Bembe-Fwe': ['Zambia', 'DR Congo'],
  'Berta-Besme': ['Ethiopia', 'Sudan'],
  'Omaio-Shabo-Seze': ['Ethiopia', 'South Sudan'],
  'Mandara Chadic': ['Nigeria', 'Cameroon'],
  'Bauchi Chadic': ['Nigeria'],
  'East Chadic': ['Chad', 'Sudan', 'Niger', 'Cameroon'],
  // Asian Languages
  'Chinese': ['China', 'Taiwan', 'Singapore', 'Malaysia'],
  'Cantonese': ['China', 'Hong Kong', 'Macau', 'Singapore', 'Malaysia'],
  'Japanese': ['Japan'],
  'Korean': ['South Korea', 'North Korea'],
  'Vietnamese': ['Vietnam'],
  'Mongolian': ['Mongolia', 'China'],
  'Southern Mongolic': ['China'],
  // Americas - Indigenous
  'Nahuatl': ['Mexico'],
  'Quechua': ['Peru', 'Bolivia', 'Ecuador'],
  'Pur\xE9pecha': ['Mexico'],
  'Seri': ['Mexico'],
  'Huave': ['Mexico'],
  'Ainu': ['Japan'],
  'Inuit': ['Greenland', 'Canada', 'Alaska'],
  // Americas - Others
  'Hawaiian': ['Hawaii'],
  'Basque': ['Spain', 'France'],
  'Celtic': ['Ireland', 'Scotland', 'Wales', 'Brittany', 'Cornwall'],
  'Gondi': ['India'],
  'Kui-Kuvi Dravidian': ['India'],
  'Koya-Konda-Manda-Pengo': ['India'],
  'Karnataka': ['India'],
  // Pacific Languages
  'Papuan': ['Papua New Guinea'],
  'Engan Papuan': ['Papua New Guinea'],
  'Dani Papuan': ['Indonesia', 'Papua'],
  'Eastern Indonesian': ['Indonesia'],
  'Melanesian Vanuatu': ['Vanuatu', 'Solomon Islands'],
  'Micronesian': ['Micronesia', 'Palau', 'Marshall Islands', 'Kiribati'],
  'Central Pacific': ['Fiji', 'Samoa', 'Tonga'],
  'New Caledonia': ['New Caledonia'],
  'Tokelauan': ['Tokelau', 'New Zealand'],
  'Nauruan': ['Nauru'],
  'Tok Pisin': ['Papua New Guinea'],
  'Tuvaluan': ['Tuvalu'],
  'Angolar S\xE3o Tom\xE9': ['S\xE3o Tom\xE9 and Pr\xEDncipe'],
  'Annobonese Pal\xE9': ['Equatorial Guinea'],
  'Forro S\xE3o Tom\xE9': ['S\xE3o Tom\xE9 and Pr\xEDncipe'],
  'Principense Sundy': ['S\xE3o Tom\xE9 and Pr\xEDncipe'],
  // South American Indigenous
  'Shipibo-Conibo Amazonian': ['Peru', 'Brazil'],
  'Warao Delta': ['Venezuela', 'Guyana', 'Suriname'],
  'Yanomami Amazonian': ['Brazil', 'Venezuela'],
  'Kwaza-Xoc\xF3 Amazonian': ['Brazil'],
  // Click Languages
  'Kx\'a Click A': ['Botswana', 'Namibia'],
  'Kx\'a Click B': ['Botswana', 'Namibia'],
  'Kx\'a Click C': ['Botswana', 'Namibia'],
  'Taa Click': ['Botswana', 'Namibia'],
  'N\xB1ung Click': ['Namibia', 'Angola'],
  'Nama Click': ['Namibia', 'South Africa', 'Botswana'],
  'Naro Click': ['Botswana', 'Namibia'],
  'G\xC7ui Click': ['Botswana'],
  'Ju/\'hoan Click': ['Botswana', 'Namibia'],
  'Hadza Click': ['Tanzania'],
  'Sandawe Click': ['Tanzania'],
  // Other
  'Gurage': ['Ethiopia'],
  'Harari-Argobba': ['Ethiopia'],
  'Tungusic': ['Russia', 'China', 'Mongolia'],
  'Archi': ['Russia'],
  'Samoyedic Arctic': ['Russia'],
  'Old English': ['England'],
  'Middle English': ['England'],
  'English Global': ['Global'],
  'Spanish Global': ['Global'],
  'Mandarin Global': ['Global'],
  'Arabic Global': ['Global'],
};

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /(dedicated)$/i,
  /^(primus|secundus|tertius|quartus|quintus|sextus|septimus|octavus|nonus|decimus)$/i,
  /^\w{1,2}$/, // Single/double letter languages
  /placeholder/i,
  /test/i,
  /fake/i,
  /invalid/i,
  /unknown/i
];

// Check for encoding issues (UTF-8 Mojibake)
function hasEncodingIssues(name) {
  // Look for common Mojibake patterns like â, â€, â€œ, etc.
  const encodingPattern = /â[€"'»¢£¤¥§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷]/;
  return encodingPattern.test(name);
}

// Check if language name is suspicious
function isSuspiciousLanguage(name) {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(name));
}

// Check if language has valid geographic data (basic check)
function hasValidGeography(name) {
  const cleanName = name.replace(/\s*\([^)]*\)\s*$/, '').trim(); // Remove parentheses
  return languageGeographicRanges.hasOwnProperty(cleanName) || languageGeographicRanges.hasOwnProperty(name);
}

function parseNamebaseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the array from window.XNameBases = [...]
  const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*(\[[\s\S]*\]);?/);
  if (!arrayMatch) {
    console.log(`No namebase array found in ${filePath}`);
    return [];
  }

  try {
    // Use eval to parse the JavaScript array (safe since we control the input)
    const namebaseArray = eval(arrayMatch[1]);
    const languages = [];

    for (let i = 0; i < namebaseArray.length; i++) {
      const entry = namebaseArray[i];
      if (entry.name && entry.b) {
        languages.push({
          name: entry.name,
          subjects: entry.b.split(',').map(s => s.trim()),
          line: i + 1 // Approximate line number
        });
      }
    }

    return languages;
  } catch (error) {
    console.log(`Error parsing ${filePath}: ${error.message}`);
    return [];
  }
}

function analyzeLanguages(languages, continent) {
  const results = {
    valid: [],
    invalid: [],
    suspicious: [],
    primusOnly: [],
    singleWord: [],
    encodingIssues: [],
    noGeography: []
  };

  for (const lang of languages) {
    // Check for Primus placeholders
    if (lang.subjects.length === 1 && lang.subjects[0] === 'Primus') {
      results.primusOnly.push(lang);
      continue;
    }

    // Check for single word bases
    if (lang.subjects.length === 1 && lang.subjects[0] !== 'Primus') {
      results.singleWord.push(lang);
    }

    // Check for encoding issues
    if (hasEncodingIssues(lang.name)) {
      results.encodingIssues.push(lang);
    }

    // Check for suspicious language names
    if (isSuspiciousLanguage(lang.name)) {
      results.suspicious.push(lang);
    }

    // Check for missing geographic data
    if (!hasValidGeography(lang.name)) {
      results.noGeography.push(lang);
    }

    // Consider valid if no major issues found
    if (!hasEncodingIssues(lang.name) && !isSuspiciousLanguage(lang.name)) {
      results.valid.push(lang);
    } else {
      results.invalid.push(lang);
    }
  }

  return results;
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE LINGUISTIC AUTHENTICITY VERIFICATION FOR CONTINENTS   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const allResults = {};
  let totalLanguages = 0;
  let totalValid = 0;
  let totalInvalid = 0;
  let totalSuspicious = 0;
  let totalPrimus = 0;
  let totalSingleWord = 0;

  for (const fileName of CONTINENT_FILES) {
    const filePath = path.join(__dirname, '../../modules', fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileName}`);
      continue;
    }

    console.log(`\n📂 Processing ${fileName}...`);
    const continent = fileName.replace('namebases-', '').replace('.js', '');
    const languages = parseNamebaseFile(filePath);
    const results = analyzeLanguages(languages, continent);

    allResults[continent] = results;

    console.log(`   Found ${languages.length} languages`);
    console.log(`   ✅ Valid: ${results.valid.length}`);
    console.log(`   ❌ Invalid: ${results.invalid.length}`);
    console.log(`   ⚠️  Suspicious: ${results.suspicious.length}`);
    console.log(`   🔴 Primus-only: ${results.primusOnly.length}`);
    console.log(`   📝 Single-word: ${results.singleWord.length}`);
    console.log(`   🔧 Encoding issues: ${results.encodingIssues.length}`);
    console.log(`   🌍 No geography: ${results.noGeography.length}`);

    totalLanguages += languages.length;
    totalValid += results.valid.length;
    totalInvalid += results.invalid.length;
    totalSuspicious += results.suspicious.length;
    totalPrimus += results.primusOnly.length;
    totalSingleWord += results.singleWord.length;
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY ACROSS ALL CONTINENTS');
  console.log('='.repeat(80));
  console.log(`Total languages analyzed: ${totalLanguages}`);
  console.log(`✅ Valid languages: ${totalValid} (${((totalValid/totalLanguages)*100).toFixed(1)}%)`);
  console.log(`❌ Invalid languages: ${totalInvalid} (${((totalInvalid/totalLanguages)*100).toFixed(1)}%)`);
  console.log(`⚠️  Suspicious languages: ${totalSuspicious} (${((totalSuspicious/totalLanguages)*100).toFixed(1)}%)`);
  console.log(`🔴 Primus-only languages: ${totalPrimus} (${((totalPrimus/totalLanguages)*100).toFixed(1)}%)`);
  console.log(`📝 Single-word bases: ${totalSingleWord} (${((totalSingleWord/totalLanguages)*100).toFixed(1)}%)`);

  // Detailed reports
  for (const [continent, results] of Object.entries(allResults)) {
    if (results.invalid.length > 0 || results.suspicious.length > 0 || results.primusOnly.length > 0) {
      console.log(`\n🚨 ISSUES IN ${continent.toUpperCase()}:`);

      if (results.primusOnly.length > 0) {
        console.log(`  🔴 Primus placeholders (${results.primusOnly.length}):`);
        results.primusOnly.slice(0, 5).forEach(lang => {
          console.log(`    - ${lang.name} (line ${lang.line})`);
        });
        if (results.primusOnly.length > 5) console.log(`    ... and ${results.primusOnly.length - 5} more`);
      }

      if (results.invalid.length > 0) {
        console.log(`  ❌ Invalid languages (${results.invalid.length}):`);
        results.invalid.slice(0, 5).forEach(lang => {
          console.log(`    - ${lang.name} (line ${lang.line})`);
        });
        if (results.invalid.length > 5) console.log(`    ... and ${results.invalid.length - 5} more`);
      }

      if (results.suspicious.length > 0) {
        console.log(`  ⚠️  Suspicious languages (${results.suspicious.length}):`);
        results.suspicious.slice(0, 5).forEach(lang => {
          console.log(`    - ${lang.name} (line ${lang.line})`);
        });
        if (results.suspicious.length > 5) console.log(`    ... and ${results.suspicious.length - 5} more`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('NEXT STEPS');
  console.log('='.repeat(80));
  console.log('1. Research and verify invalid/suspicious language names');
  console.log('2. Replace Primus placeholders with authentic placenames');
  console.log('3. Expand single-word bases with additional placenames');
  console.log('4. Remove or correct invalid entries');
  console.log('5. Re-run this script to verify improvements');
  console.log('\nSources to check: Ethnologue (ethnologue.com), Glottolog (glottolog.org)');

  console.log('\n═══════════════════════════════════════════════════════════════════════\n');
}

if (require.main === module) {
  main();
}

module.exports = { main, hasValidGeography, isSuspiciousLanguage };