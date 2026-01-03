#!/usr/bin/env node

/**
 * Comprehensive Linguistic Authenticity Verification Script
 *
 * This script checks all continent namebase files for:
 * 1. Languages with "Primus" placeholders that need fixing
 * 2. Potentially fake/misspelled language names
 * 3. Languages with questionable placename mappings (geographic mismatch)
 * 4. Encoding issues (UTF-8 Mojibake)
 * 5. Single-word bases (potentially lazy placeholders)
 */

const fs = require('fs');
const path = require('path');

// Simplified geographic data
const languageGeographicRanges = {
  'German': ['Germany', 'Austria', 'Switzerland'],
  'English': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Ireland'],
  'French': ['France', 'Belgium', 'Switzerland', 'Luxembourg'],
  'Italian': ['Italy', 'San Marino', 'Vatican City'],
  'Spanish': ['Spain'],
  'Nahuatl': ['Mexico'],
  'Gurage': ['Ethiopia'],
  'Harari-Argobba': ['Ethiopia'],
  'Nordic': ['Norway', 'Sweden', 'Denmark', 'Iceland'],
  'Greek': ['Greece', 'Cyprus'],
  'Roman': ['Italy', 'Romania'],
  'Finnic': ['Finland', 'Estonia'],
  'Korean': ['South Korea', 'North Korea'],
  'Chinese': ['China', 'Taiwan', 'Singapore'],
  'Japanese': ['Japan'],
  'Portuguese': ['Portugal'],
  'Hungarian': ['Hungary'],
  'Turkish': ['Turkey', 'Cyprus'],
  'Berber': ['Morocco', 'Algeria', 'Tunisia'],
  'Arabic': ['Saudi Arabia', 'UAE', 'Egypt'],
  'Inuit': ['Greenland', 'Canada', 'Alaska'],
  'Nigerian': ['Nigeria'],
  'Celtic': ['Ireland', 'Scotland', 'Wales'],
  'Mesopotamian': ['Iraq', 'Syria', 'Turkey'],
  'Iranian': ['Iran'],
  'Hawaiian': ['Hawaii'],
  'Karnataka': ['India'],
  'Quechua': ['Peru', 'Bolivia', 'Ecuador'],
  'Swahili': ['Tanzania', 'Kenya', 'Uganda'],
  'Vietnamese': ['Vietnam'],
  'Cantonese': ['China', 'Hong Kong'],
  'Mongolian': ['Mongolia', 'China'],
  'Lechitic': ['Poland'],
  'Czech-Slovak': ['Czech Republic', 'Slovakia'],
  'South Slavic BCS': ['Croatia', 'Bosnia', 'Serbia', 'Montenegro'],
  'Bulgarian': ['Bulgaria'],
  'Ukrainian': ['Ukraine'],
  'Irish Gaelic': ['Ireland'],
  'Scottish Gaelic': ['Scotland'],
};

const wellKnownCities = {
  'Berlin': 'Germany', 'Munich': 'Germany', 'Hamburg': 'Germany', 'Cologne': 'Germany', 'Frankfurt': 'Germany',
  'London': 'England', 'Birmingham': 'England', 'Manchester': 'England', 'Liverpool': 'England',
  'Paris': 'France', 'Marseille': 'France', 'Lyon': 'France', 'Nice': 'France',
  'Rome': 'Italy', 'Milan': 'Italy', 'Naples': 'Italy', 'Venice': 'Italy',
  'Madrid': 'Spain', 'Barcelona': 'Spain', 'Valencia': 'Spain', 'Seville': 'Spain',
  'Warsaw': 'Poland', 'Krakow': 'Poland', 'Gdansk': 'Poland',
  'Prague': 'Czech Republic', 'Brno': 'Czech Republic',
  'Vienna': 'Austria', 'Salzburg': 'Austria',
  'Budapest': 'Hungary', 'Debrecen': 'Hungary',
  'Bucharest': 'Romania', 'Cluj': 'Romania',
  'Athens': 'Greece', 'Thessaloniki': 'Greece',
  'Helsinki': 'Finland', 'Turku': 'Finland',
  'Oslo': 'Norway', 'Bergen': 'Norway',
  'Stockholm': 'Sweden', 'Gothenburg': 'Sweden',
  'Copenhagen': 'Denmark', 'Aarhus': 'Denmark',
  'Reykjavik': 'Iceland',
  'Istanbul': 'Turkey', 'Ankara': 'Turkey',
  'Cairo': 'Egypt', 'Alexandria': 'Egypt',
  'Riyadh': 'Saudi Arabia', 'Jeddah': 'Saudi Arabia',
  'Dubai': 'UAE', 'Abu Dhabi': 'UAE',
  'Tokyo': 'Japan', 'Osaka': 'Japan', 'Nagoya': 'Japan', 'Kyoto': 'Japan',
  'Beijing': 'China', 'Shanghai': 'China', 'Guangzhou': 'China',
  'Seoul': 'South Korea',
  'Mexico City': 'Mexico', 'Guadalajara': 'Mexico',
  'Lagos': 'Nigeria', 'Kano': 'Nigeria',
  'Addis Ababa': 'Ethiopia', 'Dire Dawa': 'Ethiopia',
  'Nairobi': 'Kenya', 'Mombasa': 'Kenya',
  'Dar es Salaam': 'Tanzania', 'Arusha': 'Tanzania',
  'Lusaka': 'Zambia', 'Ndola': 'Zambia',
  'Lima': 'Peru', 'Cusco': 'Peru', 'Arequipa': 'Peru',
  'Hanoi': 'Vietnam', 'Ho Chi Minh City': 'Vietnam',
  'Hong Kong': 'China',
  'Ulaanbaatar': 'Mongolia',
  'Kyiv': 'Ukraine', 'Kharkiv': 'Ukraine', 'Odesa': 'Ukraine',
  'Sofia': 'Bulgaria', 'Plovdiv': 'Bulgaria',
  'Sarajevo': 'Bosnia', 'Zagreb': 'Croatia', 'Belgrade': 'Serbia',
  'Dublin': 'Ireland', 'Cork': 'Ireland',
  'Edinburgh': 'Scotland', 'Glasgow': 'Scotland',
};

// Suspected fake/misspelled language names
const suspiciousNames = [
  'Riang', 'BPh', 'Big Flowery', 'Français Tirailleur', 'Tày Bôi Pidgin French', 'Bole Chadic language', 'BiuΓÇôMandara', 'Cavineña', 'Yuracaré', 'Fulniô', 'Nivaclé', 'Bjarmian S├ími', 'Borgarm├Ñlet', 'Baur├⌐', 'Cof├ín', 'Fran├ºais', 'Central Erzya',
  'Kodi (dedicated)', 'Ginuman (dedicated)', 'Gobasi (dedicated)', 'Goemai language (dedicated)', 'Goguryeo Korean (dedicated)', 'Goji language (dedicated)', 'Gola (dedicated)', 'Golin (dedicated)', 'Gongduk (dedicated)', 'Gorakor (dedicated)', 'Gorontalo (dedicated)', 'Gorova (dedicated)', 'Gozarkhani (dedicated)', 'Grass Koi (dedicated)', 'Grassfields Bantu (dedicated)', 'Gua (dedicated)', 'Guaicuru (dedicated)', 'Guajiro (dedicated)', 'Guambiano (dedicated)', 'Guaraní (dedicated)', 'Guarani (dedicated)', 'Guaraní Aquidabana (dedicated)', 'Guaraní Boliviano (dedicated)', 'Guaraní Eastern Bolivian (dedicated)', 'Guaraní Mbyá (dedicated)', 'Guaraní Occidental (dedicated)', 'Guaraní Paraguayan (dedicated)', 'Guaraní Western Bolivian (dedicated)', 'Guarayu (dedicated)', 'Guató (dedicated)', 'Gubu (dedicated)', 'Gudang (dedicated)', 'Gudanji (dedicated)', 'Gugu Badhun (dedicated)', 'Gugu Bimil (dedicated)', 'Gugubera (dedicated)', 'Guguyimidjir (dedicated)', 'Gula (dedicated)', 'Gulbang (dedicated)', 'Gun (dedicated)', 'Gunwinggu (dedicated)', 'Gunwinigu (dedicated)', 'Gur (dedicated)', 'Gur languages (dedicated)', 'Gur (dedicated) (2)', 'Gur (dedicated) (3)', 'Gura (dedicated)', 'Gurani (dedicated)', 'Gurdjar (dedicated)', 'Gurgula (dedicated)', 'Gurindji (dedicated)', 'Gurinji (dedicated)', 'Gurung (dedicated)', 'Gusii (dedicated)', 'Gusii (dedicated) (2)', 'Guwa (dedicated)', 'Guwar (dedicated)', 'Guya (dedicated)', 'Guya language (dedicated)', 'Guya (dedicated) (2)', 'Guyanese Creole (dedicated)', 'Guyanese Creole (dedicated) (2)', 'Gwahatike (dedicated)', 'Gwak (dedicated)', 'Gweda (dedicated)', 'Gweno (dedicated)', 'Gwibari (dedicated)', 'Gwin├ú (dedicated)', 'Gyele (dedicated)', 'Gyem (dedicated)', 'H (dedicated)', 'H (dedicated) (2)', 'Ha (dedicated)', 'Ha (dedicated) (2)', 'Ha (dedicated) (3)', 'Ha (dedicated) (4)', 'Ha (dedicated) (5)', 'Ha (dedicated) (6)', 'Haab (dedicated)', 'Haanya (dedicated)', 'Hadiyya (dedicated)', 'Hadithi Arabic (dedicated)', 'Hadrami Arabic (dedicated)', 'Hadramautic Arabic (dedicated)', 'Hadza (dedicated)', 'Hadza (dedicated) (2)', 'Hae (dedicated)', 'Hae (dedicated) (2)', 'Haka (dedicated)', 'Haka (dedicated) (2)', 'Haka (dedicated) (3)', 'Halabi Arabic (dedicated)', 'Halang (dedicated)', 'Halbi (dedicated)', 'Halkomelem (dedicated)', 'Halia (dedicated)', 'Halh (dedicated)', 'Halkomelem (dedicated) (2)', 'Ham (dedicated)', 'Ham (dedicated) (2)', 'Ham (dedicated) (3)', 'Ham (dedicated) (4)', 'Hamer (dedicated)', 'Hamer (dedicated) (2)', 'Hamer (dedicated) (3)', 'Hammer-Banna (dedicated)', 'Hani (dedicated)', 'Hani (dedicated) (2)', 'Hani (dedicated) (3)', 'Hani (dedicated) (4)', 'Hano (dedicated)', 'Hano (dedicated) (2)', 'Han (dedicated)', 'Han (dedicated) (2)', 'Han (dedicated) (3)', 'Hanunoo (dedicated)', 'Haraic (dedicated)', 'Harari (dedicated)', 'Harari (dedicated) (2)', 'Harari (dedicated) (3)', 'Harari (dedicated) (4)', 'Harauti (dedicated)', 'Harau (dedicated)', 'Haredo (dedicated)', 'Harizmi (dedicated)', 'Harmba (dedicated)', 'Harnai (dedicated)', 'Haroi (dedicated)', 'Haroi (dedicated) (2)', 'Harua (dedicated)', 'Harnai (dedicated) (2)', 'Haronai (dedicated)', 'Haronai (dedicated) (2)', 'Haro (dedicated)', 'Haro (dedicated) (2)', 'Haro (dedicated) (3)', 'Haroi (dedicated) (3)', 'Haru (dedicated)', 'Haryanvi (dedicated)', 'Harza (dedicated)', 'Haryanvi (dedicated) (2)', 'Hari (dedicated)', 'Hari (dedicated) (2)', 'Hari (dedicated) (3)', 'Hari (dedicated) (4)', 'Haroi (dedicated) (4)', 'Haryanvi (dedicated) (3)', 'Haryanvi (dedicated) (4)', 'Has (dedicated)', 'Has (dedicated) (2)', 'Hassaniya Arabic (dedicated)', 'Hassaniya Arabic (dedicated) (2)', 'Hassaniya Arabic (dedicated) (3)', 'Hassaniya Arabic (dedicated) (4)', 'Hattic (dedicated)', 'Hattic (dedicated) (2)', 'Haua (dedicated)', 'Haya (dedicated)', 'Hazaragi (dedicated)', 'Hazaragi (dedicated) (2)', 'He (dedicated)', 'He (dedicated) (2)', 'He (dedicated) (3)', 'He (dedicated) (4)', 'He (dedicated) (5)', 'He (dedicated) (6)', 'He (dedicated) (7)', 'He (dedicated) (8)', 'Hebrew (dedicated)', 'Hebrew (dedicated) (2)', 'Hebrew (dedicated) (3)', 'Hebrew (dedicated) (4)', 'Hebrew (dedicated) (5)', 'Hebrew (dedicated) (6)', 'Hebrew (dedicated) (7)', 'Hebrew (dedicated) (8)', 'Hebrew (dedicated) (9)', 'Hebrew (dedicated) (10)', 'Hebrew (dedicated) (11)', 'Hebrew (dedicated) (12)', 'Hebrew (dedicated) (13)', 'Hebrew (dedicated) (14)', 'Hebrew (dedicated) (15)', 'Hebrew (dedicated) (16)', 'Hebrew (dedicated) (17)', 'Hebrew (dedicated) (18)', 'Hebrew (dedicated) (19)', 'Hebrew (dedicated) (20)', 'Hebrew (dedicated) (21)', 'Hebrew (dedicated) (22)', 'Hebrew (dedicated) (23)', 'Hebrew (dedicated) (24)', 'Hebrew (dedicated) (25)', 'Hebrew (dedicated) (26)', 'Hebrew (dedicated) (27)', 'Hebrew (dedicated) (28)', 'Hebrew (dedicated) (29)', 'Hebrew (dedicated) (30)', 'Hebrew (dedicated) (31)', 'Hebrew (dedicated) (32)', 'Hebrew (dedicated) (33)', 'Hebrew (dedicated) (34)', 'Hebrew (dedicated) (35)', 'Hebrew (dedicated) (36)', 'Hebrew (dedicated) (37)', 'Hebrew (dedicated) (38)', 'Hebrew (dedicated) (39)', 'Hebrew (dedicated) (40)', 'Hebrew (dedicated) (41)', 'Hebrew (dedicated) (42)', 'Hebrew (dedicated) (43)', 'Hebrew (dedicated) (44)', 'Hebrew (dedicated) (45)', 'Hebrew (dedicated) (46)', 'Hebrew (dedicated) (47)', 'Hebrew (dedicated) (48)', 'Hebrew (dedicated) (49)', 'Hebrew (dedicated) (50)', 'Hebrew (dedicated) (51)', 'Hebrew (dedicated) (52)', 'Hebrew (dedicated) (53)', 'Hebrew (dedicated) (54)', 'Hebrew (dedicated) (55)', 'Hebrew (dedicated) (56)', 'Hebrew (dedicated) (57)',
  'Be',
  'E'
];

// Encoding issue pattern
const encodingPattern = /[^\\x20-\\x7E\\u00A0-\\u00FF]/;

// Continent files to check
const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-southAmerica.js'
];

// Issues storage
const allIssues = {};

for (const filePath of continentFiles) {
  const continentName = path.basename(filePath, '.js').replace('namebases-', '');
  allIssues[continentName] = {
    primusPlaceholders: [],
    fakeLanguageNames: [],
    questionablePlacenames: [],
    encodingIssues: [],
    singleWordBases: []
  };
}

// Process each continent file
for (const filePath of continentFiles) {
  const continentName = path.basename(filePath, '.js').replace('namebases-', '');
  const fullPath = path.join(__dirname, '../../', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Parse the namebase array
  const lines = content.split('\n');
  const bases = [];
  let currentName = null;

  for (const line of lines) {
    if (!currentName) {
      const nameMatch = line.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        currentName = nameMatch[1];
      }
    } else {
      const baseMatch = line.match(/"b":\s*"([^"]+)"/);
      if (baseMatch) {
        bases.push({
          name: currentName,
          base: baseMatch[1]
        });
        currentName = null;
      }
    }
  }

  console.log(`  ${continentName}: ${bases.length} languages found`);

  // Check each base
  for (const base of bases) {
    // Check for Primus placeholder
    if (base.base === 'Primus' || base.base === 'Primus,Secundus,Tertius,Quartus,Quintus,Sextus,Septimus,Octavus,Nonus,Decimus') {
      allIssues[continentName].primusPlaceholders.push(base.name);
    }

    // Check for suspicious language names
    if (suspiciousNames.includes(base.name) || suspiciousNames.includes(base.name.replace(' (dedicated)', ''))) {
      allIssues[continentName].fakeLanguageNames.push(base.name);
    }

    // Check for encoding issues in name
    if (encodingPattern.test(base.name)) {
      allIssues[continentName].encodingIssues.push(base.name);
    }

    // Check for single-word base
    const subjects = base.base.split(',').map(s => s.trim());
    if (subjects.length === 1 && subjects[0] !== 'Primus') {
      allIssues[continentName].singleWordBases.push({ name: base.name, base: base.base });
    }

    // Geographic check
    const geographicData = languageGeographicRanges[base.name];
    if (geographicData) {
      let suspiciousCount = 0;
      for (const subject of subjects) {
        let matchesGeography = false;
        if (wellKnownCities[subject]) {
          matchesGeography = geographicData.includes(wellKnownCities[subject]);
        }
        if (!matchesGeography) {
          suspiciousCount++;
        }
      }
      const suspiciousRatio = suspiciousCount / subjects.length;
      if (suspiciousRatio > 0.3 && subjects.length > 1) {
        allIssues[continentName].questionablePlacenames.push({
          name: base.name,
          expectedRange: geographicData,
          suspiciousCount,
          totalSubjects: subjects.length,
          suspiciousRatio: suspiciousRatio.toFixed(2)
        });
      }
    }
  }
}

// Output report
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║   COMPREHENSIVE LINGUISTIC AUTHENTICITY VERIFICATION REPORT   ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

for (const [continent, issues] of Object.entries(allIssues)) {
  console.log(`${continent.toUpperCase()}:`);
  console.log('─'.repeat(80));

  if (issues.primusPlaceholders.length > 0) {
    console.log(`  ❌ Primus placeholders: ${issues.primusPlaceholders.length}`);
    issues.primusPlaceholders.forEach(name => console.log(`     - ${name}`));
  }

  if (issues.fakeLanguageNames.length > 0) {
    console.log(`  ⚠️  Fake/suspicious names: ${issues.fakeLanguageNames.length}`);
    issues.fakeLanguageNames.forEach(name => console.log(`     - ${name}`));
  }

  if (issues.questionablePlacenames.length > 0) {
    console.log(`  🌍 Questionable placenames: ${issues.questionablePlacenames.length}`);
    issues.questionablePlacenames.forEach(item => console.log(`     - ${item.name} (${item.suspiciousCount}/${item.totalSubjects})`));
  }

  if (issues.encodingIssues.length > 0) {
    console.log(`  🔧 Encoding issues: ${issues.encodingIssues.length}`);
    issues.encodingIssues.forEach(name => console.log(`     - ${name}`));
  }

  if (issues.singleWordBases.length > 0) {
    console.log(`  📝 Single-word bases: ${issues.singleWordBases.length}`);
    issues.singleWordBases.forEach(item => console.log(`     - ${item.name}: "${item.base}"`));
  }

  const totalIssues = issues.primusPlaceholders.length + issues.fakeLanguageNames.length + issues.questionablePlacenames.length + issues.encodingIssues.length + issues.singleWordBases.length;
  console.log(`  Total issues: ${totalIssues}\n`);
}

console.log('═══════════════════════════════════════════════════════════════════\n');

console.log('📋 SUMMARY OF INVALID/EXTRANEOUS ENTRIES TO REMOVE:');
console.log('─'.repeat(80));

let totalToRemove = 0;
for (const [continent, issues] of Object.entries(allIssues)) {
  const toRemove = issues.primusPlaceholders.concat(issues.fakeLanguageNames).concat(issues.encodingIssues).concat(issues.singleWordBases.map(i => i.name));
  if (toRemove.length > 0) {
    console.log(`${continent.toUpperCase()}: ${toRemove.length} entries`);
    toRemove.forEach(name => console.log(`  - ${name}`));
    totalToRemove += toRemove.length;
  }
}

console.log(`\nTotal entries to remove: ${totalToRemove}`);