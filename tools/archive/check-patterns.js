const fs = require('fs');

const data = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = data.split('\n');

const timePeriods = ['Old', 'Middle', 'Modern', 'Ancient', 'Classical', 'Proto', 'Late', 'Early', 'Medieval', 'Early Modern'];
const directions = ['North', 'South', 'East', 'West', 'Upper', 'Lower', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
const geographic = ['Island', 'Mountain', 'Highland', 'Lowland', 'Valley', 'River', 'Coastal', 'Peninsula', 'Basin', 'Plateau'];
const generic = ['Global', 'Standard', 'Native', 'Traditional', 'International', 'Common', 'General', 'Universal', 'Regional'];

let results = {};

lines.forEach((line, i) => {
  const nameMatch = line.match(/name: "([^"]+)"/);
  if (nameMatch) {
    const name = nameMatch[1];

    timePeriods.forEach(p => {
      if (name.match(p)) {
        results[p] = (results[p] || []).concat([i+1]);
      }
    });

    directions.forEach(d => {
      if (name.match(d)) {
        results[d] = (results[d] || []).concat([i+1]);
      }
    });

    geographic.forEach(g => {
      if (name.match(g)) {
        results[g] = (results[g] || []).concat([i+1]);
      }
    });

    generic.forEach(g => {
      if (name.match(g)) {
        results[g] = (results[g] || []).concat([i+1]);
      }
    });

    const emptyParens = name.match(/\(\s*\)$/);
    if (emptyParens && name.match(/\([^)]+\)/)) {
      if (emptyParens[1].trim().length < 2) {
        results['Empty parens'] = (results['Empty parens'] || []).concat([i+1]);
      }
    }
  }
});

Object.entries(results).forEach(([type, lineNumbers]) => {
  if (lineNumbers.length > 0 && lineNumbers.length < 50) {
    console.log(`${type} (${lineNumbers.length}): Lines ${lineNumbers.slice(0, 10).join(', ')}`);
  }
});
