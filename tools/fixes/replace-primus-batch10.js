const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Fe-fe \(dedicated\)", i: 11180, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fe-fe (dedicated)", i: 11180, min: 4, max: 11, d: "lnrt", m: 0, b: "Mbouda,Bafoussam,Dschang,Bangangté,Bamenda,Kumba,Kribi,Ebolowa,Bafia,Nkongsamba,Kousseri,Foumban" },'
  },
  {
    pattern: /\{ name: "Fembe \(dedicated\)", i: 11181, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Fembe (dedicated)", i: 11181, min: 4, max: 11, d: "lnrt", m: 0, b: "Mendi,Mt Hagen,Kundiawa,Chuave,Gembi,Karimui,Gawinaka,Yulai,Paiela,Goroka,Kainantu,Henganofi" },'
  }
];

let count = 0;
replacements.forEach(repl => {
  const matches = content.match(repl.pattern);
  if (matches) {
    content = content.replace(repl.pattern, repl.replacement);
    count++;
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Replaced ${count} entries`);