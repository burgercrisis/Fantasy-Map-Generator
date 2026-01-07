"use strict";

/**
 * Remaining Suspicious Entry Remover
 *
 * Removes any remaining suspicious entries with specific patterns.
 * Targets "Big Flowery" and "BPh" entries.
 *
 * Usage:
 *   node tools/utils/remove-remaining-suspicious.js
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

const suspiciousPatterns = ['Big Flowery', 'BPh'];

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
    const isSuspicious = suspiciousPatterns.some(p => entry.name.includes(p));
    if (isSuspicious) {
      console.log(`Removing from ${path.basename(filePath)}: ${entry.name}`);
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

console.log(`\n✓ Total: Removed ${totalRemoved} remaining suspicious entries across all namebase files\n`);
