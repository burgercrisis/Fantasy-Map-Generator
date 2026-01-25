const fs = require('fs');

// Arabic Language Index Consolidation
console.log('=== Arabic Language Index Consolidation ===\n');

const africaContent = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const africaLines = africaContent.split('\n');

console.log('Processing Arabic variants in Africa file...');

// Find Arabic language entries
const arabicEntries = [];
for (let i = 0; i < africaLines.length; i++) {
  const line = africaLines[i];
  if (line.includes('"name":') && line.includes('Arabic')) {
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
      const name = nameMatch[1];
      
      // Find the index and city line
      let indexLine = -1;
      let cityLine = -1;
      
      for (let j = i; j < i + 10 && j < africaLines.length; j++) {
        if (africaLines[j].includes('"i":')) {
          indexLine = j;
        }
        if (indexLine !== -1 && africaLines[j].includes('"b":')) {
          cityLine = j;
        }
      }
      
      if (indexLine !== -1 && cityLine !== -1) {
        const indexMatch = africaLines[indexLine].match(/"i":\s*(\d+)/);
        if (indexMatch) {
          const currentIndex = parseInt(indexMatch[1]);
          const cityMatch = africaLines[cityLine].match(/"b":\s*"([^"]+)"/);
          const cityCount = cityMatch ? cityMatch[1].split(',').length : 0;
          
          arabicEntries.push({
            name,
            currentIndex,
            indexLine,
            cityLine,
            cityCount,
            fullEntry: africaLines.slice(i, Math.min(i + 12, africaLines.length))
          });
          break;
        }
      }
    }
  }
}

console.log(`Found ${arabicEntries.length} Arabic language entries`);

// Display current state
arabicEntries.forEach((entry, i) => {
  console.log(`\n${i + 1}. ${entry.name} (i:${entry.currentIndex})`);
  console.log(`   Cities: ${entry.cityCount}`);
  if (entry.fullEntry && entry.fullEntry.length > 0) {
    const entryText = entry.fullEntry.join('\n');
    const nameMatches = entryText.match(/"name":\s*"([^"]+)"/g);
    const indexMatches = entryText.match(/"i":\s*(\d+)/g);
    
    if (nameMatches.length > 1) {
      console.log(`   ⚠️  Multiple name entries found: ${nameMatches.map(m => m[1]).join(', ')}`);
    }
    if (indexMatches.length > 1) {
      console.log(`   ⚠️  Multiple index entries found: ${indexMatches.map(m => m[1]).join(', ')}`);
    }
  }
});

console.log('\n=== Proposed Consolidation ===');
console.log('Option 1: Rename variants to show their relationship:');
console.log('- Andalusi Arabic → Andalusi Arabic (Historical)');
console.log('- Ancient Egyptian → Ancient Egyptian (Classical)');
console.log('- Ancient North Arabian → Ancient North Arabian (Historical)');
console.log('- Bimbashi Arabic → Bimbashi Arabic (Sudanese)');
console.log('- Bongor Arabic → Bongor Arabic (Chadian Arabic)');
console.log('- Maridi Arabic → Maridi Arabic (South Sudanese)');
console.log('- Turku Arabic → Turku Arabic (Sudanese)');
console.log('- Juba Arabic → Juba Arabic (South Sudanese)');

console.log('\nBenefits:');
console.log('✅ Clear linguistic relationships');
console.log('✅ Descriptive naming');
console.log('✅ Each gets unique index');
console.log('✅ Maintains all existing city data');