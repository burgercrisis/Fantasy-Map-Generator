const fs = require('fs');

// Fix actual index collisions in high range
console.log('=== Fixing Actual Index Collisions ===\n');

const files = ['modules/namebases-unknown.js'];
let totalChanges = 0;

files.forEach(filePath => {
  console.log(`\n--- Processing ${filePath} ---`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  let changesThisFile = 0;
  
  // Find all entries with index collisions in the 966-9999 range
  const collidingIndices = new Map(); // index -> [{line, currentName, lineIndex}, ...]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"name":')) {
      const nameMatch = line.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        
        // Skip entries that were already cleaned up
        if (name.includes(' (variant)') || name.includes(' (dedicated)')) {
          continue;
        }
        
        // Find index for this entry
        for (let j = i; j < i + 20 && j < lines.length; j++) {
          if (lines[j].includes('"i":')) {
            const indexMatch = lines[j].match(/"i":\s*(\d+)/);
            if (indexMatch) {
              const index = parseInt(indexMatch[1]);
              
              if (index >= 966 && index <= 9999) {
                if (!collidingIndices.has(index)) {
                  collidingIndices.set(index, []);
                }
                collidingIndices.get(index).push({line: j, name, lineIndex: i});
              }
              break;
            }
          }
        }
      }
    }
  }
  
  console.log(`Found ${collidingIndices.size} colliding indices in 966-9999 range`);
  
  // Apply fixes: reassign colliding indices to available ones
  let nextAvailableIndex = 966;
  const appliedFixes = new Set();
  
  collidingIndices.forEach((entries, index) => {
    // Keep the first occurrence (lowest line index) with original index
    entries.sort((a, b) => a.line - b.line);
    const firstEntry = entries[0];
    const entryName = firstEntry.name;
    
    if (!appliedFixes.has(index)) {
      console.log(`\nIndex ${index} (${entries.length} languages):`);
      console.log(`  Keeping: ${entryName} at line ${firstEntry.line + 1}`);
      console.log(`  Renaming others to unique indices:`);
      
      entries.slice(1).forEach((entry, i) => {
        if (i === 0) return; // Skip first one
        
        const newIndex = nextAvailableIndex;
        console.log(`    ${entry.name}: ${index} → ${newIndex}`);
        
        // Find and update the index line for this entry
        for (let j = entry.lineIndex; j < entry.lineIndex + 10 && j < lines.length; j++) {
          if (lines[j].includes('"i":') && lines[j].includes(`${index}:`)) {
            lines[j] = lines[j].replace(`"i": ${index}:`, `"i": ${newIndex}:`);
            modified = true;
            changesThisFile++;
            appliedFixes.add(index);
            nextAvailableIndex++;
            break;
          }
        }
      });
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`\n✅ Modified: ${filePath}`);
    console.log(`  Index fixes applied: ${changesThisFile}`);
  } else {
    console.log(`  ✅ No index collisions to fix`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total index collision fixes: ${totalChanges}`);