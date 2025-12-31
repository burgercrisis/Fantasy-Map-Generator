"use strict";

const fs = require('fs');
const fileContent = fs.readFileSync('modules/namebases-real.js', 'utf8');

const lines = fileContent.split('\n');
const entries = [];
let lineNum = 0;

for (let line of lines) {
  lineNum++;
  if (!line.includes('{ name:')) continue;
  entries.push({ lineNum, content: line });
}

console.log(`\n=== NAMEBASES FILE ANALYSIS ===\n`);
console.log(`Total lines: ${lines.length}`);
console.log(`Total entries: ${entries.length}\n`);

const stats = {
  totalEntries: entries.length,
  smallBases: [],
  encodingIssues: [],
  suspicious: [],
  emptyBases: [],
  shortBases: []
};

entries.forEach(e => {
  const nameMatch = e.content.match(/name:\s*"([^"]+)"/);
  const bMatch = e.content.match(/b:\s*"([^"]*)"/);
  
  if (!nameMatch || !bMatch) return;
  
  const name = nameMatch[1];
  const bases = bMatch[1];
  
  if (!bases || bases.trim() === '') {
    stats.emptyBases.push({ line: e.lineNum, name });
    return;
  }
  
  const cities = bases.split(',');
  if (cities.length < 5) {
    stats.smallBases.push({ line: e.lineNum, name, count: cities.length });
  }
  
  if (cities.length < 3) {
    stats.shortBases.push({ line: e.lineNum, name, count: cities.length });
  }
  
  const hasEncodingIssues = name.match(/[^\x00-\x7F]/) ||
                         name.includes('') ||
                         name.includes('') ||
                         name.includes('') ||
                         name.includes('') ||
                         name.includes('');
  if (hasEncodingIssues) {
    stats.encodingIssues.push({ line: e.lineNum, name });
  }
  
  const nameLower = name.toLowerCase();
  if (nameLower.includes('riangular') ||
      nameLower.includes('bph') ||
      nameLower.includes('big flowery') ||
      nameLower.match(/^[a-z]{3}$/)) {
    stats.suspicious.push({ line: e.lineNum, name });
  }
});

console.log(`Small bases (<5 cities): ${stats.smallBases.length}`);
console.log(`Short bases (<3 cities): ${stats.shortBases.length}`);
console.log(`Encoding issues: ${stats.encodingIssues.length}`);
console.log(`Suspicious names: ${stats.suspicious.length}`);
console.log(`Empty bases: ${stats.emptyBases.length}\n`);

if (stats.shortBases.length > 0) {
  console.log('=== SHORT BASES (need expansion) ===');
  stats.shortBases.slice(0, 20).forEach(s => {
    console.log(`  Line ${s.line}: ${s.name} (${s.count} cities)`);
  });
}

if (stats.suspicious.length > 0) {
  console.log('\n=== SUSPICIOUS NAMES ===');
  stats.suspicious.forEach(s => {
    console.log(`  Line ${s.line}: ${s.name}`);
  });
}

if (stats.encodingIssues.length > 0 && stats.encodingIssues.length < 30) {
  console.log('\n=== ENCODING ISSUES ===');
  stats.encodingIssues.slice(0, 15).forEach(s => {
    console.log(`  Line ${s.line}: ${s.name}`);
  });
}

console.log('\n=== ANALYSIS COMPLETE ===');
