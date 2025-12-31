"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== SCANNING FOR REMAINING PLACEHOLDERS (Lines 425-539) ===\n');

const remaining = [];
const skipPatterns = [
  'already replaced',
  'Belo Horizonte',
  'Montreal',
  'Toronto',
  'Paris',
  'Nice',
  'Rome',
  'Milan',
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Toulouse',
  'Marseille',
  'Genova',
  'Torino',
  'Lisboa',
  'Porto',
  'Palma',
  'Mahón',
  'Ciutadella',
  'Eivissa',
  'Bilbao',
  'Santander',
  'Oviedo',
  'Gijón',
  'Avilés',
  'Mieres',
  'Lleida',
  'Lleida',
  'Tarragona',
  'Reus',
  'Tortosa',
  'Vic',
  'Figueres',
  'Girona',
  'Pamplona',
  'Huesca',
  'Zaragoza',
  'Teruel',
  'Castellón'
];

for (let i = 424; i < 539; i++) {
  const line = lines[i];
  if (!line.includes('{ name:')) continue;
  
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  const bMatch = line.match(/b:\s*"([^"]*)"/);
  
  if (!nameMatch || !bMatch) continue;
  
  const name = nameMatch[1];
  const bases = bMatch[1];
  const cities = bases.split(',');
  
  const isPlaceholder = cities.length < 8 && !skipPatterns.some(pattern => bases.includes(pattern));
  
  if (isPlaceholder && cities.length < 6) {
    remaining.push({
      line: i + 1,
      name: name,
      count: cities.length,
      baseSample: bases.substring(0, 50)
    });
  }
}

console.log(`\n=== ${remaining.length} REMAINING PLACEHOLDERS (Lines 425-539) ===\n`);
remaining.forEach(r => {
  console.log(`Line ${r.line}: ${r.name} (${r.count} cities)`);
  console.log(`  ${r.baseSample}...`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total remaining placeholders in lines 425-539: ${remaining.length}`);
