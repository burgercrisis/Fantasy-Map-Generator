const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /\{ name: "Bmr \(dedicated\)", i: 10531, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" \},/,
    replacement: '{ name: "Bmr (dedicated)", i: 10531, min: 4, max: 11, d: "lnrt", m: 0, b: "Banjarmantan,Banjarmasin,Amuntai,Kandangan,Barabai,Rantau,Martapura,Kuala Kapuas,Sampit,Pangkalan Bun,Sintang,Palangkaraya" },'
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