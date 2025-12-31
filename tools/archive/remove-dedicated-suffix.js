"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
let changed = 0;

content = content.replace(/name:\s*"([^"]+)\s*\(dedicated\)"/g, (match, name) => {
  changed++;
  return `name: "${name}"`;
});

if (changed > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✓ Removed "(dedicated)" suffix from ${changed} entries\n`);
} else {
  console.log('\nNo "(dedicated)" suffixes found to remove\n');
}
