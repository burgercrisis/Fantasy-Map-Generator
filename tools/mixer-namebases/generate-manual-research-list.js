#!/usr/bin/env node

/**
 * Manual Research List Generator
 * 
 * Creates a prioritized list of languages that ACTUALLY need verification,
 * filtering out languages with clearly legitimate placename patterns.
 */

const fs = require('fs');
const path = require('path');

// Legitimate placename patterns by region
// Languages matching these patterns are likely authentic and can be deprioritized
const legitimatePatterns = {
  'Germanic Europe': [/berg$/, /burg$/, /heim$/, /dorf$/, /hausen$/, /hausen$/, /ingen$/, /stadt$/, /tal$/, /wald$/, /feld$/, /bach$/, /bad$/, /au$/, /berg$/],
  'Celtic/English': [/bury$/, /ford$/, /ham$/, /ton$/, /wich$/, /wick$/, /bridge$/, /field$/, /pool$/, /mouth$/, /chester$/, /caster$/, /minster$/],
  'Romance (French)': [/ville$/, /sur/, /le$/, /aux$/, /ac$/, /y$/, /iers$/, /mont$/, /chateau$/, /la$/, /sur$/],
  'Romance (Italian)': [/ano$/, /eto$/, /ara$/, /li$/, /ca$/, /zo$/, /iano$/, /ello$/, /elle$/],
  'Romance (Spanish/Portuguese)': [/o$/, /a$/, /de$/, /la$/, /al$/, /ar$/, /illo$/, /eda$/, /eira$/, /al$/, /da$/],
  'Slavic': [/ow$/, /ovo$/, /ice$/, /any$/, /w$/, /ca$/, /ovo$/, /sk$/, /grad$/, /ovo$/],
  'Baltic/Finnic': [/ki$/, /la$/, /nen$/, /ja$/, /ka$/, /kala$/, /saari$/, /joki$/, /jarvi$/],
  'Nordic': [/stad$/, /by$/, /vik$/, /strand$/, /dal$/, /fjord$/, /vika$/, /berg$/, /hamn$/],
  'Greek/Cyrillic': [/polis$/, /ou$/, /os$/, /a$/, /i$/, /on$/, /ov$/, /ka$/],
  'East Asian (Chinese)': [/an$/, /zhou$/, /ning$/, /shan$/, /yang$/, /jiang$/, /ping$/, /qi$/],
  'East Asian (Japanese)': [/mura$/, /machi$/, /shita$/, /saka$/, /kawa$/, /yama$/, /zawa$/, /bashi$/, /cho$/],
  'East Asian (Korean)': [/ri$/, /san$/, /gun$/, /gu$/, /myeon$/, /eup$/, /si$/, /dong$/],
  'African (Nigerian)': [/ka$/, /na$/, /wa$/, /ro$/, /go$/, /pe$/, /bu$/, /yi$/, /lafi$/, /oro$/],
  'African (Swahili)': [/a$/, /i$/, /u$/, /o$/, /ea$/, /ko$/],
  'African (Berber)': [/gar$/, /ara$/, /ama$/, /la$/, /za$/, /ou$/, /at$/, /ghat$/],
  'Middle Eastern (Arabicic)': [/a$/, /i$/, /u$/, /ab$/, /ah$/, /ar$/, /al$/, /ba$/, /ra$/],
  'Middle Eastern (Turkic)': [/ya$/, /li$/, /an$/, /kaya$/, /tepe$/, /da$/, /ev$/, /kale$/],
  'Indian (Dravidian)': [/pur$/, /garh$/, /puram$/, /nagar$/, /halli$/, /guda$/, /pet$/, /varam$/, /konda$/, /leru$/],
  'Indian (Indo-Aryan)': [/pur$/, /garh$/, /nagar$/, /kot$/, /ganj$/, /bad$/, /shahr$/, /pur$/, /hara$/],
  'Mesoamerican (Aztec/Nahuatl)': [/co$/, /pan$/, /lan$/, /can$/, /tla$/, /petl$/, /yan$/, /capan$/, /calan$/, /tlan$/],
  'South American (Quechua/Aymara)': [/a$/, /o$/, /co$/, /la$/, /ra$/, /ro$/, /yo$/, /a$/, /a$/],
  'Oceanic': [/a$/, /i$/, /u$/, /le$/, /la$/, /to$/, /fo$/, /va$/, /ga$/],
};

// Suspicious indicators
const suspiciousIndicators = {
  // Single letters or very short names
  singleLetter: /^[A-Za-z]$/,
  // Common encoding/Mojibake patterns
  mojibake: /[^\x20-\x7E\u00A0-\u024F\u0370-\u03FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/,
  // Too generic
  tooGeneric: /^(Ha|He|Hi|Go|Gu|Ga|Ka|Ku|Ki|La|Lo|Ma|Me|Na|No|Pa|Po|Sa|So|Ta|To|Wa|Wo)$/,
  // Obvious fake-sounding
  obviouslyFake: /^(Big Flowery|Grass Koi|Grassfields Bantu|Fake|Test|Placeholder)$/,
  // Dedicated duplicates (likely spam/corruption)
  dedicatedDuplicates: /\(dedicated\)\s*\(\d+\)/,
  // Primus placeholder
  primus: /^Primus(,|$)/,
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
    const subjects = match[2].split(',').map(s => s.trim());
    languages.push({
      name: match[1],
      subjects: subjects,
      subjectCount: subjects.length
    });
  }
}

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║              MANUAL RESEARCH LIST GENERATOR                                 ║');
console.log('║        Languages That ACTUALLY Need Verification                          ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

const categories = {
  highPriority: [],    // Clear issues - fake, encoding, primus, obvious duplicates
  mediumPriority: [],  // Potential issues - generic names, questionable
  lowPriority: [],     // Minor issues - check authenticity but likely legit
  likelyLegitimate: [], // Has legitimate patterns, low priority review
};

for (const lang of languages) {
  const issues = [];
  const indicators = [];
  
  // Check each subject for suspicious indicators
  for (const subject of lang.subjects) {
    // Check single letter
    if (suspiciousIndicators.singleLetter.test(subject)) {
      indicators.push('single-letter');
      issues.push(`Single letter: "${subject}"`);
    }
    
    // Check encoding issues
    if (suspiciousIndicators.mojibake.test(subject)) {
      indicators.push('encoding-issue');
      issues.push(`Encoding issue: "${subject}"`);
    }
    
    // Check Primus
    if (suspiciousIndicators.primus.test(subject)) {
      indicators.push('primus');
      issues.push('Contains Primus placeholder');
    }
    
    // Check dedicated duplicates
    if (suspiciousIndicators.dedicatedDuplicates.test(subject)) {
      indicators.push('duplicate');
      issues.push(`Duplicate marker: "${subject}"`);
    }
  }
  
  // Check if name itself is suspicious
  if (suspiciousIndicators.obviouslyFake.test(lang.name)) {
    indicators.push('obviously-fake');
    issues.push(`Fake-sounding name: "${lang.name}"`);
  }
  
  // Check for "(dedicated)" suffix
  if (lang.name.includes('(dedicated)')) {
    const baseName = lang.name.replace(/\s*\(dedicated\).*$/, '');
    // Count how many duplicates
    const duplicateCount = lang.name.match(/\(dedicated\)\s*\(\d+\)/g);
    if (duplicateCount && duplicateCount.length > 5) {
      indicators.push('massive-duplicates');
      issues.push(`Massive duplicates: ${duplicateCount.length}+ variations`);
    }
  }
  
  // Check if has legitimate patterns
  let hasLegitimatePattern = false;
  for (const [region, patterns] of Object.entries(legitimatePatterns)) {
    for (const pattern of patterns) {
      for (const subject of lang.subjects.slice(0, 10)) {
        if (pattern.test(subject)) {
          hasLegitimatePattern = true;
          break;
        }
      }
      if (hasLegitimatePattern) break;
    }
    if (hasLegitimatePattern) break;
  }
  
  // Categorize
  const uniqueIndicators = [...new Set(indicators)];
  
  if (uniqueIndicators.includes('primus') || uniqueIndicators.includes('massive-duplicates') || uniqueIndicators.includes('obviously-fake')) {
    categories.highPriority.push({
      name: lang.name,
      subjectCount: lang.subjectCount,
      issues: issues.slice(0, 5),
      indicators: uniqueIndicators
    });
  } else if (uniqueIndicators.includes('encoding-issue') || uniqueIndicators.includes('duplicate')) {
    categories.mediumPriority.push({
      name: lang.name,
      subjectCount: lang.subjectCount,
      issues: issues.slice(0, 5),
      indicators: uniqueIndicators
    });
  } else if (uniqueIndicators.includes('single-letter')) {
    categories.lowPriority.push({
      name: lang.name,
      subjectCount: lang.subjectCount,
      issues: issues.slice(0, 5),
      indicators: uniqueIndicators
    });
  } else if (hasLegitimatePattern) {
    categories.likelyLegitimate.push({
      name: lang.name,
      subjectCount: lang.subjectCount,
      issues: issues.length > 0 ? issues.slice(0, 5) : ['Legitimate patterns detected'],
      indicators: uniqueIndicators.length > 0 ? uniqueIndicators : ['legitimate']
    });
  } else {
    // Unknown - need to check
    categories.mediumPriority.push({
      name: lang.name,
      subjectCount: lang.subjectCount,
      issues: ['Unknown pattern - needs manual review'],
      indicators: ['unknown']
    });
  }
}

console.log('🔴 HIGH PRIORITY - Clear Issues Requiring Immediate Action');
console.log('─'.repeat(80) + '\n');

if (categories.highPriority.length > 0) {
  categories.highPriority.forEach(lang => {
    console.log(`  ⚠️  ${lang.name} (${lang.subjectCount} subjects)`);
    console.log(`     Indicators: ${lang.indicators.join(', ')}`);
    console.log(`     Issues:`);
    lang.issues.forEach(issue => {
      console.log(`       - ${issue}`);
    });
    console.log('');
  });
  console.log(`Total: ${categories.highPriority.length} languages\n`);
} else {
  console.log('  ✅ No high-priority issues found!\n');
}

console.log('🟡 MEDIUM PRIORITY - Potential Issues');
console.log('─'.repeat(80) + '\n');

if (categories.mediumPriority.length > 0) {
  categories.mediumPriority.forEach(lang => {
    console.log(`  📋 ${lang.name} (${lang.subjectCount} subjects)`);
    console.log(`     Indicators: ${lang.indicators.join(', ')}`);
    console.log(`     Issues: ${lang.issues.slice(0, 3).join(', ')}`);
    console.log('');
  });
  console.log(`Total: ${categories.mediumPriority.length} languages\n`);
} else {
  console.log('  ✅ No medium-priority issues found!\n');
}

console.log('🟢 LIKELY LEGITIMATE - Low Priority Review');
console.log('─'.repeat(80) + '\n');

if (categories.likelyLegitimate.length > 0) {
  console.log(`  Found ${categories.likelyLegitimate.length} languages with legitimate placename patterns.`);
  console.log('  These have been filtered out of the research list.\n');
  
  // Show sample
  console.log('  Sample of legitimate languages:');
  categories.likelyLegitimate.slice(0, 20).forEach(lang => {
    console.log(`    ✅ ${lang.name} (${lang.subjectCount} subjects)`);
  });
  if (categories.likelyLegitimate.length > 20) {
    console.log(`    ... and ${categories.likelyLegitimate.length - 20} more`);
  }
  console.log('');
}

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                         RESEARCH SUMMARY                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Total languages analyzed: ${languages.length}`);
console.log(`🔴 High Priority (Immediate Action): ${categories.highPriority.length}`);
console.log(`🟡 Medium Priority (Review): ${categories.mediumPriority.length}`);
console.log(`🟢 Likely Legitimate (Filtered Out): ${categories.likelyLegitimate.length}`);
console.log('');

if (categories.highPriority.length > 0 || categories.mediumPriority.length > 0) {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('MANUAL RESEARCH CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
  
  console.log('HIGH PRIORITY ACTIONS:');
  console.log('─'.repeat(80));
  console.log('1. Primus Placeholders:');
  console.log('   - Replace with authentic placenames from correct geographic region');
  console.log('   - Use Wikipedia: "List of cities in [country/region]"');
  console.log('   - Cross-reference with ethnologue.org for language range\n');
  
  console.log('2. Massive Duplicates:');
  console.log('   - Delete redundant "(dedicated) (2)", "(dedicated) (3)" entries');
  console.log('   - Keep only one authentic entry per language');
  console.log('   - Verify the kept entry has proper placenames\n');
  
  console.log('3. Fake-sounding Languages:');
  console.log('   - Verify authenticity on Glottolog: https://glottolog.org/');
  console.log('   - Search Ethnologue: https://www.ethnologue.com/');
  console.log('   - If not found, mark for deletion\n');
  
  if (categories.mediumPriority.length > 0) {
    console.log('\nMEDIUM PRIORITY ACTIONS:');
    console.log('─'.repeat(80));
    console.log('1. Encoding Issues:');
    console.log('   - Fix UTF-8 Mojibake manually in namebases-real.js');
    console.log('   - Examples: "Cavineña" → "Cavineña", "Yuracaré" → "Yuracaré"');
    console.log('   - Use specialized UTF-8 repair tools if needed\n');
    
    console.log('2. Duplicate Markers:');
    console.log('   - Remove "(dedicated)" suffix from legitimate languages');
    console.log('   - Merge duplicate entries if they represent same language\n');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('VERIFICATION RESOURCES');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
  
  console.log('Language Databases:');
  console.log('  • Glottolog: https://glottolog.org/');
  console.log('  • Ethnologue: https://www.ethnologue.com/');
  console.log('  • ISO 639: https://www.sil.org/iso639-3/');
  console.log('  • Wikipedia: [Language] language\n');
  
  console.log('Geographic Data:');
  console.log('  • GeoNames: https://www.geonames.org/');
  console.log('  • OpenStreetMap: https://www.openstreetmap.org/');
  console.log('  • Wikipedia: "List of cities/towns in [country/region]"\n');
}

// Export research list to file
const outputPath = path.join(__dirname, 'manual-research-list.json');
const exportData = {
  generated: new Date().toISOString(),
  summary: {
    total: languages.length,
    highPriority: categories.highPriority.length,
    mediumPriority: categories.mediumPriority.length,
    likelyLegitimate: categories.likelyLegitimate.length
  },
  researchList: {
    highPriority: categories.highPriority.map(l => ({
      language: l.name,
      subjectCount: l.subjectCount,
      issues: l.issues,
      indicators: l.indicators,
      researchAction: getResearchAction(l.indicators)
    })),
    mediumPriority: categories.mediumPriority.map(l => ({
      language: l.name,
      subjectCount: l.subjectCount,
      issues: l.issues,
      indicators: l.indicators,
      researchAction: getResearchAction(l.indicators)
    }))
  },
  filteredOut: categories.likelyLegitimate.map(l => l.name)
};

fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
console.log(`\n📄 Research list exported to: ${outputPath}\n`);

function getResearchAction(indicators) {
  if (indicators.includes('primus')) {
    return 'Replace Primus with authentic placenames from geographic region';
  }
  if (indicators.includes('massive-duplicates')) {
    return 'Delete duplicate entries, verify authentic entry exists';
  }
  if (indicators.includes('obviously-fake')) {
    return 'Verify language exists on Glottolog/Ethnologue or delete';
  }
  if (indicators.includes('encoding-issue')) {
    return 'Fix UTF-8 Mojibake in language name or placenames';
  }
  if (indicators.includes('duplicate')) {
    return 'Remove duplicate markers, merge if needed';
  }
  if (indicators.includes('single-letter')) {
    return 'Verify if legitimate or delete placeholder';
  }
  return 'Manual verification required';
}
