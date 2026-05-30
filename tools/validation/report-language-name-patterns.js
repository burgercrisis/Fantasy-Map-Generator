"use strict";

/**
 * Pattern Detection Scanner
 *
 * Scans namebase entries for common formatting patterns and potential issues.
 * Identifies time periods, directional indicators, geographic terms, and generic modifiers.
 *
 * Usage:
 *   node tools/validation/check-patterns.js
 */

const fs = require('fs');
const path = require('path');

const continentFiles = [
  'namebases-africa.js',
  'namebases-asia.js',
  'namebases-europe.js',
  'namebases-northAmerica.js',
  'namebases-southAmerica.js',
  'namebases-oceania.js',
  'namebases-fantasy.js'
];

const modulesPath = path.join(__dirname, '..', '..', 'modules');

function parseJSArray(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) return [];
  const jsStr = content.slice(start, end + 1);
  try {
    return new Function(`return ${jsStr}`)();
  } catch (e) {
    return [];
  }
}

const timePeriods = ['Old', 'Middle', 'Modern', 'Ancient', 'Classical', 'Proto', 'Late', 'Early', 'Medieval', 'Early Modern'];
const directions = ['North', 'South', 'East', 'West', 'Upper', 'Lower', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
const geographic = ['Island', 'Mountain', 'Highland', 'Lowland', 'Valley', 'River', 'Coastal', 'Peninsula', 'Basin', 'Plateau'];
const generic = ['Global', 'Standard', 'Native', 'Traditional', 'International', 'Common', 'General', 'Universal', 'Regional'];

let results = {};

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = parseJSArray(content);

    entries.forEach(entry => {
      if (!entry || !entry.name) return;
      const name = entry.name;

      timePeriods.forEach(p => {
        if (name.match(p)) {
          results[p] = (results[p] || []).concat([{ file, name }]);
        }
      });

      directions.forEach(d => {
        if (name.match(d)) {
          results[d] = (results[d] || []).concat([{ file, name }]);
        }
      });

      geographic.forEach(g => {
        if (name.match(g)) {
          results[g] = (results[g] || []).concat([{ file, name }]);
        }
      });

      generic.forEach(g => {
        if (name.match(g)) {
          results[g] = (results[g] || []).concat([{ file, name }]);
        }
      });

      const emptyParens = name.match(/\(\s*\)$/);
      if (emptyParens && name.match(/\([^)]+\)/)) {
        if (emptyParens[1].trim().length < 2) {
          results['Empty parens'] = (results['Empty parens'] || []).concat([{ file, name }]);
        }
      }
    });
  }
});

console.log('Pattern detection results (limited occurrences):\n');
Object.entries(results).forEach(([type, entries]) => {
  if (entries.length > 0 && entries.length < 50) {
    console.log(`${type} (${entries.length}):`);
    entries.slice(0, 5).forEach(e => {
      console.log(`  - [${e.file}] ${e.name}`);
    });
    if (entries.length > 5) {
      console.log(`  ... and ${entries.length - 5} more`);
    }
    console.log('');
  }
});
