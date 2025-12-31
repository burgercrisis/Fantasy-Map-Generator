"use strict";

const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'modules', 'namebases-real.js');

// Read the file
const content = fs.readFileSync(filepath, 'utf-8');

// Parse the namebases array
const namebasesMatch = content.match(/window\.realWorldNameBases\s*=\s*\[([\s\S]*?)\];/);
if (!namebasesMatch) {
  console.error('Could not find window.realWorldNameBases array');
  process.exit(1);
}

const arrayContent = namebasesMatch[1];

// Parse individual entries
const entries = [];
const entryRegex = /\{\s*name:\s*"([^"]+)",\s*i:\s*(\d+),\s*min:\s*(\d+),\s*max:\s*(\d+),\s*d:\s*"([^"]*)",\s*m:\s*([^,]+),\s*b:\s*"([^"]+)"\s*\}/g;

let match;
while ((match = entryRegex.exec(arrayContent)) !== null) {
  entries.push({
    name: match[1],
    i: parseInt(match[2]),
    min: parseInt(match[3]),
    max: parseInt(match[4]),
    d: match[5],
    m: match[6],
    b: match[7],
    fullMatch: match[0]
  });
}

// Find dedicated entries and their bases
const dedicatedEntries = entries.filter(e => e.name.includes('(dedicated)'));

console.log(`Found ${dedicatedEntries.length} dedicated entries\n`);

let mergeCount = 0;
const toDelete = [];
const updates = [];

for (const dedicated of dedicatedEntries) {
  const baseName = dedicated.name.replace(' (dedicated)', '');
  
  // Find the base entry
  const baseEntry = entries.find(e => e.name === baseName);
  
  if (!baseEntry) {
    console.log(`WARNING: No base entry found for "${dedicated.name}" (looking for "${baseName}")`);
    continue;
  }
  
  // Merge the 'b' values (unique cities)
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
    mergeCount++;
    const mergedB = Array.from(baseCities).join(',');
    
    updates.push({
      baseName: baseName,
      baseIndex: baseEntry.i,
      dedicatedName: dedicated.name,
      dedicatedIndex: dedicated.i,
      addedCities: addedCount,
      newB: mergedB
    });
    
    toDelete.push(dedicated.i);
    
    console.log(`\nMerging "${dedicated.name}" (i:${dedicated.i}) into "${baseName}" (i:${baseEntry.i})`);
    console.log(`  Added ${addedCount} unique cities`);
  }
}

console.log(`\n\nSummary:`);
console.log(`  Total merges: ${mergeCount}`);
console.log(`  Entries to delete: ${toDelete.length}`);

// Output merge details
if (updates.length > 0) {
  console.log(`\n\nMerge Details:`);
  for (const update of updates) {
    console.log(`\n${update.baseName} (i:${update.baseIndex}):`);
    console.log(`  Merged from: ${update.dedicatedName} (i:${update.dedicatedIndex})`);
    console.log(`  Added ${update.addedCities} cities`);
    console.log(`  New 'b' length: ${update.newB.length} characters`);
  }
}

// Save to delete list
fs.writeFileSync(path.join(__dirname, 'dedicated-indices-to-delete.json'), JSON.stringify(toDelete, null, 2));
console.log(`\n\nSaved indices to delete in: dedicated-indices-to-delete.json`);

// Save update details
fs.writeFileSync(path.join(__dirname, 'dedicated-merge-updates.json'), JSON.stringify(updates, null, 2));
console.log(`Saved merge updates in: dedicated-merge-updates.json`);
