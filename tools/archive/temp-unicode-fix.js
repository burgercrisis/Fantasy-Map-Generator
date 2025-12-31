const fs = require('fs');

const data = fs.readFileSync('modules/namebases-real.js', 'utf8');
let lines = data.split('\n');

// Fix corrupted Unicode in name fields
const fixes = {
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

let fixed = 0;
lines = lines.map(line => {
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  if (nameMatch) {
    const name = nameMatch[1];
    for (const [corrupt, correct] of Object.entries(fixes)) {
      if (line.includes(corrupt)) {
        fixed++;
        return line.replace(corrupt, correct);
      }
    }
  }
  return line;
});

fs.writeFileSync('modules/namebases-real.js', lines.join('\n'), 'utf8');
console.log(`Fixed ${fixed} corrupted language names`);
