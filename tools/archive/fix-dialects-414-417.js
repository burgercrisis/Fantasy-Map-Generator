"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING REMAINING DIALECTS (Lines 414+) ===\n');

const fixes = [
  { line: 414, name: "Bajhangi Doteli", newBase: "Bajhangi,Chainpur,Jaya Prithvi,Talkot,Surma,Byang,Varanasi,Patna,Muzaffarpur" },
  { line: 415, name: "Darchuleli Doteli", newBase: "Darchula,Khalanga,Naugad,Malikarjun,Byas,Duhun,Shankarpur,Marma,Lekam,Api" },
  { line: 416, name: "Bajureli Doteli", newBase: "Bajura,Martadi,Gadhimalika,Triveni,Badimalika,Budhinanda,Himali,SwamiKartik,Jagannath" },
  { line: 417, name: "Dadeldhuri Doteli", newBase: "Dadeldhura,Amargadhi,Parashuram,Alital,Nawadurga,Ajaimaru,Ganeshpur,Bhagwati,Shikharpur" }
];

let fixed = 0;

fixes.forEach(fix => {
  const lineNum = fix.line - 1;
  if (lineNum >= 0 && lineNum < lines.length) {
    const oldLine = lines[lineNum];
    const bMatch = oldLine.match(/b:\s*"([^"]*)"/);
    if (bMatch) {
      const oldBase = bMatch[1];
      const cities = oldBase.split(',');
      if (cities.length < 5) {
        const newLine = oldLine.replace(oldBase, fix.newBase);
        if (newLine !== oldLine) {
          lines[lineNum] = newLine;
          console.log(`✓ Line ${fix.line}: ${fix.name}`);
          console.log(`  ${fix.newBase.substring(0, 60)}...`);
          fixed++;
        }
      }
    }
  }
});

if (fixed > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${fixed} dialects with authentic cities\n`);
} else {
  console.log('\nNo changes made\n');
}
