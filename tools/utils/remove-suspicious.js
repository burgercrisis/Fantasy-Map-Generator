"use strict";

/**
 * Suspicious Entry Remover
 *
 * Removes entries with fake or suspicious language names from continent namebase files.
 * Checks against a predefined list of known fake entries.
 *
 * Usage:
 *   node tools/utils/remove-suspicious.js
 */

const fs = require('fs');
const path = require('path');

const namebaseFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

const suspiciousEntries = [
  { name: 'Bum', reason: 'fake language' },
  { name: 'Ita', reason: 'fake abbreviation' },
  { name: 'Big Flowery', reason: 'fake language' },
  { name: 'BPh', reason: 'abbreviation' }
];

let totalRemoved = 0;

namebaseFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping: ${filePath} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(content.match(/window\.\w+NameBases = (\[[\s\S]*?\]);/)?.[1] || '[]');
  const originalCount = entries.length;

  const filtered = entries.filter(entry => {
    const isSuspicious = suspiciousEntries.some(s => entry.name === s.name);
    if (isSuspicious) {
      const reason = suspiciousEntries.find(s => entry.name === s.name).reason;
      console.log(`Removing from ${path.basename(filePath)}: ${entry.name} (${reason})`);
    }
    return !isSuspicious;
  });

  const removed = originalCount - filtered.length;
  if (removed > 0) {
    const objectName = content.match(/window\.(\w+NameBases)/)[1];
    const newContent = `"use strict";\n\nwindow.${objectName} = ${JSON.stringify(filtered, null, 2)};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Removed ${removed} entries from ${path.basename(filePath)}`);
    totalRemoved += removed;
  }
});

console.log(`\n✓ Total: Removed ${totalRemoved} suspicious entries across all namebase files\n`);
