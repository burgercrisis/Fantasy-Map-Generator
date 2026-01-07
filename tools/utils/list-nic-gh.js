"use strict";

const fs = require('fs');
const path = require('path');

const CONTINENT_FILES = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js',
  'namebases-creole.js'
];

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');

function parseContinentFile(filename) {
  const filepath = path.join(MODULES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return { filename, content: null, error: 'File not found' };
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  return { filename, content, error: null };
}

const entries = [];

for (const filename of CONTINENT_FILES) {
  const result = parseContinentFile(filename);
  if (result.error || !result.content) {
    continue;
  }

  const regex = /\{\s*"name":\s*"([^"]+)"[^}]*"d":\s*"[^"]*nic-GH[^"]*"[^}]*\}/g;
  let match;

  while ((match = regex.exec(result.content)) !== null) {
    entries.push({
      name: match[1],
      file: filename.replace('namebases-', '').replace('.js', '')
    });
  }
}

console.log(`Languages with d: "nic-GH" (${entries.length} total across ${CONTINENT_FILES.length} files):`);
console.log('========================================');

const cols = 4;
for (let i = 0; i < entries.length; i += cols) {
  const row = entries.slice(i, i + cols);
  console.log(row.map(e => `${e.name.padEnd(28)} [${e.file}]`).join(''));
}

console.log('\n\nFirst 50 entries:');
entries.slice(0, 50).forEach(e => {
  console.log(`  - ${e.name} (${e.file})`);
});
