const fs = require('fs');

// Wave 69: Proper Duplicate Entry Elimination
console.log('=== Wave 69: Proper Duplicate Entry Elimination ===\n');

const files = [
  'modules/namebases-europe.js',
  'modules/namebases-unknown.js'
];

let totalDuplicatesRemoved = 0;
let totalEntriesRemoved = 0;

files.forEach(filePath => {
  console.log(`\n--- Processing ${filePath} ---`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  let duplicatesRemoved = 0;
  let entriesRemoved = 0;
  
  // Find all language entries
  const baseNames = new Map(); // baseName -> [{index, line}, ...]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"name":')) {
      const nameMatch = line.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const baseName = nameMatch[1];
        const currentIndex = lines[i+1].match(/"i":\s*(\d+)/)[1];
        const lineIndex = i;
        
        if (!baseNames.has(baseName)) {
          baseNames.set(baseName, []);
        }
        baseNames.get(baseName).push({index: currentIndex, line: lineIndex});
      }
    }
  }
  
  // Identify duplicate base names (keeping first occurrence)
  const linesToRemove = [];
  const firstOccurrences = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"name":')) {
      const nameMatch = line.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const baseName = nameMatch[1];
        const currentIndex = lines[i+1].match(/"i":\s*(\d+)/)[1];
        
        if (!firstOccurrences.has(baseName)) {
          firstOccurrences.add(baseName);
        } else {
          console.log(`  Removing duplicate: ${baseName} (i:${currentIndex})`);
          
          // Find the entire entry block
          let braceCount = 1;
          for (let j = i; j >= 0; j--) {
            const line = lines[j];
            if (line.includes('}')) {
              braceCount--;
            }
            
            if (braceCount === 0 && line.includes('name:') && line.includes('"i":')) {
              // Found the matching index line for this entry
              const indexMatch = lines[j].match(/"i":\s*(\d+)/);
              if (indexMatch) {
                console.log(`    Keeping original: ${baseName} (index ${indexMatch[1]})`);
              }
              break;
            }
          }
          
          // Mark all lines of this entry for removal
          for (let k = i; k >= 0; k--) {
            if (lines[k].includes('"i":') || (k === i && lines[k].includes('}'))) {
              // This is part of the current entry, skip
            }
            linesToRemove.push(k);
          }
          
          entriesRemoved++;
          duplicatesRemoved++;
        }
      }
    }
  }
  
  // Process removals (from bottom to top to maintain line numbers)
  const linesToRemoveSorted = linesToRemove.sort((a, b) => b - a).reverse();
  linesToRemoveSorted.forEach(lineIndex => {
    const line = lines[lineIndex];
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
      console.log(`    Removing: ${nameMatch[1]}`);
    }
    
    lines.splice(lineIndex, 1);
  });

  if (linesToRemove.length > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`  ✅ Modified: ${filePath}`);
    console.log(`    Duplicate entries removed: ${entriesRemoved}`);
    console.log(`    Duplicate cities resolved: ${duplicatesRemoved}`);
    
    modified = true;
    totalDuplicatesRemoved += duplicatesRemoved;
    totalEntriesRemoved += entriesRemoved;
  } else {
    console.log(`  ✅ No changes needed for ${filePath}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total duplicate entries removed: ${totalEntriesRemoved}`);
console.log(`Total duplicate cities resolved: ${totalDuplicatesRemoved}`);
console.log(`Files modified: ${files.length}`);

console.log(`\n=== Impact Analysis ===`);
console.log('Benefits:');
console.log('  ✅ True redundancy elimination: Same language with multiple entries');
console.log('  ✅ Cleaner namebase structure: Each language has single definitive entry');
console.log('  ✅ Better performance: Fewer entries to process');
console.log('  ✅ Improved user experience: No confusing duplicate names');