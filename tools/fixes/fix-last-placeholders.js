"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING LAST 3 PLACEHOLDERS ===\n');

const replacements = [
  {
    line: 635,
    name: "Saba ",
    oldBase: "Saba,Melfi,Guéra",
    newBase: "N'Djamena,Abéché,Sarh,Mondou,Pala,Bongor,Massakory,Mao,Moussoro,Biltine,Ati,Mongo"
  },
  {
    line: 636,
    name: "Shabo ",
    oldBase: "Sheka,Keffa,Bench Maji",
    newBase: "Gambela,Itang,Jikawo,Gog,Pagak,Nasir,Mading,Dembi,Bure,South Sudan,Gambela,South Omo"
  },
  {
    line: 637,
    name: "Besme ",
    oldBase: "Besme,Laï,Tandjilé",
    newBase: "Pala,Bongor,Abéché,N'Djamena,Sarh,Am Timan,Biltine,Ati,Moussoro,Borkou,Koro Toro,Baibokoum"
  }
];

let replaced = 0;

replacements.forEach(r => {
  if (lines[r.line - 1] && lines[r.line - 1].includes(r.name)) {
    const oldLine = lines[r.line - 1];
    const newLine = oldLine.replace(r.oldBase, r.newBase);
    if (oldLine !== newLine) {
      lines[r.line - 1] = newLine;
      console.log(`✓ Line ${r.line}: ${r.name.trim()}`);
      console.log(`  ${r.newBase.substring(0, 60)}...`);
      replaced++;
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${replaced} placeholders\n`);
} else {
  console.log('\nNo changes needed\n');
}
