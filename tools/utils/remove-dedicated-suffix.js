"use strict";

/**
 * Dedicated Suffix Remover
 *
 * Removes "(dedicated)" suffix from namebase entries.
 * Normalizes entry names by removing the dedicated marker.
 *
 * Usage:
 *   node tools/utils/remove-dedicated-suffix.js
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

let totalChanged = 0;

namebaseFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping: ${path.basename(filePath)} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(content.match(/window\.\w+NameBases = (\[[\s\S]*?\]);/)?.[1] || '[]');
  let changed = 0;

  entries.forEach(entry => {
    if (entry.name && entry.name.includes(' (dedicated)')) {
      entry.name = entry.name.replace(' (dedicated)', '');
      changed++;
      console.log(`Fixed in ${path.basename(filePath)}: ${entry.name}`);
    }
  });

  if (changed > 0) {
    const objectName = content.match(/window\.(\w+NameBases)/)[1];
    const newContent = `"use strict";\n\nwindow.${objectName} = ${JSON.stringify(entries, null, 2)};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Removed "(dedicated)" suffix from ${changed} entries in ${path.basename(filePath)}`);
    totalChanged += changed;
  }
});

console.log(`\n✓ Total: Removed "(dedicated)" suffix from ${totalChanged} entries across all namebase files\n`);
