#!/usr/bin/env node

/**
 * Language Geographic Authenticity Verification Script
 * 
 * This script verifies each language's authenticity by checking if the placenames (subjects)
 * used in its namebase match the actual geographic range where that language is spoken.
 * 
 * This helps identify:
 * 1. Languages with placenames from wrong regions
 * 2. Fake/suspicious language entries
 * 3. Languages that need geographic range research
 */

const fs = require('fs');
const path = require('path');

// Language Geographic Range Database
// Maps language names to expected countries/regions where they are spoken
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

// Country to Placename Patterns (helps identify which country a placename belongs to)
const countryPlacenamePatterns = {
  'Germany': [/berg$/, /burg$/, /heim$/, /dorf$/, /hausen$/, /ingen$/, /stadt$/, /tal$/, /wald$/, /feld$/, /au$/, /bach$/, /berg$/],
  'England': [/bury$/, /ford$/, /ham$/, /ton$/, /wich$/, /wich$/, /minster$/, /cester$/, /pool$/, /mouth$/, /wick$/, /bridge$/, /field$/],
  'France': [/ville$/, /sur$/, /le$/, /aux$/, /ac$/, /y$/, /iers$/, /iers$/, /mont$/, /chateau$/],
  'Italy': [/ano$/, /eto$/, /ara$/, /ano$/, /li$/, /ca$/, /zo$/, /iano$/, /ello$/],
  'Spain': [/o$/, /a$/, /de$/, /la$/, /al$/, /ar$/, /illo$/, /eda$/],
  'Poland': [/ow$/, /owo$/, /ice$/, /any$/, /w$/, /ca$/, /ow$/],
  'Russia': [/grad$/, /ovo$/, /yevo$/, /sk$/, /kaya$/, /gorsk$/, /ovo$/, /yevo$/],
  'Japan': [/mura$/, /machi$/, /shita$/, /saka$/, /kawa$/, /yama$/, /zawa$/, /bashi$/, /kawa$/],
  'China': [/an$/, /zhou$/, /ning$/, /shan$/, /yang$/, /jiang$/, /shan$/, /yang$/, /jiang$/],
  'Mexico': [/co$/, /pan$/, /lan$/, /can$/, /tla$/, /petl$/, /yan$/, /pan$/],
  'India': [/pur$/, /garh$/, /puram$/, /nagar$/, /halli$/, /guda$/, /pet$/, /varam$/, /puram$/],
  'Nigeria': [/ka$/, /na$/, /wa$/, /ro$/, /go$/, /pe$/, /bu$/, /yi$/, /lafi$/],
  'Portugal': [/da$/, /te$/, /eiro$/, /al$/, /eira$/, /ca$/, /al$/],
  'Hungary': [/a$/, /banya$/, /gyo$/, /halom$/, /var$/, /szasz$/, /erdo$/, /s$/],
};

// Well-known cities lookup - comprehensive list
const wellKnownCities = {
  // Germany
  'Berlin': 'Germany', 'Munich': 'Germany', 'Hamburg': 'Germany', 'Cologne': 'Germany', 'Frankfurt': 'Germany',
  'Stuttgart': 'Germany', 'Dusseldorf': 'Germany', 'Dortmund': 'Germany', 'Essen': 'Germany', 'Leipzig': 'Germany',
  // England/UK  
  'London': 'England', 'Birmingham': 'England', 'Manchester': 'England', 'Liverpool': 'England', 'Leeds': 'England',
  'Sheffield': 'England', 'Bristol': 'England', 'Glasgow': 'Scotland', 'Edinburgh': 'Scotland', 'Cardiff': 'Wales',
  'Belfast': 'Northern Ireland', 'Dublin': 'Ireland',
  // France
  'Paris': 'France', 'Marseille': 'France', 'Lyon': 'France', 'Toulouse': 'France', 'Nice': 'France',
  'Nantes': 'France', 'Strasbourg': 'France', 'Montpellier': 'France', 'Bordeaux': 'France', 'Lille': 'France',
  // Italy
  'Rome': 'Italy', 'Milan': 'Italy', 'Naples': 'Italy', 'Turin': 'Italy', 'Palermo': 'Italy',
  'Genoa': 'Italy', 'Bologna': 'Italy', 'Florence': 'Italy', 'Bari': 'Italy', 'Catania': 'Italy',
  'Venice': 'Italy', 'Verona': 'Italy', 'Messina': 'Italy', 'Padua': 'Italy', 'Trieste': 'Italy',
  // Spain
  'Madrid': 'Spain', 'Barcelona': 'Spain', 'Valencia': 'Spain', 'Seville': 'Spain', 'Zaragoza': 'Spain',
  'Malaga': 'Spain', 'Murcia': 'Spain', 'Palma': 'Spain', 'Las Palmas': 'Spain', 'Bilbao': 'Spain',
  // Poland
  'Warsaw': 'Poland', 'Krakow': 'Poland', 'Lodz': 'Poland', 'Wroclaw': 'Poland', 'Poznan': 'Poland',
  'Gdansk': 'Poland', 'Szczecin': 'Poland', 'Bydgoszcz': 'Poland', 'Lublin': 'Poland', 'Katowice': 'Poland',
  // Czech Republic
  'Prague': 'Czech Republic', 'Brno': 'Czech Republic', 'Ostrava': 'Czech Republic', 'Pilsen': 'Czech Republic',
  // Russia
  'Moscow': 'Russia', 'Saint Petersburg': 'Russia', 'Novosibirsk': 'Russia', 'Yekaterinburg': 'Russia',
  'Nizhny Novgorod': 'Russia', 'Kazan': 'Russia', 'Chelyabinsk': 'Russia', 'Omsk': 'Russia',
  // Japan
  'Tokyo': 'Japan', 'Osaka': 'Japan', 'Nagoya': 'Japan', 'Sapporo': 'Japan', 'Fukuoka': 'Japan',
  'Kobe': 'Japan', 'Kyoto': 'Japan', 'Yokohama': 'Japan', 'Hiroshima': 'Japan', 'Sendai': 'Japan',
  // China
  'Beijing': 'China', 'Shanghai': 'China', 'Guangzhou': 'China', 'Shenzhen': 'China', 'Wuhan': 'China',
  'Tianjin': 'China', 'Chongqing': 'China', 'Nanjing': 'China', 'Chengdu': 'China', 'Hangzhou': 'China',
  // Mexico
  'Mexico City': 'Mexico', 'Guadalajara': 'Mexico', 'Monterrey': 'Mexico', 'Puebla': 'Mexico',
  'Tijuana': 'Mexico', 'Leon': 'Mexico', 'Juarez': 'Mexico', 'Cancun': 'Mexico',
  // Nigeria
  'Lagos': 'Nigeria', 'Kano': 'Nigeria', 'Ibadan': 'Nigeria', 'Kaduna': 'Nigeria', 'Port Harcourt': 'Nigeria',
  // Portugal
  'Lisbon': 'Portugal', 'Porto': 'Portugal', 'Amadora': 'Portugal', 'Braga': 'Portugal', 'Coimbra': 'Portugal',
  // Hungary
  'Budapest': 'Hungary', 'Debrecen': 'Hungary', 'Szeged': 'Hungary', 'Miskolc': 'Hungary', 'Pecs': 'Hungary',
  // Austria
  'Vienna': 'Austria', 'Graz': 'Austria', 'Linz': 'Austria', 'Salzburg': 'Austria', 'Innsbruck': 'Austria',
  // Switzerland
  'Zurich': 'Switzerland', 'Geneva': 'Switzerland', 'Basel': 'Switzerland', 'Lausanne': 'Switzerland', 'Bern': 'Switzerland',
  // Czech Republic
  'Brno': 'Czech Republic', 'Ostrava': 'Czech Republic', 'Plzen': 'Czech Republic',
  // Ukraine
  'Kyiv': 'Ukraine', 'Kharkiv': 'Ukraine', 'Odesa': 'Ukraine', 'Dnipro': 'Ukraine',
  // Bulgaria
  'Sofia': 'Bulgaria', 'Plovdiv': 'Bulgaria', 'Varna': 'Bulgaria',
  // Romania
  'Bucharest': 'Romania', 'Cluj-Napoca': 'Romania', 'Timisoara': 'Romania',
  // Greece
  'Athens': 'Greece', 'Thessaloniki': 'Greece', 'Patras': 'Greece', 'Heraklion': 'Greece',
  // Finland
  'Helsinki': 'Finland', 'Espoo': 'Finland', 'Tampere': 'Finland', 'Vantaa': 'Finland', 'Turku': 'Finland',
  // Norway
  'Oslo': 'Norway', 'Bergen': 'Norway', 'Trondheim': 'Norway', 'Stavanger': 'Norway',
  // Sweden
  'Stockholm': 'Sweden', 'Gothenburg': 'Sweden', 'Malmo': 'Sweden', 'Uppsala': 'Sweden',
  // Denmark
  'Copenhagen': 'Denmark', 'Aarhus': 'Denmark', 'Odense': 'Denmark',
  // Iceland
  'Reykjavik': 'Iceland',
  // Turkey
  'Istanbul': 'Turkey', 'Ankara': 'Turkey', 'Izmir': 'Turkey', 'Bursa': 'Turkey', 'Antalya': 'Turkey',
  // Egypt
  'Cairo': 'Egypt', 'Alexandria': 'Egypt', 'Giza': 'Egypt',
  // Saudi Arabia
  'Riyadh': 'Saudi Arabia', 'Jeddah': 'Saudi Arabia', 'Mecca': 'Saudi Arabia', 'Medina': 'Saudi Arabia',
  // UAE
  'Dubai': 'UAE', 'Abu Dhabi': 'UAE',
  // Ethiopia
  'Addis Ababa': 'Ethiopia', 'Dire Dawa': 'Ethiopia', 'Mekelle': 'Ethiopia',
  // Tanzania
  'Dar es Salaam': 'Tanzania', 'Mwanza': 'Tanzania', 'Arusha': 'Tanzania', 'Dodoma': 'Tanzania',
  // Kenya
  'Nairobi': 'Kenya', 'Mombasa': 'Kenya', 'Kisumu': 'Kenya',
  // Uganda
  'Kampala': 'Uganda', 'Gulu': 'Uganda',
  // Zambia
  'Lusaka': 'Zambia', 'Ndola': 'Zambia', 'Kitwe': 'Zambia',
  // DR Congo
  'Kinshasa': 'DR Congo', 'Lubumbashi': 'DR Congo', 'Kananga': 'DR Congo',
  // Papua New Guinea
  'Port Moresby': 'Papua New Guinea', 'Lae': 'Papua New Guinea', 'Mount Hagen': 'Papua New Guinea',
  // Peru
  'Lima': 'Peru', 'Arequipa': 'Peru', 'Cusco': 'Peru', 'Trujillo': 'Peru',
  // Bolivia
  'La Paz': 'Bolivia', 'Santa Cruz': 'Bolivia', 'Cochabamba': 'Bolivia',
  // Ecuador
  'Quito': 'Ecuador', 'Guayaquil': 'Ecuador',
  // Vanuatu
  'Port Vila': 'Vanuatu', 'Luganville': 'Vanuatu',
  // New Caledonia
  'Noumea': 'New Caledonia',
  // Fiji
  'Suva': 'Fiji', 'Lautoka': 'Fiji',
  // Samoa
  'Apia': 'Samoa',
  // Tonga
  'Nukualofa': 'Tonga',
  // Tuvalu
  'Funafuti': 'Tuvalu',
  // Nauru
  'Yaren': 'Nauru',
  // Micronesia
  'Palikir': 'Micronesia',
  // Hawaii
  'Honolulu': 'Hawaii', 'Hilo': 'Hawaii', 'Kailua-Kona': 'Hawaii',
};

// Read namebases-real.js
const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(namebasePath, 'utf-8');

// Parse the namebase
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

// Analyze each language
const results = {
  verified: [],
  suspicious: [],
  unknownRange: [],
  noGeographicData: [],
  primusOnly: []
};

for (const lang of languages) {
  // Check for Primus-only placeholders
  if (lang.subjects.length === 1 && (lang.subjects[0] === 'Primus' || lang.subjects[0].includes('Primus'))) {
    results.primusOnly.push(lang);
    continue;
  }

  const geographicData = languageGeographicRanges[lang.name];
  
  if (!geographicData) {
    results.noGeographicData.push(lang);
    continue;
  }

  // Check if subjects match expected geographic range
  const suspiciousSubjects = [];
  const verifiedSubjects = [];
  
  for (const subject of lang.subjects) {
    let matchesGeography = false;
    
    // First check well-known cities (direct lookup)
    if (wellKnownCities[subject]) {
      matchesGeography = geographicData.includes(wellKnownCities[subject]);
    } else {
      // Then check patterns
      for (const country of geographicData) {
        const patterns = countryPlacenamePatterns[country];
        if (patterns) {
          for (const pattern of patterns) {
            if (pattern.test(subject)) {
              matchesGeography = true;
              break;
            }
          }
        }
        if (matchesGeography) break;
      }
    }
    
    if (matchesGeography) {
      verifiedSubjects.push(subject);
    } else {
      suspiciousSubjects.push(subject);
    }
  }

  const suspiciousRatio = suspiciousSubjects.length / lang.subjects.length;
  
  if (suspiciousRatio > 0.5) {
    results.suspicious.push({
      name: lang.name,
      expectedRange: geographicData,
      suspiciousSubjects: suspiciousSubjects.slice(0, 10),
      suspiciousRatio: suspiciousRatio.toFixed(2)
    });
  } else if (suspiciousRatio > 0) {
    results.verified.push({
      name: lang.name,
      expectedRange: geographicData,
      suspiciousCount: suspiciousSubjects.length,
      totalSubjects: lang.subjects.length
    });
  } else {
    results.verified.push({
      name: lang.name,
      expectedRange: geographicData,
      suspiciousCount: 0,
      totalSubjects: lang.subjects.length
    });
  }
}

// Output Report
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║        LANGUAGE GEOGRAPHIC AUTHENTICITY VERIFICATION REPORT               ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`Total languages analyzed: ${languages.length}`);
console.log(`✅ Verified: ${results.verified.length}`);
console.log(`⚠️  Suspicious: ${results.suspicious.length}`);
console.log(`❓ No geographic data: ${results.noGeographicData.length}`);
console.log(`🔴 Primus-only: ${results.primusOnly.length}\n`);

if (results.primusOnly.length > 0) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  PRIMUS-ONLY LANGUAGES (Need authentic placenames)                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  
  results.primusOnly.forEach(lang => {
    console.log(`  - ${lang.name}`);
  });
  console.log(`\nTotal: ${results.primusOnly.length}\n`);
}

if (results.suspicious.length > 0) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  SUSPICIOUS LANGUAGES (Placenames don\'t match expected geography)             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  
  results.suspicious.forEach(lang => {
    console.log(`  ⚠️  ${lang.name}`);
    console.log(`     Expected range: ${lang.expectedRange.join(', ')}`);
    console.log(`     Suspicious subjects (showing up to 10): ${lang.suspiciousSubjects.join(', ')}`);
    console.log(`     Suspicious ratio: ${lang.suspiciousRatio}`);
    console.log('');
  });
  console.log(`Total: ${results.suspicious.length}\n`);
}

if (results.noGeographicData.length > 0) {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  LANGUAGES WITHOUT GEOGRAPHIC DATA (Need research)                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  
  results.noGeographicData.forEach(lang => {
    console.log(`  - ${lang.name} (${lang.subjects.length} subjects)`);
  });
  console.log(`\nTotal: ${results.noGeographicData.length}\n`);
}

// Summary
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║  RESEARCH TASKS                                                              ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

console.log('1. HIGH PRIORITY - Suspicious Languages:');
console.log('   These languages have >50% of placenames that don\'t match expected geography.');
console.log('   Research if language is real and if placenames need correction.\n');
results.suspicious.slice(0, 10).forEach(lang => {
  console.log(`   - ${lang.name}: Verify authenticity and check ${lang.suspiciousSubjects.slice(0, 3).join(', ')}...`);
});

console.log('\n2. MEDIUM PRIORITY - Primus-only Languages:');
console.log('   Replace Primus placeholders with authentic placenames from correct regions.\n');
results.primusOnly.slice(0, 10).forEach(lang => {
  console.log(`   - ${lang.name}: Add authentic placenames`);
});

console.log('\n3. LOW PRIORITY - Add Geographic Data:');
console.log('   Add expected geographic ranges for languages currently without data.\n');
results.noGeographicData.slice(0, 10).forEach(lang => {
  console.log(`   - ${lang.name}: Add geographic range information`);
});

console.log('\n' + '='.repeat(80));
console.log('NEXT STEPS');
console.log('='.repeat(80) + '\n');

console.log('1. Research suspicious languages on:');
console.log('   - Ethnologue: https://www.ethnologue.com/');
console.log('   - Glottolog: https://glottolog.org/');
console.log('   - Wikipedia: For geographic ranges and verification\n');

console.log('2. For Primus-only languages, find authentic placenames:');
console.log('   - Search Wikipedia for "List of cities/towns/villages in [region]"');
console.log('   - Use administrative divisions and major settlements\n');

console.log('3. Add geographic ranges for unknown languages:');
console.log('   - Use authoritative linguistic sources\n');

console.log('4. After corrections, re-run this script to verify improvements\n');

console.log('═══════════════════════════════════════════════════════════════════════════\n');
