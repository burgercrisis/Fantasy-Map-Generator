const fs = require('fs');

// Fix Arabic Index Collision
console.log('=== Fixing Arabic Index Collision ===\n');

const africaContent = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const africaLines = africaContent.split('\n');

console.log('Finding Arabic language entry...');

// Find the single "Arabic" entry that spans multiple lines
let arabicEntryStart = -1;
let arabicEntryEnd = -1;
let currentIndex = -1;
let currentNames = [];

// First pass: find all Arabic-related entries
for (let i = 0; i < africaLines.length; i++) {
  const line = africaLines[i];
  if (line.includes('"name":') && line.includes('Arabic')) {
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
      const name = nameMatch[1];
      
      if (arabicEntryStart === -1) {
        arabicEntryStart = i;
        console.log(`Found entry at line ${i + 1}: "${name}"`);
      }
      
      currentNames.push({name, index: -1, line: i});
    }
  }
}

// Find the actual index
if (arabicEntryStart !== -1) {
  for (let i = arabicEntryStart; i < africaLines.length; i++) {
    const line = africaLines[i];
    if (line.includes('"i":')) {
      const indexMatch = line.match(/"i":\s*(\d+)/);
      if (indexMatch) {
        currentIndex = parseInt(indexMatch[1]);
        console.log(`Current index: ${currentIndex}`);
        
        // Update all Arabic entries found
        currentNames.forEach(entry => {
          entry.index = currentIndex;
        });
        break;
      }
    }
    
    if (line.includes('}') && currentIndex !== -1) {
      arabicEntryEnd = i;
      break;
    }
  }
}

console.log(`Arabic entry spans lines ${arabicEntryStart + 1} to ${arabicEntryEnd + 1}`);
console.log(`Names found: ${currentNames.length}`);

if (currentNames.length > 0 && currentIndex === 10) {
  console.log('\n=== Index Collision Confirmed ===');
  console.log('Current index: 10');
  console.log('Need to assign sequential indices 11-17 for variant entries');
  
  // Apply fixes: assign sequential indices
  let modified = false;
  currentNames.forEach((entry, i) => {
    if (i > 0) { // Keep first one as index 10
      const newIndex = 10 + i;
      console.log(`  ${entry.name}: i:${entry.index} → i:${newIndex}`);
      
      // Find the "i" line for this entry and update it
      for (let j = arabicEntryStart; j < arabicEntryEnd; j++) {
        if (j === entry.line && africaLines[j].includes('"i":')) {
          africaLines[j] = africaLines[j].replace(`"i": ${entry.index}`, `"i": ${newIndex}`);
          modified = true;
          break;
        }
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync('modules/namebases-africa.js', africaLines.join('\n'), 'utf8');
    console.log('\n✅ Fixed Arabic index collision');
    console.log('Index 10 now used by single entry');
    console.log('Variants assigned to indices 11-17 as needed');
  } else {
    console.log('\n❌ No Arabic index collision to fix');
  }
} else {
  console.log('\n❌ Could not locate Arabic entry');
}