"use strict";

const fs = require('fs');

const namebasesData = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = namebasesData.split('\n');

console.log('\n=== COMPREHENSIVE ANALYSIS ===\n');

let totalCount = 0;
let smallBases = [];
let encodingIssues = [];
let suspicious = [];
let emptyBases = [];

lines.forEach((line, idx) => {
  if (!line.includes('{ name:')) return;
  totalCount++;

  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  const indexMatch = line.match(/i:\s*(\d+)/);
  const bMatch = line.match(/b:\s*"([^"]*)"/);

  if (!nameMatch || !bMatch) return;

  const name = nameMatch[1];
  const bases = bMatch[1];

  if (!bases || bases.trim() === '') {
    emptyBases.push({ line: idx + 1, name });
    return;
  }

  const cities = bases.split(',');
  
  if (cities.length < 3) {
    smallBases.push({ line: idx + 1, name, count: cities.length, cities: bases.substring(0, 50) });
  }

  const nameLower = name.toLowerCase();
  if (name.includes('') || name.includes('') || name.includes('') ||
      name.includes('') || name.includes('') || name.includes('') ||
      name.includes('') || name.match(/[^\x00-\x7F]/)) {
    encodingIssues.push({ line: idx + 1, name });
  }

  if (nameLower.includes('riangular') || nameLower.includes('bph') || 
      nameLower.includes('big flowery') || nameLower.match(/^[a-z]{3}$/)) {
    suspicious.push({ line: idx + 1, name });
  }
});

console.log(`Total entries: ${totalCount}`);
console.log(`Small bases (<3 cities): ${smallBases.length}`);
console.log(`Encoding issues: ${encodingIssues.length}`);
console.log(`Suspicious names: ${suspicious.length}`);
console.log(`Empty bases: ${emptyBases.length}\n`);

if (suspicious.length > 0) {
  console.log('=== SUSPICIOUS ENTRIES ===');
  suspicious.forEach(s => console.log(`  Line ${s.line}: ${s.name}`));
}

if (encodingIssues.length > 0 && encodingIssues.length < 50) {
  console.log('\n=== ENCODING ISSUES ===');
  encodingIssues.slice(0, 20).forEach(e => console.log(`  Line ${e.line}: ${e.name}`));
}

if (smallBases.length > 0 && smallBases.length < 50) {
  console.log('\n=== SMALL BASES (need expansion) ===');
  smallBases.slice(0, 20).forEach(s => console.log(`  Line ${s.line}: ${s.name} (${s.count} cities)`));
}
