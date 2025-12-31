#!/usr/bin/env node

/**
 * Language Authenticity Verification Script
 * 
 * This script checks namebases-real.js for:
 * 1. Languages with "Primus" placeholders that need fixing
 * 2. Potentially fake/misspelled language names
 * 3. Languages with questionable placename mappings
 */

const fs = require('fs');
const path = require('path');

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(namebasePath, 'utf-8');

// Parse the namebase
const lines = content.split('\n');
const bases = [];

for (const line of lines) {
  const match = line.match(/\{ name: "([^"]+)".*?b: "([^"]+)"/);
  if (match) {
    bases.push({
      name: match[1],
      base: match[2]
    });
  }
}

// Flagged issues
const issues = {
  primusPlaceholders: [],
  fakeLanguageNames: [],
  questionablePlacenames: [],
  encodingIssues: [],
  singleWordBases: []
};

// Suspected fake/misspelled language names
const suspiciousNames = [
  'Riang', // Might be typo
  'BPh', // Abbreviation
  'Big Flowery', // Sounds fake
  'Français Tirailleur', // Possibly incorrect
  'Tày Bôi Pidgin French', // Encoding issue
  'Bole Chadic language', // Redundant description
  'BiuΓÇôMandara', // Encoding issue
  'Cavineña', // Encoding issue
  'Yuracaré', // Encoding issue
  'Fulniô', // Encoding issue
  'Nivaclé', // Encoding issue
  'Bjarmian S├ími', // Encoding issue
  'Borgarm├Ñlet', // Encoding issue
  'Baur├⌐', // Encoding issue
  'Cof├ín', // Encoding issue
  'Fran├ºais', // Encoding issue
  'Central Erzya', // Might be typo for Erzya
  'Kodi (dedicated)', // Too generic
  'Ginuman (dedicated)', // Too generic
  'Gobasi (dedicated)', // Too generic
  'Goemai language (dedicated)', // Redundant
  'Goguryeo Korean (dedicated)', // Misspelled Goguryeo
  'Goji language (dedicated)', // Too generic
  'Gola (dedicated)', // Too generic
  'Golin (dedicated)', // Too generic
  'Gongduk (dedicated)', // Too generic
  'Gonja (dedicated)', // Possibly legit
  'Gooniyandi (dedicated)', // Might be legit
  'Gorakor (dedicated)', // Possibly fake
  'Gorontalo (dedicated)', // Likely legit
  'Gorova (dedicated)', // Possibly fake
  'Gozarkhani (dedicated)', // Possibly fake
  'Grass Koi (dedicated)', // Fake-sounding
  'Grassfields Bantu (dedicated)', // Fake-sounding
  'Gua (dedicated)', // Too generic
  'Guaicuru (dedicated)', // Possibly legit
  'Guahibo (dedicated)', // Possibly legit
  'Guajajara (dedicated)', // Possibly legit
  'Guajiro (dedicated)', // Possibly legit
  'Guambiano (dedicated)', // Possibly legit
  'Guaraní (dedicated)', // Legit
  'Guarani (dedicated)', // Duplicate/different spelling
  'Guaraní Aquidabana (dedicated)', // Legit dialect
  'Guaraní Boliviano (dedicated)', // Legit dialect
  'Guaraní Eastern Bolivian (dedicated)', // Legit dialect
  'Guaraní Mbyá (dedicated)', // Legit dialect
  'Guaraní Occidental (dedicated)', // Legit dialect
  'Guaraní Paraguayan (dedicated)', // Legit dialect
  'Guaraní Western Bolivian (dedicated)', // Legit dialect
  'Guarayu (dedicated)', // Legit
  'Guató (dedicated)', // Possibly legit
  'Gubu (dedicated)', // Possibly fake
  'Gudang (dedicated)', // Possibly fake
  'Gudanji (dedicated)', // Possibly legit
  'Gugu Badhun (dedicated)', // Possibly legit Australian language
  'Gugu Bimil (dedicated)', // Possibly legit Australian language
  'Gugubera (dedicated)', // Possibly legit Australian language
  'Guguyimidjir (dedicated)', // Possibly legit Australian language
  'Gula (dedicated)', // Too generic
  'Gulbang (dedicated)', // Possibly legit
  'Gulf Arabic (dedicated)', // Legit
  'Gulf Arabic (dedicated) (2)', // Duplicate
  'Gulf Creole Arabic (dedicated)', // Possibly legit
  'Gulf Pidgin Arabic (dedicated)', // Possibly legit
  'Gumuz (dedicated)', // Possibly legit
  'Gumuz (dedicated) (2)', // Duplicate
  'Gun (dedicated)', // Too generic
  'Gunwinggu (dedicated)', // Possibly legit
  'Gunwinigu (dedicated)', // Possibly legit
  'Gur (dedicated)', // Too generic
  'Gur languages (dedicated)', // Too generic
  'Gur (dedicated) (2)', // Duplicate
  'Gur (dedicated) (3)', // Duplicate
  'Gura (dedicated)', // Too generic
  'Gurani (dedicated)', // Typo for Guaraní?
  'Gurdjar (dedicated)', // Possibly fake
  'Gurgula (dedicated)', // Possibly fake
  'Gurindji (dedicated)', // Possibly legit
  'Gurinji (dedicated)', // Possibly legit
  'Gurung (dedicated)', // Possibly legit
  'Gusii (dedicated)', // Possibly legit
  'Gusii (dedicated) (2)', // Duplicate
  'Guwa (dedicated)', // Too generic
  'Guwar (dedicated)', // Too generic
  'Guya (dedicated)', // Too generic
  'Guya language (dedicated)', // Redundant
  'Guya (dedicated) (2)', // Duplicate
  'Guyanese Creole (dedicated)', // Legit
  'Guyanese Creole (dedicated) (2)', // Duplicate
  'Gwahatike (dedicated)', // Possibly legit
  'Gwak (dedicated)', // Too generic
  'Gweda (dedicated)', // Possibly fake
  'Gweno (dedicated)', // Possibly fake
  'Gwibari (dedicated)', // Possibly fake
  'Gwin├ú (dedicated)', // Encoding issue
  'Gyele (dedicated)', // Possibly fake
  'Gyem (dedicated)', // Possibly legit
  'H (dedicated)', // Fake single letter
  'H (dedicated) (2)', // Duplicate
  'Ha (dedicated)', // Too generic
  'Ha (dedicated) (2)', // Duplicate
  'Ha (dedicated) (3)', // Duplicate
  'Ha (dedicated) (4)', // Duplicate
  'Ha (dedicated) (5)', // Duplicate
  'Ha (dedicated) (6)', // Duplicate
  'Haab (dedicated)', // Possibly legit Mayan
  'Haanya (dedicated)', // Possibly fake
  'Hadiyya (dedicated)', // Possibly legit Arabic
  'Hadithi Arabic (dedicated)', // Legit Arabic
  'Hadrami Arabic (dedicated)', // Legit Arabic
  'Hadramautic Arabic (dedicated)', // Legit Arabic
  'Hadza (dedicated)', // Legit language
  'Hadza (dedicated) (2)', // Duplicate
  'Hae (dedicated)', // Too generic
  'Hae (dedicated) (2)', // Duplicate
  'Haka (dedicated)', // Possibly legit
  'Haka (dedicated) (2)', // Duplicate
  'Haka (dedicated) (3)', // Duplicate
  'Halabi Arabic (dedicated)', // Legit Arabic
  'Halang (dedicated)', // Possibly legit
  'Halbi (dedicated)', // Possibly legit
  'Halkomelem (dedicated)', // Possibly legit
  'Halia (dedicated)', // Possibly legit
  'Halh (dedicated)', // Possibly legit Athabaskan
  'Halkomelem (dedicated) (2)', // Duplicate
  'Ham (dedicated)', // Too generic
  'Ham (dedicated) (2)', // Duplicate
  'Ham (dedicated) (3)', // Duplicate
  'Ham (dedicated) (4)', // Duplicate
  'Hamer (dedicated)', // Possibly legit
  'Hamer (dedicated) (2)', // Duplicate
  'Hamer (dedicated) (3)', // Duplicate
  'Hammer-Banna (dedicated)', // Possibly legit
  'Hani (dedicated)', // Possibly legit
  'Hani (dedicated) (2)', // Duplicate
  'Hani (dedicated) (3)', // Duplicate
  'Hani (dedicated) (4)', // Duplicate
  'Hano (dedicated)', // Too generic
  'Hano (dedicated) (2)', // Duplicate
  'Han (dedicated)', // Too generic (just "Han" - ethnic group?)
  'Han (dedicated) (2)', // Duplicate
  'Han (dedicated) (3)', // Duplicate
  'Hanunoo (dedicated)', // Possibly legit Philippine
  'Haraic (dedicated)', // Possibly fake
  'Harari (dedicated)', // Legit Ethiopian language
  'Harari (dedicated) (2)', // Duplicate
  'Harari (dedicated) (3)', // Duplicate
  'Harari (dedicated) (4)', // Duplicate
  'Harauti (dedicated)', // Possibly fake
  'Harau (dedicated)', // Possibly fake
  'Haredo (dedicated)', // Possibly fake
  'Harizmi (dedicated)', // Possibly fake
  'Harmba (dedicated)', // Possibly fake
  'Harnai (dedicated)', // Possibly fake
  'Haroi (dedicated)', // Possibly fake
  'Haroi (dedicated) (2)', // Duplicate
  'Harua (dedicated)', // Possibly fake
  'Harnai (dedicated) (2)', // Duplicate
  'Haronai (dedicated)', // Possibly fake
  'Haronai (dedicated) (2)', // Duplicate
  'Haro (dedicated)', // Too generic
  'Haro (dedicated) (2)', // Duplicate
  'Haro (dedicated) (3)', // Duplicate
  'Haroi (dedicated) (3)', // Duplicate
  'Haru (dedicated)', // Possibly fake
  'Haryanvi (dedicated)', // Legit language
  'Harza (dedicated)', // Possibly fake
  'Haryanvi (dedicated) (2)', // Duplicate
  'Hari (dedicated)', // Too generic
  'Hari (dedicated) (2)', // Duplicate
  'Hari (dedicated) (3)', // Duplicate
  'Hari (dedicated) (4)', // Duplicate
  'Haroi (dedicated) (4)', // Duplicate
  'Haryanvi (dedicated) (3)', // Duplicate
  'Haryanvi (dedicated) (4)', // Duplicate
  'Has (dedicated)', // Too generic
  'Has (dedicated) (2)', // Duplicate
  'Hassaniya Arabic (dedicated)', // Legit Arabic
  'Hassaniya Arabic (dedicated) (2)', // Duplicate
  'Hassaniya Arabic (dedicated) (3)', // Duplicate
  'Hassaniya Arabic (dedicated) (4)', // Duplicate
  'Hattic (dedicated)', // Extinct language family, possibly legit
  'Hattic (dedicated) (2)', // Duplicate
  'Haua (dedicated)', // Possibly legit Nigerian
  'Haya (dedicated)', // Legit Tanzanian
  'Hazaragi (dedicated)', // Legit language
  'Hazaragi (dedicated) (2)', // Duplicate
  'He (dedicated)', // Fake single letter
  'He (dedicated) (2)', // Duplicate
  'He (dedicated) (3)', // Duplicate
  'He (dedicated) (4)', // Duplicate
  'He (dedicated) (5)', // Duplicate
  'He (dedicated) (6)', // Duplicate
  'He (dedicated) (7)', // Duplicate
  'He (dedicated) (8)', // Duplicate
  'Hebrew (dedicated)', // Legit
  'Hebrew (dedicated) (2)', // Duplicate
  'Hebrew (dedicated) (3)', // Duplicate
  'Hebrew (dedicated) (4)', // Duplicate
  'Hebrew (dedicated) (5)', // Duplicate
  'Hebrew (dedicated) (6)', // Duplicate
  'Hebrew (dedicated) (7)', // Duplicate
  'Hebrew (dedicated) (8)', // Duplicate
  'Hebrew (dedicated) (9)', // Duplicate
  'Hebrew (dedicated) (10)', // Duplicate
  'Hebrew (dedicated) (11)', // Duplicate
  'Hebrew (dedicated) (12)', // Duplicate
  'Hebrew (dedicated) (13)', // Duplicate
  'Hebrew (dedicated) (14)', // Duplicate
  'Hebrew (dedicated) (15)', // Duplicate
  'Hebrew (dedicated) (16)', // Duplicate
  'Hebrew (dedicated) (17)', // Duplicate
  'Hebrew (dedicated) (18)', // Duplicate
  'Hebrew (dedicated) (19)', // Duplicate
  'Hebrew (dedicated) (20)', // Duplicate
  'Hebrew (dedicated) (21)', // Duplicate
  'Hebrew (dedicated) (22)', // Duplicate
  'Hebrew (dedicated) (23)', // Duplicate
  'Hebrew (dedicated) (24)', // Duplicate
  'Hebrew (dedicated) (25)', // Duplicate
  'Hebrew (dedicated) (26)', // Duplicate
  'Hebrew (dedicated) (27)', // Duplicate
  'Hebrew (dedicated) (28)', // Duplicate
  'Hebrew (dedicated) (29)', // Duplicate
  'Hebrew (dedicated) (30)', // Duplicate
  'Hebrew (dedicated) (31)', // Duplicate
  'Hebrew (dedicated) (32)', // Duplicate
  'Hebrew (dedicated) (33)', // Duplicate
  'Hebrew (dedicated) (34)', // Duplicate
  'Hebrew (dedicated) (35)', // Duplicate
  'Hebrew (dedicated) (36)', // Duplicate
  'Hebrew (dedicated) (37)', // Duplicate
  'Hebrew (dedicated) (38)', // Duplicate
  'Hebrew (dedicated) (39)', // Duplicate
  'Hebrew (dedicated) (40)', // Duplicate
  'Hebrew (dedicated) (41)', // Duplicate
  'Hebrew (dedicated) (42)', // Duplicate
  'Hebrew (dedicated) (43)', // Duplicate
  'Hebrew (dedicated) (44)', // Duplicate
  'Hebrew (dedicated) (45)', // Duplicate
  'Hebrew (dedicated) (46)', // Duplicate
  'Hebrew (dedicated) (47)', // Duplicate
  'Hebrew (dedicated) (48)', // Duplicate
  'Hebrew (dedicated) (49)', // Duplicate
  'Hebrew (dedicated) (50)', // Duplicate
  'Hebrew (dedicated) (51)', // Duplicate
  'Hebrew (dedicated) (52)', // Duplicate
  'Hebrew (dedicated) (53)', // Duplicate
  'Hebrew (dedicated) (54)', // Duplicate
  'Hebrew (dedicated) (55)', // Duplicate
  'Hebrew (dedicated) (56)', // Duplicate
  'Hebrew (dedicated) (57)', // Corruption/duplicate spam
];

// Check for encoding issues (UTF-8 Mojibake)
const encodingPattern = /[^\\x20-\\x7E\\u00A0-\\u00FF]/;

// Check each base
for (const base of bases) {
  // Check for Primus placeholder
  if (base.base === 'Primus' || base.base === 'Primus,Secundus,Tertius,Quartus,Quintus,Sextus,Septimus,Octavus,Nonus,Decimus') {
    issues.primusPlaceholders.push(base.name);
  }
  
  // Check for suspicious language names
  if (suspiciousNames.includes(base.name) || suspiciousNames.includes(base.name.replace(' (dedicated)', ''))) {
    issues.fakeLanguageNames.push(base.name);
  }
  
  // Check for encoding issues in name
  if (encodingPattern.test(base.name)) {
    issues.encodingIssues.push(base.name);
  }
  
  // Check for single-word base (suspicious)
  if (base.base.split(',').length === 1 && base.base !== 'Primus') {
    issues.singleWordBases.push({ name: base.name, base: base.base });
  }
}

// Output report
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       NAMEBASE AUTHENTICITY VERIFICATION REPORT           ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log(`Total languages checked: ${bases.length}`);
console.log('');

console.log('❌ LANGUAGES WITH "PRIMUS" PLACEHOLDERS:');
console.log('─'.repeat(80));
if (issues.primusPlaceholders.length === 0) {
  console.log('✅ No Primus placeholders found');
} else {
  issues.primusPlaceholders.forEach(name => {
    console.log(`  - ${name}`);
  });
}
console.log(`\nCount: ${issues.primusPlaceholders.length}\n`);

console.log('\n⚠️  SUSPICIOUS/FAKE LANGUAGE NAMES:');
console.log('─'.repeat(80));
if (issues.fakeLanguageNames.length === 0) {
  console.log('✅ No suspicious language names found');
} else {
  issues.fakeLanguageNames.forEach(name => {
    console.log(`  - ${name}`);
  });
}
console.log(`\nCount: ${issues.fakeLanguageNames.length}\n`);

console.log('\n🔧 ENCODING ISSUES (Mojibake):');
console.log('─'.repeat(80));
if (issues.encodingIssues.length === 0) {
  console.log('✅ No encoding issues found');
} else {
  issues.encodingIssues.forEach(name => {
    console.log(`  - ${name}`);
  });
}
console.log(`\nCount: ${issues.encodingIssues.length}\n`);

console.log('\n📝 SINGLE-WORD BASES (potentially lazy placeholders):');
console.log('─'.repeat(80));
if (issues.singleWordBases.length === 0) {
  console.log('✅ No single-word bases found');
} else {
  issues.singleWordBases.forEach(item => {
    console.log(`  - ${item.name}: "${item.base}"`);
  });
}
console.log(`\nCount: ${issues.singleWordBases.length}\n`);

console.log('═══════════════════════════════════════════════════════════════════\n');

// Generate research task list
console.log('📋 RESEARCH TASK LIST:');
console.log('─'.repeat(80));

if (issues.primusPlaceholders.length > 0) {
  console.log('\n1. Replace Primus placeholders:');
  console.log(`   - Research and add authentic placenames for ${issues.primusPlaceholders.length} languages`);
}

if (issues.fakeLanguageNames.length > 0) {
  console.log('\n2. Verify suspicious language names:');
  console.log(`   - Check if these ${issues.fakeLanguageNames.length} languages are real or typos`);
}

if (issues.encodingIssues.length > 0) {
  console.log('\n3. Fix encoding issues:');
  console.log(`   - Fix UTF-8 Mojibake in ${issues.encodingIssues.length} language names`);
}

if (issues.singleWordBases.length > 0) {
  console.log('\n4. Expand single-word bases:');
  console.log(`   - Add more placenames to ${issues.singleWordBases.length} single-word bases`);
}

console.log('\n');
