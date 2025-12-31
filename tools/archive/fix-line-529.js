"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING LINE 529: Aranese ===\n');

const line529 = lines[528];
console.log('Current line 529:');
console.log(line529.substring(0, 150));

const oldBase = "aranesea,araneseb,aranesec,aranesed,aranesee,aranesef,araneseg,araneseh,aranesei,aranesej,aranesek,araneseel";
const newBase = "Vielha,Les,Bausèr,Naut Aran,Salardú,Arties,Bagergue,Sent Julian,Naut Aran,Canejan";

if (line529.includes(oldBase)) {
  const newLine = line529.replace(oldBase, newBase);
  lines[528] = newLine;
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('\n✓ FIXED Line 529: Aranese');
  console.log('  New cities:', newBase);
} else {
  console.log('\n✗ Base pattern not found - checking content');
  console.log('Looking for: ' + oldBase.substring(0, 30) + '...');
}
