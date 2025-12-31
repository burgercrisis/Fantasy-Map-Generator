const fs = require('fs');

const content = fs.readFileSync('modules/namebases-real.js', 'utf-8');
const lines = content.split('\n');

const targetLine = 1857 - 1; // Convert to 0-based
if (targetLine >= 0 && targetLine < lines.length) {
  const line = lines[targetLine];
  console.log('Line 1857:', line);
} else {
  console.log('Line out of range');
}