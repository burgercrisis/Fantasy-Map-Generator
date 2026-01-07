"use strict";

/**
 * Fake Entry Remover
 *
 * Removes entries with trailing spaces or fake names from continent namebase files.
 * Targets specific patterns like "Big Flowery ", "BPh ", and "Riangular".
 *
 * Usage:
 *   node tools/utils/remove-fake-entries.js
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

const fakePatterns = [
  { pattern: 'Big Flowery ', reason: 'fake language with trailing space' },
  { pattern: 'BPh ', reason: 'abbreviation with trailing space' },
  { pattern: 'Riangular', reason: 'fake name pattern' }
];

let totalRemoved = 0;

namebaseFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping: ${path.basename(filePath)} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(content.match(/window\.\w+NameBases = (\[[\s\S]*?\]);/)?.[1] || '[]');
  const originalCount = entries.length;

  const filtered = entries.filter(entry => {
    const isFake = fakePatterns.some(p => entry.name.includes(p.pattern));
    if (isFake) {
      const reason = fakePatterns.find(p => entry.name.includes(p.pattern)).reason;
      console.log(`Removing from ${path.basename(filePath)}: ${entry.name} (${reason})`);
    }
    return !isFake;
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

console.log(`\n✓ Total: Removed ${totalRemoved} fake entries across all namebase files\n`);
