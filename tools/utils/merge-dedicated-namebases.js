"use strict";

/**
 * Dedicated Namebase Merger
 * 
 * Merges "(dedicated)" suffix entries into their base entries across all continent files.
 * Combines unique city names and generates deletion/update lists.
 * 
 * Usage:
 *   node tools/utils/merge-dedicated-namebases.js
 * 
 * Output:
 *   - dedicated-indices-to-delete.json: Indices to remove (per continent)
 *   - dedicated-merge-updates.json: Merge details
 */

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js'
];

function readContinentFile(filename) {
  const filepath = path.join(__dirname, '..', 'modules', filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  
  const arrayMatch = content.match(/window\.\w+NameBases\s*=\s*\[([\s\S]*?)\];?\s*$/);
  if (!arrayMatch) {
    console.error(`Could not find namebase array in ${filename}`);
    return null;
  }

  return { filename, content, arrayContent: arrayMatch[1] };
}

function parseEntries(arrayContent) {
  const entries = [];
  const entryRegex = /\{\s*"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*(\d+),\s*"max":\s*(\d+),\s*"d":\s*"([^"]*)",\s*"m":\s*([^,]+),\s*"b":\s*"([^"]*)"\s*\}/g;
  
  let match;
  while ((match = entryRegex.exec(arrayContent)) !== null) {
    entries.push({
      name: match[1],
      i: parseInt(match[2]),
      min: parseInt(match[3]),
      max: parseInt(match[4]),
      d: match[5],
      m: parseFloat(match[6]),
      b: match[7]
    });
  }
  
  return entries;
}

function findBaseEntry(entries, baseName, excludeIndex) {
  return entries.find(e => e.name === baseName && e.i !== excludeIndex);
}

console.log('Scanning continent namebase files for "(dedicated)" entries...\n');

let allDedicated = [];
const toDelete = {};
const updates = [];

for (const filename of CONTINENT_FILES) {
  const result = readContinentFile(filename);
  if (!result) continue;

  const entries = parseEntries(result.arrayContent);
  const continent = filename.replace('namebases-', '').replace('.js', '');
  
  toDelete[continent] = [];
  
  const dedicatedEntries = entries.filter(e => e.name.includes('(dedicated)'));
  console.log(`${filename}: Found ${dedicatedEntries.length} dedicated entries`);
  
  for (const dedicated of dedicatedEntries) {
    const baseName = dedicated.name.replace(/\s*\(dedicated\)/, '');
    const baseEntry = findBaseEntry(entries, baseName, dedicated.i);
    
    if (!baseEntry) {
      console.log(`  WARNING: No base entry for "${dedicated.name}" (looking for "${baseName}")`);
      continue;
    }
    
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
      
      updates.push({
        continent,
        baseName,
        baseIndex: baseEntry.i,
        dedicatedName: dedicated.name,
        dedicatedIndex: dedicated.i,
        addedCities: addedCount,
        newB: mergedB
      });
      
      toDelete[continent].push(dedicated.i);
      
      console.log(`  Merging "${dedicated.name}" (i:${dedicated.i}) -> "${baseName}" (i:${baseEntry.i}): +${addedCount} cities`);
    }
  }
}

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total updates: ${updates.length}`);
console.log(`Total entries to delete: ${Object.values(toDelete).reduce((a, b) => a + b.length, 0)}`);

for (const [continent, indices] of Object.entries(toDelete)) {
  if (indices.length > 0) {
    console.log(`  ${continent}: ${indices.length} entries to delete`);
  }
}

// Save merge details
fs.writeFileSync(
  path.join(__dirname, 'dedicated-merge-updates.json'),
  JSON.stringify(updates, null, 2)
);
console.log(`\nMerge details saved to: dedicated-merge-updates.json`);

// Save delete indices per continent
fs.writeFileSync(
  path.join(__dirname, 'dedicated-indices-to-delete.json'),
  JSON.stringify(toDelete, null, 2)
);
console.log(`Delete indices saved to: dedicated-indices-to-delete.json`);

// Save detailed report
const report = {
  summary: {
    totalUpdates: updates.length,
    totalDeletions: Object.values(toDelete).reduce((a, b) => a + b.length, 0),
    byContinent: Object.fromEntries(
      Object.entries(toDelete).map(([k, v]) => [k, v.length])
    )
  },
  updates,
  toDelete
};

fs.writeFileSync(
  path.join(__dirname, 'dedicated-merge-report.json'),
  JSON.stringify(report, null, 2)
);
console.log(`Full report saved to: dedicated-merge-report.json`);
