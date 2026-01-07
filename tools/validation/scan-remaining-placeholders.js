"use strict";

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CONTINENT_FILES = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js',
  'modules/namebases-fantasy.js'
];

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

console.log('\n=== SCANNING ALL CONTINENT NAMEBASES FOR PLACEHOLDERS ===\n');

const allPlaceholders = [];

for (const file of CONTINENT_FILES) {
  const content = fs.readFileSync(file, 'utf-8');
  const context = { module: { exports: {} }, window: {} };
  vm.runInContext(content, context, { filename: file });

  const baseName = path.basename(file, '.js');
  const continent = baseName.replace('namebases-', '');

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
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
      allPlaceholders.push({
        file: baseName,
        line: i + 1,
        continent: continent,
        name: name,
        count: cities.length,
        baseSample: bases.substring(0, 50)
      });
    }
  }
}

console.log(`=== FOUND ${allPlaceholders.length} REMAINING PLACEHOLDERS ===\n`);

console.log('== BREAKDOWN BY CONTINENT ==');
const byContinent = {};
for (const p of allPlaceholders) {
  byContinent[p.continent] = (byContinent[p.continent] || 0) + 1;
}
for (const [continent, count] of Object.entries(byContinent)) {
  console.log(`  ${continent}: ${count}`);
}

console.log('\n== ALL PLACEHOLDERS ==\n');
allPlaceholders.forEach(p => {
  console.log(`[${p.continent}] Line ${p.line}: ${p.name} (${p.count} cities)`);
  console.log(`  ${p.baseSample}...`);
  console.log('');
});

console.log('=== SUMMARY ===\n');
console.log(`Total remaining placeholders: ${allPlaceholders.length}`);
console.log('By continent:');
for (const [continent, count] of Object.entries(byContinent)) {
  console.log(`  ${continent}: ${count}`);
}
