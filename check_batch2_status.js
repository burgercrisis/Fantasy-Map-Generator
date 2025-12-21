const fs = require('fs');
const { execSync } = require('child_process');

const batch2Isos = [
  "-azd-dialect", "-en-scots", "-et-dialect", "-id-dialect", "-it-dialect",
  "-jv-dialect", "-la-dialect", "-ml-dialect", "-ms-dialect", "-my-dialect",
  "-pl-dialect", "-pt-dialect", "-sv-dialect", "-th-dialect", "-tr-dialect",
  "-uk-dialect", "-vi-dialect", "-zh-dialect", "aa", "aa-dialect", "ab",
  "ab-dialect", "ace", "ace-dialect", "ach"
];

console.log('Running diagnostics...');
const output = execSync('node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js', { encoding: 'utf8' });

const noUniqIsos = [];
const lines = output.split('\n');
lines.forEach(line => {
  if (line.includes('NO_UNIQ_BASE')) {
    const iso = line.split('|')[0].trim();
    noUniqIsos.push(iso);
  }
});

console.log(`Total NO_UNIQ_BASE: ${noUniqIsos.length}`);

const remainingBatch2 = batch2Isos.filter(iso => noUniqIsos.includes(iso));
console.log(`Remaining Batch 2 ISOs in NO_UNIQ_BASE: ${remainingBatch2.length}`);
if (remainingBatch2.length > 0) {
  console.log('Remaining:', remainingBatch2.join(', '));
}
