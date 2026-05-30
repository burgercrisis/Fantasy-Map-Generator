#!/usr/bin/env node

/**
 * Simple test of geographic verification - processes first 50 languages only
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

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(namebasePath, 'utf-8');

// Parse namebase
const lines = content.split('\n');
const languages = [];

for (const line of lines) {
  const match = line.match(/\{ name: "([^"]+)".*?b: "([^"]+)"/);
  if (match) {
    languages.push({
      name: match[1],
      subjects: match[2].split(',').map(s => s.trim())
    });
  }
}

// Analyze first 50 languages only
const languagesToCheck = languages.slice(0, 50);

console.log('════════════════════════════════════════════════════════════════════════════\n');
console.log(`Analyzing first ${languagesToCheck.length} languages...\n`);

const results = {
  verified: [],
  suspicious: [],
  noGeographicData: [],
  primusOnly: []
};

for (const lang of languagesToCheck) {
  if (lang.subjects.length === 1 && (lang.subjects[0] === 'Primus' || lang.subjects[0].includes('Primus'))) {
    results.primusOnly.push(lang);
    continue;
  }

  const geographicData = languageGeographicRanges[lang.name];
  
  if (!geographicData) {
    results.noGeographicData.push(lang);
    continue;
  }

  const suspiciousSubjects = [];
  const verifiedSubjects = [];
  
  for (const subject of lang.subjects) {
    let matchesGeography = false;
    
    // Check well-known cities
    if (wellKnownCities[subject]) {
      matchesGeography = geographicData.includes(wellKnownCities[subject]);
    }
    
    if (matchesGeography) {
      verifiedSubjects.push(subject);
    } else {
      suspiciousSubjects.push(subject);
    }
  }

  const suspiciousRatio = suspiciousSubjects.length / lang.subjects.length;
  
  if (suspiciousRatio > 0.3) {
    results.suspicious.push({
      name: lang.name,
      expectedRange: geographicData,
      suspiciousCount: suspiciousSubjects.length,
      totalSubjects: lang.subjects.length,
      suspiciousRatio: suspiciousRatio.toFixed(2),
      sampleSuspicious: suspiciousSubjects.slice(0, 5)
    });
  } else {
    results.verified.push({
      name: lang.name,
      expectedRange: geographicData,
      verifiedCount: verifiedSubjects.length,
      totalSubjects: lang.subjects.length
    });
  }
}

// Output Results
console.log('✅ VERIFIED LANGUAGES:\n');
results.verified.forEach(lang => {
  console.log(`  ${lang.name}: ${lang.verifiedCount}/${lang.totalSubjects} subjects verified`);
  console.log(`    Expected range: ${lang.expectedRange.join(', ')}`);
  console.log('');
});

console.log('⚠️  SUSPICIOUS LANGUAGES (>30% unmatched):\n');
results.suspicious.forEach(lang => {
  console.log(`  ${lang.name}: ${lang.suspiciousCount}/${lang.totalSubjects} subjects suspicious (${lang.suspiciousRatio})`);
  console.log(`    Expected range: ${lang.expectedRange.join(', ')}`);
  console.log(`    Sample suspicious: ${lang.sampleSuspicious.join(', ')}`);
  console.log('');
});

console.log('❌ PRIMUS-ONLY LANGUAGES:\n');
results.primusOnly.forEach(lang => {
  console.log(`  ${lang.name} (${lang.subjects.length} subject)`);
  console.log('');
});

console.log('❓ NO GEOGRAPHIC DATA:\n');
results.noGeographicData.forEach(lang => {
  console.log(`  ${lang.name} (${lang.subjects.length} subjects)`);
  console.log('');
});

console.log('════════════════════════════════════════════════════════════════════════════');
console.log('\nSUMMARY:');
console.log(`  Verified: ${results.verified.length}`);
console.log(`  Suspicious: ${results.suspicious.length}`);
console.log(`  Primus-only: ${results.primusOnly.length}`);
console.log(`  No geographic data: ${results.noGeographicData.length}`);
console.log('════════════════════════════════════════════════════════════════════════════\n');
