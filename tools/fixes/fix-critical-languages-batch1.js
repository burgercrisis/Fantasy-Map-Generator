#!/usr/bin/env node
/**
 * Fix 2 Critical Languages with Quality Issues
 * 
 * Languages to fix:
 * 1. Hindko, Northern (score: 1) - Asia
 * 2. Ans (score: 1) - Unknown/Other (Anii language from Benin/Togo)
 * 
 * Research Sources:
 * - Hindko: Wikipedia, Hindko Language & Culture Society, Ethnologue
 *   Spoken in: Khyber Pakhtunkhwa (Pakistan) - Peshawar, Abbottabad, Mardan, 
 *   Swabi, Nowshera, Kohat, Bannu, Haripur, Mansehra, Attock
 * - Ans (Anii): Wikipedia, SIL International, Omniglot
 *   Spoken in: Benin (Bassila Commune, Donga Department) and Togo
 *   Also known as: Bassila, Basila, Gisida
 *   Place names: Bassila, Guiguizo, Kemetou Penezoulou, Bodi, Bayakou, Yari, etc.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ASIA_FILE = path.join(__dirname, '..', '..', 'modules', 'namebases-asia.js');
const EUROPE_FILE = path.join(__dirname, '..', '..', 'modules', 'namebases-europe.js');
const UNKNOWN_FILE = path.join(__dirname, '..', '..', 'modules', 'namebases-unknown.js');

// Authentic place names for Hindko, Northern (Pakistan - Khyber Pakhtunkhwa)
const HINDKO_PLACES = [
  // Major cities in Hindko-speaking areas
  'Peshawar',      // Major city, urban Hindko variety
  'Abbottabad',    // Literary tradition center
  'Mardan',        // Major city
  'Swabi',         // District center
  'Nowshera',      // District center
  'Kohat',         // Kohati dialect
  'Bannu',         // District center
  'Haripur',       // Hazara Division
  'Mansehra',      // Hazara Division
  'Attock',        // Punjab province
  'Mingora',       // Swat region
  'Chitral',       // Northern area
  'Dir',           // District center
  'Timergara',     // Dir Lower
  'Balakot',       // Mansehra District
  'Sherpur',       // Mansehra District
  'SingoDiGarhi',  // Haripur area
  'Jammun',        // Near Ghazi, Haripur
  'PindiGheb',     // Attock District (Ghebi dialect)
  'Talagang',      // Attock area (Awankari dialect)
  'Muzaffarabad',  // Azad Kashmir
  'Kaghan',        // Kaghan Valley
  'Neelum',        // Neelum Valley
  'DeraIsmailKhan', // Southern area
  'Tank',          // Tank District
  'LakkiMarwat',   // Lakki Marwat District
  'Hangu',         // Hangu District
  'Karak',         // Karak District
  'Shangla',       // Shangla District
  'Battagram',     // Battagram District
  'Torghar',       // Torghar District
  'Kohistan'       // Kohistan District
];

// Authentic place names for Ans (Anii language - Benin/Togo)
const ANS_PLACES = [
  // Major Anii-speaking towns in Benin (Bassila Commune, Donga Department)
  'Bassila',           // Largest Anii-speaking town, commune center
  'Guiguizo',          // Town in Bassila commune
  'KemetouPenezoulou', // Village in Bassila (also called Pénéssoulou)
  'KemetouAlidjo',     // Village in Bassila
  'Bodi',              // Village (Gibodija)
  'Bayakou',           // Village (Gibayaakuja)
  'Yari',              // Village (Yaari ka gija)
  'Mboroko',           // Village (Giborokoja)
  'Penelan',           // Village (Gipenelanja)
  'Kodowari',          // Village (Gikodowaraja)
  'Dengou',            // Village (Gideenguja)
  'Agerendebou',       // Village (Ngmeelang ka gija)
  'Nagayile',          // Village (Naagayili ka gija)
  'Frignion',          // Village (Frinyio ka gija)
  'Giseda',            // Village in Bassila
  'Gifolanga',         // Village in Bassila
  // Togo locations (Central Region, Tchamba Prefecture)
  'Tchamba',           // Togo - Central Region
  'Sotouboua',         // Togo - Central Region
  'Bassar',            // Togo - Kara Region (border area)
  // Additional Benin towns near Anii-speaking areas
  'Djougou',           // Donga Department
  'Copargo',           // Donga Department
  'Ouake',             // Donga Department
  'Kaba',              // Togo - border area
  'Kouka',             // Togo - border area
  'Tchalinga',         // Togo - border area
  'Beterou',           // Benin - near Bassila
  'Ndali',             // Benin - near Bassila
  'Tanguieta',         // Benin - Atakora (near Anii areas)
  'Materi'             // Benin - Atakora (near Anii areas)
];

// Read and update Hindko entry in namebases-asia.js
function fixHindko() {
  console.log('Fixing Hindko, Northern...');
  
  let content = fs.readFileSync(ASIA_FILE, 'utf8');
  
  // Find and replace the Hindko entry
  const oldEntry = /{\s*"name":\s*"Hindko, Northern",[\s\S]*?"b":\s*"[^"]*"\s*}/;
  
  const newEntry = JSON.stringify({
    name: "Hindko, Northern",
    i: 994,
    min: 4,
    max: 11,
    d: "lnrt",  // Updated to proper d-value for Indo-Aryan language
    m: 0,
    b: HINDKO_PLACES.join(',')
  }, null, 2);
  
  if (oldEntry.test(content)) {
    content = content.replace(oldEntry, newEntry);
    fs.writeFileSync(ASIA_FILE, content, 'utf8');
    console.log(`  ✓ Updated Hindko with ${HINDKO_PLACES.length} authentic place names`);
    return true;
  } else {
    console.log('  ✗ Could not find Hindko entry');
    return false;
  }
}

// Read and update Ans entry in namebases-europe.js (entry has name "Ans," with trailing comma)
function fixAns() {
  console.log('Fixing Ans (Anii language)...');
  
  let content = fs.readFileSync(EUROPE_FILE, 'utf8');
  
  // Find and replace the Ans entry (note: the name is "Ans," with a trailing comma in the original)
  const ansPattern = /{\s*"name":\s*"Ans,",[\s\S]*?"b":\s*"[^"]*"\s*}/;
  
  const newEntry = JSON.stringify({
    name: "Ans",  // Fixed: removed trailing comma
    i: 371,
    min: 4,
    max: 11,
    d: "lnrt",  // Updated to proper d-value for Niger-Congo language
    m: 0,
    b: ANS_PLACES.join(',')
  }, null, 2);
  
  if (ansPattern.test(content)) {
    content = content.replace(ansPattern, newEntry);
    fs.writeFileSync(EUROPE_FILE, content, 'utf8');
    console.log(`  ✓ Updated Ans with ${ANS_PLACES.length} authentic place names`);
    console.log('  ✓ Fixed name formatting (removed trailing comma)');
    return true;
  } else {
    console.log('  ✗ Could not find Ans entry with pattern, trying simpler match...');
    // Try simpler pattern
    const simplePattern = /"name":\s*"Ans,"/;
    if (simplePattern.test(content)) {
      console.log('  Found "Ans," entry, attempting manual replacement...');
      // Find the full entry manually
      const startIdx = content.search(simplePattern);
      if (startIdx !== -1) {
        // Find the end of this entry (next closing brace at the same level)
        const entryStart = content.lastIndexOf('{', startIdx);
        let braceCount = 0;
        let entryEnd = entryStart;
        for (let i = entryStart; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          if (braceCount === 0) {
            entryEnd = i + 1;
            break;
          }
        }
        const oldEntry = content.substring(entryStart, entryEnd);
        content = content.substring(0, entryStart) + newEntry + content.substring(entryEnd);
        fs.writeFileSync(EUROPE_FILE, content, 'utf8');
        console.log(`  ✓ Updated Ans with ${ANS_PLACES.length} authentic place names`);
        return true;
      }
    }
    return false;
  }
}

// Main execution
console.log('='.repeat(60));
console.log('Critical Language Fix - Batch 1');
console.log('='.repeat(60));
console.log();

const results = {
  hindko: fixHindko(),
  ans: fixAns()
};

console.log();
console.log('='.repeat(60));
console.log('Summary');
console.log('='.repeat(60));
console.log(`Hindko, Northern: ${results.hindko ? 'FIXED ✓' : 'FAILED ✗'}`);
console.log(`Ans (Anii):       ${results.ans ? 'FIXED ✓' : 'FAILED ✗'}`);
console.log();

if (results.hindko && results.ans) {
  console.log('All critical languages have been updated successfully!');
  console.log();
  console.log('Research Sources:');
  console.log('- Hindko: Wikipedia, Hindko Language & Culture Society');
  console.log('          (hindko.org), Ethnologue, Pakistan Census');
  console.log('- Ans:    Wikipedia, SIL International, Omniglot');
  console.log('          (Anii language, also known as Bassila/Basila)');
  process.exit(0);
} else {
  console.log('Some updates failed. Please check the files manually.');
  process.exit(1);
}
