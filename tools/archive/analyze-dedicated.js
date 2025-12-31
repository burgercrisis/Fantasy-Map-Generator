"use strict";

const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'modules', 'namebases-real.js');

// Read file
const content = fs.readFileSync(filepath, 'utf-8');

// Parse the entire content as an array of entries
const entryRegex = /\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+),\s*min:\s*(\d+),\s*max:\s*(\d+),\s*d:\s*"([^"]*)",\s*m:\s*([^,]+),\s*b:\s*"([^"]+)"\s*\}/g;

const entries = [];
const lines = content.split('\n');
let currentLine = 0;

// Find all entry objects with their original positions
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{ name:')) {
    const match = line.match(/\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+),\s*min:\s*(\d+),\s*max:\s*(\d+),\s*d:\s*"([^"]*)",\s*m:\s*([^,]+),\s*b:\s*"([^"]+)"\s*\}/);
    if (match) {
      entries.push({
        name: match[1],
        i: parseInt(match[2]),
        min: parseInt(match[3]),
        max: parseInt(match[4]),
        d: match[5],
        m: match[6].trim(),
        b: match[7],
        lineNumber: i + 1,  // 1-indexed
        fullLine: line
      });
    }
  }
}

console.log(`Found ${entries.length} total entries\n`);

// Find dedicated entries
const dedicatedEntries = entries.filter(e => e.name.includes('(dedicated)'));
console.log(`Found ${dedicatedEntries.length} dedicated entries\n`);

const changes = [];
const deletedIndices = new Set();

// Process each dedicated entry
for (const dedicated of dedicatedEntries) {
  const baseName = dedicated.name.replace(/\s*\(dedicated\)/, '');
  
  // Find base entry (same name, without "dedicated")
  const baseEntry = entries.find(e => e.name === baseName);
  
  if (baseEntry) {
    // Base exists - need to merge
    const baseCities = new Set(baseEntry.b.split(','));
    const dedicatedCities = dedicated.b.split(',');
    let addedCount = 0;
    
    for (const city of dedicatedCities) {
      if (!baseCities.has(city)) {
        baseCities.add(city);
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      const mergedB = Array.from(baseCities).join(',');
      changes.push({
        type: 'merge',
        baseName: baseName,
        baseIndex: baseEntry.i,
        baseLineNumber: baseEntry.lineNumber,
        dedicatedName: dedicated.name,
        dedicatedIndex: dedicated.i,
        dedicatedLineNumber: dedicated.lineNumber,
        addedCities: addedCount,
        newB: mergedB
      });
      deletedIndices.add(dedicated.i);
    }
  } else {
    // No base entry - need to rename by removing "(dedicated)"
    changes.push({
      type: 'rename',
      oldName: dedicated.name,
      newName: baseName,
      index: dedicated.i,
      lineNumber: dedicated.lineNumber
    });
  }
}

console.log(`Summary:`);
console.log(`  Renames: ${changes.filter(c => c.type === 'rename').length}`);
console.log(`  Merges: ${changes.filter(c => c.type === 'merge').length}`);
console.log(`  Deletions: ${deletedIndices.size}`);

// Output changes
console.log(`\n\n=== CHANGES TO MAKE ===\n`);

for (const change of changes) {
  if (change.type === 'rename') {
    console.log(`Line ${change.lineNumber}: Rename "${change.oldName}" -> "${change.newName}"`);
    console.log(`  OLD: ${change.oldName}"`);
    console.log(`  NEW: "${change.newName}"`);
  } else if (change.type === 'merge') {
    console.log(`\nMERGE: ${change.dedicatedName} (i:${change.dedicatedIndex}) -> ${change.baseName} (i:${change.baseIndex})`);
    console.log(`  Dedicated line: ${change.dedicatedLineNumber}`);
    console.log(`  Base line: ${change.baseLineNumber}`);
    console.log(`  Added ${change.addedCities} unique cities`);
    console.log(`  DELETE dedicated entry at line ${change.dedicatedLineNumber}`);
  }
}

// Generate JavaScript for the changes
let jsChanges = '';
for (const change of changes) {
  if (change.type === 'rename') {
    const oldLine = lines[change.lineNumber - 1];
    const newLine = oldLine.replace(`name: "${change.oldName}"`, `name: "${change.newName}"`);
    jsChanges += `// Line ${change.lineNumber}: Rename ${change.oldName} -> ${change.newName}\n`;
    jsChanges += `OLD: ${oldLine}\n`;
    jsChanges += `NEW: ${newLine}\n\n`;
  }
}

// Save changes to files
fs.writeFileSync(path.join(__dirname, 'dedicated-changes.json'), JSON.stringify(changes, null, 2));
console.log(`\n\nSaved changes to: dedicated-changes.json`);

fs.writeFileSync(path.join(__dirname, 'dedicated-changes.js'), jsChanges);
console.log(`Saved JS changes to: dedicated-changes.js`);

fs.writeFileSync(path.join(__dirname, 'dedicated-indices-to-delete.json'), JSON.stringify([...deletedIndices], null, 2));
console.log(`Saved indices to delete to: dedicated-indices-to-delete.json`);
