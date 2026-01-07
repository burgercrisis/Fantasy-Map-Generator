"use strict";

/**
 * Dedicated Namebase Final Merger
 * 
 * Merges "(dedicated)" suffix entries into their base entries across all continent files.
 * Creates backups before modifying, merges city lists, and generates reports.
 * 
 * Usage:
 *   node tools/utils/merge-dedicated-final.js
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
  if (!fs.existsSync(filepath)) {
    return null;
  }
  
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
  const entryRegex = /\{"name":\s*"([^"]+)",\s*"i":\s*(\d+),\s*"min":\s*(\d+),\s*"max":\s*(\d+),\s*"d":\s*"([^"]*)",\s*"m":\s*([^,]+),\s*"b":\s*"([^"]*)"\s*\}/g;
  
  let match;
  while ((match = entryRegex.exec(arrayContent)) !== null) {
    entries.push({
      name: match[1],
      i: parseInt(match[2]),
      min: parseInt(match[3]),
      max: parseInt(match[4]),
      d: match[5],
      m: parseFloat(match[6]),
      b: match[7],
      fullMatch: match[0]
    });
  }
  
  return entries;
}

function findBaseEntry(entries, baseName, excludeIndex) {
  return entries.find(e => e.name === baseName && e.i !== excludeIndex);
}

function rebuildArray(entries) {
  return '\n' + entries.map(e => {
    return `  {\n    "name": "${e.name}",\n    "i": ${e.i},\n    "min": ${e.min},\n    "max": ${e.max},\n    "d": "${e.d}",\n    "m": ${e.m},\n    "b": "${e.b}"\n  }`;
  }).join(',\n') + '\n';
}

function processContinentFile(filename) {
  const filepath = path.join(__dirname, '..', 'modules', filename);
  const continent = filename.replace('namebases-', '').replace('.js', '');
  
  const result = readContinentFile(filename);
  if (!result) return null;

  const entries = parseEntries(result.arrayContent);
  const dedicatedEntries = entries.filter(e => e.name.includes('(dedicated)'));
  
  console.log(`\n${filename}: ${entries.length} entries, ${dedicatedEntries.length} dedicated`);
  
  const changes = [];
  const entriesToDelete = new Set();
  const entriesToRename = [];

  for (const dedicated of dedicatedEntries) {
    const baseName = dedicated.name.replace(/\s*\(dedicated\)/, '');
    const baseEntry = findBaseEntry(entries, baseName, dedicated.i);
    
    if (baseEntry) {
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
          continent,
          baseName,
          baseIndex: baseEntry.i,
          dedicatedName: dedicated.name,
          dedicatedIndex: dedicated.i,
          addedCities: addedCities.length
        });
        
        entriesToDelete.add(dedicated);
        baseEntry.b = mergedB;
      } else {
        entriesToDelete.add(dedicated);
        changes.push({
          type: 'delete',
          continent,
          dedicatedName: dedicated.name,
          dedicatedIndex: dedicated.i,
          reason: 'No unique cities to add'
        });
      }
    } else {
      entriesToRename.push(dedicated);
      changes.push({
        type: 'rename',
        continent,
        oldName: dedicated.name,
        newName: baseName,
        index: dedicated.i
      });
    }
  }

  // Apply deletions
  const remainingEntries = entries.filter(e => !entriesToDelete.has(e));
  
  // Apply renames
  for (const entry of entriesToRename) {
    entry.name = entry.name.replace(/\s*\(dedicated\)/, '');
  }
  
  // Rebuild array with updated entries
  const finalEntries = remainingEntries.concat(entriesToRename);
  finalEntries.sort((a, b) => a.i - b.i);
  
  const newArrayContent = rebuildArray(finalEntries);
  
  // Determine array variable name
  const arrayName = filename.replace('namebases-', '').replace('.js', '');
  const varName = arrayName.charAt(0).toUpperCase() + arrayName.slice(1) + 'NameBases';
  
  const newContent = `window.${varName} = [${newArrayContent}];\n`;
  
  // Create backup
  const backupFile = path.join(__dirname, '..', 'modules', `${filename}.backup-${Date.now()}`);
  fs.writeFileSync(backupFile, result.content);
  
  // Write updated content
  fs.writeFileSync(filepath, newContent);
  
  console.log(`  Backup: ${path.basename(backupFile)}`);
  console.log(`  Changes: ${changes.length} (${changes.filter(c => c.type === 'merge').length} merges, ${changes.filter(c => c.type === 'delete').length} deletes, ${changes.filter(c => c.type === 'rename').length} renames)`);
  
  return {
    filename,
    continent,
    totalEntries: finalEntries.length,
    changes
  };
}

console.log('=== Dedicated Namebase Final Merger ===\n');
console.log('Creating backups and processing continent files...\n');

const results = [];
for (const filename of CONTINENT_FILES) {
  const result = processContinentFile(filename);
  if (result) {
    results.push(result);
  }
}

// Generate summary
const allChanges = results.flatMap(r => r.changes);
const merges = allChanges.filter(c => c.type === 'merge');
const deletes = allChanges.filter(c => c.type === 'delete');
const renames = allChanges.filter(c => c.type === 'rename');

console.log(`\n\n=== OVERALL SUMMARY ===`);
console.log(`Renames: ${renames.length}`);
console.log(`Merges: ${merges.length}`);
console.log(`Deletes: ${deletes.length}`);
console.log(`Total changes: ${allChanges.length}`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  filesProcessed: results.length,
  summary: {
    renames: renames.length,
    merges: merges.length,
    deletes: deletes.length,
    total: allChanges.length
  },
  byContinent: results.map(r => ({
    continent: r.continent,
    changes: r.changes.length,
    finalEntries: r.totalEntries
  })),
  changes: allChanges
};

fs.writeFileSync(
  path.join(__dirname, 'dedicated-merge-final-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(`\nDetailed report saved to: dedicated-merge-final-report.json`);
console.log(`\nFirst 10 changes:`);
for (let i = 0; i < Math.min(10, allChanges.length); i++) {
  const c = allChanges[i];
  if (c.type === 'rename') {
    console.log(`  [${c.continent}] rename: ${c.oldName} -> ${c.newName}`);
  } else if (c.type === 'merge') {
    console.log(`  [${c.continent}] merge: ${c.dedicatedName} -> ${c.baseName} (+${c.addedCities} cities)`);
  } else {
    console.log(`  [${c.continent}] delete: ${c.dedicatedName}`);
  }
}
