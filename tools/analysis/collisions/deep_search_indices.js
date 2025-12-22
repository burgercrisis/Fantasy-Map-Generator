const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');

const searchTerms = [
  'i: 20911', 
  'i: 23510', 
  'i: 20583', 
  'i: 669', 
  'i: 670', 
  'i: 13969', 
  'i: 13974', 
  'i: 13917', 
  'i: 8617',
  'name: "Avar',
  'name: "Chechen',
  'name: "Bagvalal',
  'name: "Abkhaz',
  'name: "Adyghe'
];

searchTerms.forEach(term => {
  const lines = content.split('\n');
  const found = lines.filter(l => l.includes(term));
  if (found.length > 0) {
    console.log(`Found "${term}":`);
    found.forEach(l => console.log(`  ${l.trim()}`));
  } else {
    console.log(`"${term}" not found.`);
  }
});
