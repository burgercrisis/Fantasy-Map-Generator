const fs = require('fs');

// Read the file
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');

// Extract the namebases array
const match = content.match(/window\.realWorldNameBases\s*=\s*\[([\s\S]*?)\s*\];/);
if (!match) {
  console.error('Could not find namebases array');
  process.exit(1);
}

let namebases = JSON.parse('[' + match[1] + ']');

console.log(`Loaded ${namebases.length} namebase entries`);

// Track changes
const stats = {
  duplicateNamesMerged: [],
  trailingSpacesFixed: [],
  encodingFixed: [],
  geographicTermsRemoved: [],
  lowCountEntries: [],
  totalEntries: namebases.length,
  finalEntries: 0
};

// Common mangled UTF-8 patterns to fix
const encodingFixes = [
  { pattern: /â\"œâŒ/g, replacement: 'ã' },
  { pattern: /â\"œÃº/g, replacement: 'ão' },
  { pattern: /â\"œâ\"/g, replacement: 'ô' },
  { pattern: /â\"œ¬/g, replacement: 'ê' },
  { pattern: /â\"œÃ­/g, replacement: 'í' },
  { pattern: /â\"œ­/g, replacement: 'í' },
  { pattern: /â\"œÃ¯/g, replacement: 'ã¯' },
  { pattern: /Ã©/g, replacement: 'é' },
  { pattern: /Ã¨/g, replacement: 'è' },
  { pattern: /Ã­/g, replacement: 'í' },
  { pattern: /Ã¯/g, replacement: 'ï' },
  { pattern: /Ã³/g, replacement: 'ó' },
  { pattern: /Ãº/g, replacement: 'ú' },
  { pattern: /Ã¡/g, replacement: 'á' },
  { pattern: /Ã§/g, replacement: 'ç' },
  { pattern: /Â¡/g, replacement: 'á' },
  { pattern: /Âª/g, replacement: 'ã' },
  { pattern: /Â·/g, replacement: '·' }
];

// Geographic terms to remove
const geographicTerms = ['City', 'River', 'Port', 'Lake', 'Bay', 'Island', 'Islands', 'Porto', 'Ponta'];

// Remove trailing spaces from names
namebases.forEach(nb => {
  if (nb.name && nb.name !== nb.name.trim()) {
    const oldName = nb.name;
    nb.name = nb.name.trim();
    stats.trailingSpacesFixed.push(`"${oldName}" -> "${nb.name}"`);
  }
});

// Detect and merge duplicates by name field
const nameMap = new Map();
namebases.forEach(nb => {
  if (!nameMap.has(nb.name)) {
    nameMap.set(nb.name, []);
  }
  nameMap.get(nb.name).push(nb);
});

// Merge duplicates
const mergedBases = [];
nameMap.forEach((entries, name) => {
  if (entries.length === 1) {
    mergedBases.push(entries[0]);
    return;
  }

  // Merge - combine all unique names from "b" fields
  const uniqueNames = new Set();
  entries.forEach(entry => {
    if (entry.b) {
      entry.b.split(',').forEach(n => uniqueNames.add(n.trim()));
    }
  });

  // Keep the first entry and update its "b" field
  const merged = { ...entries[0] };
  merged.b = Array.from(uniqueNames).join(',');
  
  const oldSizes = entries.map(e => (e.b ? e.b.split(',').length : 0));
  const oldCount = oldSizes.reduce((a, b) => a + b, 0);
  const newCount = uniqueNames.size;
  
  stats.duplicateNamesMerged.push({
    name: name,
    count: entries.length,
    oldNames: oldSizes.join(','),
    newNames: newCount
  });
  
  mergedBases.push(merged);
});

// Fix encoding issues and geographic terms
mergedBases.forEach(nb => {
  // Fix name field encoding
  if (nb.name) {
    let fixedName = nb.name;
    encodingFixes.forEach(fix => {
      fixedName = fixedName.replace(fix.pattern, fix.replacement);
    });
    if (fixedName !== nb.name) {
      stats.encodingFixed.push(`"${nb.name}" -> "${fixedName}"`);
      nb.name = fixedName;
    }
  }

  // Fix b field encoding
  if (nb.b) {
    let fixedB = nb.b;
    encodingFixes.forEach(fix => {
      fixedB = fixedB.replace(fix.pattern, fix.replacement);
    });
    if (fixedB !== nb.b) {
      stats.encodingFixed.push(`b field in "${nb.name}"`);
      nb.b = fixedB;
    }

    // Remove geographic terms from b field
    const names = nb.b.split(',').map(n => n.trim());
    const filteredNames = names.filter(name => {
      const upperName = name.toUpperCase();
      return !geographicTerms.some(term => 
        upperName === term.toUpperCase() || 
        upperName.endsWith(term.toUpperCase()) ||
        upperName.startsWith(term.toUpperCase())
      );
    });

    if (filteredNames.length !== names.length) {
      const removed = names.filter(n => !filteredNames.includes(n));
      stats.geographicTermsRemoved.push(`"${nb.name}": removed ${removed.join(', ')}`);
      nb.b = filteredNames.join(',');
    }

    // Count names
    const nameCount = filteredNames.length;
    if (nameCount < 20) {
      stats.lowCountEntries.push({
        name: nb.name,
        count: nameCount,
        i: nb.i
      });
    }
  }
});

// Renumber i values sequentially
mergedBases.forEach((nb, index) => {
  nb.i = index;
});

// Generate output
const outputContent = `"use strict";

window.realWorldNameBases = ${JSON.stringify(mergedBases, null, 2)};

// Export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = window.realWorldNameBases;
}
`;

// Write the fixed file
fs.writeFileSync(filePath, outputContent, 'utf8');

stats.finalEntries = mergedBases.length;

// Print statistics
console.log('\n=== STATISTICS ===');
console.log(`Original entries: ${stats.totalEntries}`);
console.log(`Final entries: ${stats.finalEntries}`);
console.log(`Entries removed: ${stats.totalEntries - stats.finalEntries}`);
console.log(`\nTrailing spaces fixed: ${stats.trailingSpacesFixed.length}`);
console.log(`Encoding fixes applied: ${stats.encodingFixed.length}`);
console.log(`Geographic terms removed: ${stats.geographicTermsRemoved.length}`);
console.log(`Duplicates merged: ${stats.duplicateNamesMerged.length}`);
console.log(`Entries with <20 names: ${stats.lowCountEntries.length}`);

if (stats.duplicateNamesMerged.length > 0) {
  console.log('\n=== DUPLICATES MERGED ===');
  stats.duplicateNamesMerged.forEach(dup => {
    console.log(`"${dup.name}": ${dup.count} entries merged`);
  });
}

if (stats.lowCountEntries.length > 0) {
  console.log('\n=== ENTRIES WITH <20 NAMES ===');
  stats.lowCountEntries.forEach(entry => {
    console.log(`"${entry.name}" (i:${entry.i}): ${entry.count} names`);
  });
}

if (stats.encodingFixed.length > 0 && stats.encodingFixed.length <= 20) {
  console.log('\n=== ENCODING FIXES ===');
  stats.encodingFixed.forEach(fix => console.log(fix));
}

if (stats.geographicTermsRemoved.length > 0 && stats.geographicTermsRemoved.length <= 20) {
  console.log('\n=== GEOGRAPHIC TERMS REMOVED ===');
  stats.geographicTermsRemoved.forEach(rem => console.log(rem));
}

console.log('\n✓ File updated successfully!');
