"use strict";

const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');

console.log('\n=== ANALYSIS FROM LINE 425 ONWARDS ===\n');

const placeholders = [];
const legitimateVariants = [];
const needsExpansion = [];

for (let i = 424; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line.includes('{ name:')) continue;
  
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  const bMatch = line.match(/b:\s*"([^"]*)"/);
  
  if (!nameMatch || !bMatch) continue;
  
  const name = nameMatch[1];
  const bases = bMatch[1];
  const cities = bases.split(',');
  
  if (cities.length < 5) {
    needsExpansion.push({ line: i + 1, name, count: cities.length, bases: bases.substring(0, 60) });
  } else if (cities.length < 8 && (name.includes('French') || name.includes('Italian') || name.includes('Spanish') || name.includes('Portuguese'))) {
    legitimateVariants.push({ line: i + 1, name, count: cities.length });
  } else if (cities.length < 6) {
    placeholders.push({ line: i + 1, name, count: cities.length, bases: bases.substring(0, 60) });
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Needs expansion (< 5 cities): ${needsExpansion.length}`);
console.log(`Legitimate dialect variants (5-7 cities): ${legitimateVariants.length}`);
console.log(`Other placeholders (< 6 cities): ${placeholders.length}\n`);

if (needsExpansion.length > 0) {
  console.log('=== NEEDS EXPANSION (HIGH PRIORITY) ===');
  needsExpansion.slice(0, 30).forEach(p => {
    console.log(`  Line ${p.line}: ${p.name} (${p.count} cities) - ${p.bases}...`);
  });
}

if (placeholders.length > 0 && placeholders.length < 50) {
  console.log('\n=== OTHER PLACEHOLDERS ===');
  placeholders.slice(0, 30).forEach(p => {
    console.log(`  Line ${p.line}: ${p.name} (${p.count} cities) - ${p.bases}...`);
  });
}

console.log('\n=== SUMMARY ===');
console.log(`Total entries needing attention: ${needsExpansion.length + placeholders.length}`);
console.log('Action: Replace placeholders with authentic regional placenames\n');
