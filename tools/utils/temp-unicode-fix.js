"use strict";

/**
 * Unicode Corruption Fixer
 *
 * Fixes corrupted Unicode characters in namebase language names.
 * Replaces mojibake with correct UTF-8 characters.
 *
 * Usage:
 *   node tools/utils/temp-unicode-fix.js
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

const unicodeFixes = {
  'Angolar S├úo Tom├⌐': 'Angolar São Tomé',
  'Annobonese Pal├⌐': 'Annobonese Palé',
  'Forro S├úo Tom├⌐': 'Forro São Tomé',
  'Kwaza-Xoc├│ Amazonian': 'Kwaza-Xocó Amazonian',
  'Pur├⌐pecha': 'Purépecha',
  'Cast├║o': 'Castúo',
  'Guern├⌐siais': 'Guernésiais',
  'J├¿rriais': 'Jèrriais',
  'Tsiman├⌐': 'Tsimané',
  'Cavine├▒a': 'Cavineña',
  'Nivacl├⌐': 'Nivaclé'
};

let totalFixed = 0;

namebaseFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping: ${path.basename(filePath)} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(content.match(/window\.\w+NameBases = (\[[\s\S]*?\]);/)?.[1] || '[]');
  let fixed = 0;

  entries.forEach(entry => {
    if (entry.name && unicodeFixes[entry.name]) {
      const oldName = entry.name;
      entry.name = unicodeFixes[entry.name];
      fixed++;
      console.log(`Fixed in ${path.basename(filePath)}: "${oldName}" -> "${entry.name}"`);
    }
  });

  if (fixed > 0) {
    const objectName = content.match(/window\.(\w+NameBases)/)[1];
    const newContent = `"use strict";\n\nwindow.${objectName} = ${JSON.stringify(entries, null, 2)};\n`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed ${fixed} entries in ${path.basename(filePath)}`);
    totalFixed += fixed;
  }
});

console.log(`\n✓ Total: Fixed ${totalFixed} corrupted language names across all namebase files\n`);
