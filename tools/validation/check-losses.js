"use strict";

/**
 * Data Quality Issues Checker
 * 
 * Performs comprehensive data quality analysis:
 * - Identifies small bases (< 5 cities)
 * - Detects potential encoding issues
 * - Flags suspicious names (abbreviations, placeholders)
 * - Finds empty or invalid bases
 * 
 * Usage:
 *   node tools/validation/check-losses.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'modules/namebases-africa.js',
  'modules/namebases-asia.js',
  'modules/namebases-europe.js',
  'modules/namebases-northAmerica.js',
  'modules/namebases-southAmerica.js',
  'modules/namebases-oceania.js'
];

const namebases = [];

continentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const window = {};
    eval(content);
    const arrayName = Object.keys(window).find(k => k.endsWith('NameBases'));
    if (arrayName && Array.isArray(window[arrayName])) {
      namebases.push(...window[arrayName]);
    }
  }
});

console.log('\n=== SMALL BASES (< 5 cities) ===\n');
const smallBases = namebases.filter(nb => {
  if (!nb.b) return true;
  const cities = nb.b.split(',');
  return cities.length < 5;
});

console.log(`Found ${smallBases.length} languages with < 5 cities:\n`);
smallBases.slice(0, 30).forEach(nb => {
  const cities = nb.b ? nb.b.split(',') : [];
  console.log(`- ${nb.name} (${cities.length} cities): ${nb.b ? nb.b.substring(0, 60) + '...' : '(empty)'}`);
});

console.log('\n=== POTENTIAL ENCODING ISSUES ===\n');
const encodingIssues = namebases.filter(nb => {
  return nb.name.includes('') ||
         nb.name.includes('') ||
         nb.name.includes('') ||
         nb.name.match(/[^\x00-\x7F]/g);
});

console.log(`Found ${encodingIssues.length} potential encoding issues:\n`);
encodingIssues.slice(0, 20).forEach(nb => {
  console.log(`- ${nb.name}`);
});

console.log('\n=== SUSPICIOUS NAMES ===\n');
const suspicious = namebases.filter(nb => {
  const nameLower = nb.name.toLowerCase();
  return nameLower.includes('riangular') ||
         nameLower.includes('bph') ||
         nameLower.includes('big flowery') ||
         nameLower.match(/^[a-z]{3}$/) ||
         nameLower.includes('abbr') ||
         nameLower.includes('placeholder');
});

console.log(`Found ${suspicious.length} suspicious names:\n`);
suspicious.forEach(nb => {
  console.log(`- ${nb.name} (index ${nb.i})`);
});

console.log('\n=== EMPTY OR INVALID BASES ===\n');
const invalidBases = namebases.filter(nb => {
  if (!nb.b || nb.b.trim() === '') return true;
  const cities = nb.b.split(',');
  return cities.some(c => !c || c.trim() === '');
});

console.log(`Found ${invalidBases.length} languages with empty/invalid bases:\n`);
invalidBases.slice(0, 20).forEach(nb => {
  console.log(`- ${nb.name}: ${nb.b ? nb.b.substring(0, 60) : '(empty)'}`);
});
