"use strict";

const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'modules', 'namebases-real.js');
const backupFile = path.join(__dirname, 'modules', `namebases-real.js.backup-${Date.now()}`);

console.log('Reading file...');
const content = fs.readFileSync(filepath, 'utf-8');

// Backup
fs.writeFileSync(backupFile, content);
console.log(`Backup created: ${backupFile}`);

// Split into lines
const lines = content.split('\n');

// Process each line to find and merge dedicated entries
const entries = [];
let i = 0;
const entryRegex = /^\s*\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+),\s*min:\s*(\d+),\s*max:\s*(\d+),\s*d:\s*"([^"]*)",\s*m:\s*([^,]+),\s*b:\s*"([^"]+)"\s*\},?/;

// Parse entries
for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  const match = line.match(entryRegex);
  if (match) {
    entries.push({
      lineNumber: lineNum,
      name: match[1],
      i: parseInt(match[2]),
      min: parseInt(match[3]),
      max: parseInt(match[4]),
      d: match[5],
      m: match[6].trim(),
      b: match[7],
      originalLine: line
    });
  }
}

console.log(`Parsed ${entries.length} entries`);

// Find dedicated entries
const dedicatedEntries = entries.filter(e => e.name.includes('(dedicated)'));
console.log(`Found ${dedicatedEntries.length} dedicated entries`);

const changes = [];
const entriesToDelete = new Set();
const entriesToRename = [];

for (const dedicated of dedicatedEntries) {
  const baseName = dedicated.name.replace(/\s*\(dedicated\)/, '');
  
  // Find base entry (same name without "dedicated")
  const baseEntry = entries.find(e => e.name === baseName && e.i !== dedicated.i);
  
  if (baseEntry) {
    // Merge: add dedicated cities to base, delete dedicated
    const baseCities = new Set(baseEntry.b.split(','));
    const dedicatedCities = dedicated.b.split(',');
    let addedCities = [];
    
    for (const city of dedicatedCities) {
      if (!baseCities.has(city)) {
        baseCities.add(city);
        addedCities.push(city);
      }
    }
    
    if (addedCities.length > 0) {
      const mergedB = Array.from(baseCities).join(',');
      changes.push({
        type: 'merge',
        baseName,
        baseIndex: baseEntry.i,
        baseLineNumber: baseEntry.lineNumber,
        dedicatedName: dedicated.name,
        dedicatedIndex: dedicated.i,
        dedicatedLineNumber: dedicated.lineNumber,
        addedCities: addedCities.length,
        newB: mergedB
      });
      
      entriesToDelete.add(dedicated.lineNumber);
      
      // Update base entry in memory
      baseEntry.b = mergedB;
    } else {
      // No new cities to add, just delete dedicated
      entriesToDelete.add(dedicated.lineNumber);
      changes.push({
        type: 'delete',
        dedicatedName: dedicated.name,
        dedicatedIndex: dedicated.i,
        reason: 'No unique cities to add'
      });
    }
  } else {
    // No base: rename by removing "(dedicated)"
    entriesToRename.push({
      lineNumber: dedicated.lineNumber,
      oldName: dedicated.name,
      newName: baseName,
      index: dedicated.i
    });
    changes.push({
      type: 'rename',
      oldName: dedicated.name,
      newName: baseName,
      index: dedicated.i,
      lineNumber: dedicated.lineNumber
    });
  }
}

// Apply changes
console.log(`\nApplying ${changes.length} changes...`);

// Delete dedicated entries (must delete in reverse order to maintain line numbers)
const sortedToDelete = Array.from(entriesToDelete).sort((a, b) => b - a);
for (const lineNum of sortedToDelete) {
  lines[lineNum] = '';
}

// Rename entries
for (const rename of entriesToRename) {
  lines[rename.lineNumber] = lines[rename.lineNumber].replace(
    `name: "${rename.oldName}"`,
    `name: "${rename.newName}"`
  );
}

// Remove deleted lines and clean up
const finalLines = lines.filter(line => line.trim() !== '' && !line.match(/^\s*}$/));

// Write back to file
const newContent = finalLines.join('\n');
fs.writeFileSync(filepath, newContent);
console.log(`\nFile updated successfully!`);
console.log(`Backup: ${backupFile}`);

// Report
console.log(`\n\n=== SUMMARY ===`);
console.log(`Renames: ${entriesToRename.length}`);
console.log(`Merges: ${changes.filter(c => c.type === 'merge').length}`);
console.log(`Deletes: ${sortedToDelete.length}`);
console.log(`Total changes: ${changes.length}`);

// Save detailed report
fs.writeFileSync(
  path.join(__dirname, 'dedicated-merge-report.json'),
  JSON.stringify(changes, null, 2)
);
console.log(`\nDetailed report saved to: dedicated-merge-report.json`);

console.log(`\nFirst 10 changes:`);
for (let i = 0; i < Math.min(10, changes.length); i++) {
  const c = changes[i];
  if (c.type === 'rename') {
    console.log(`  ${c.type}: ${c.oldName} -> ${c.newName}`);
  } else if (c.type === 'merge') {
    console.log(`  ${c.type}: ${c.dedicatedName} -> ${c.baseName} (+${c.addedCities} cities)`);
  } else {
    console.log(`  ${c.type}: ${c.dedicatedName}`);
  }
}
