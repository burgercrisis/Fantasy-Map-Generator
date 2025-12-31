"use strict";

const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');

console.log('\n=== SEARCHING FOR ISSUES ===\n');

let hasBigFlowery = false;
let hasBPh = false;

lines.forEach((line, idx) => {
  if (line.includes('Flowery')) {
    hasBigFlowery = true;
    console.log(`Line ${idx + 1}: ${line.substring(0, 80)}`);
  }
  if (line.includes('name: "BPh') || line.includes('name: "Bph')) {
    hasBPh = true;
    console.log(`Line ${idx + 1}: ${line.substring(0, 80)}`);
  }
});

console.log('\n=== RESULTS ===\n');
console.log(`Has Big Flowery: ${hasBigFlowery}`);
console.log(`Has BPh: ${hasBPh}`);

const entries = lines.filter(l => l.includes('{ name:'));
console.log(`\nTotal entries: ${entries.length}`);

const primusCount = content.match(/Primus/g);
console.log(`Primus placeholders: ${primusCount ? primusCount.length : 0}`);
