const fs = require('fs');

const dataContent = fs.readFileSync('docs/plans/namebase-research/data.json', 'utf8');
const data = JSON.parse(dataContent);

function findEntry(index) {
  return data.find(e => e.i === index);
}

const entries = [
  { name: 'Batu', i: 20520 },
  { name: 'Balo', i: 20503 },
  { name: 'Bangi', i: 20323 },
  { name: 'Bina', i: 200010 },
  { name: 'Tshiluba', i: 5383 }
];

entries.forEach(e => {
  const entry = findEntry(e.i);
  if (entry) {
    console.log(`\n=== ${e.name} (i=${e.i}) ===`);
    console.log(`Status: ${entry.status}`);
    console.log(`Seed Count: ${entry.seedCount}`);
    console.log(`bField length: ${entry.bField.length}`);
    const names = entry.bField.split(',').map(n => n.trim()).filter(n => n.length > 0);
    console.log(`Names from data.json (${names.length}):`);
    names.forEach((n, i) => console.log(`${i+1}. ${n}`));
  } else {
    console.log(`\n=== ${e.name} (i=${e.i}) === NOT FOUND`);
  }
});