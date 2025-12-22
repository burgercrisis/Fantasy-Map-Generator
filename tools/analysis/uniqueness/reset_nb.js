const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = content.split('\n');
const lastIdx = lines.findLastIndex(l => l.includes('i: 13937'));
if (lastIdx === -1) {
  console.error('Index 13937 not found');
  process.exit(1);
}
const newLines = lines.slice(0, lastIdx + 1);
// Check if the last line already has a comma
if (!newLines[newLines.length - 1].trim().endsWith(',')) {
    newLines[newLines.length - 1] = newLines[newLines.length - 1].replace(/},?\s*$/, '},');
}
newLines.push('];', '', 'if (typeof module !== "undefined" && module.exports) module.exports = window.realWorldNameBases;');
fs.writeFileSync('modules/namebases-real.js', newLines.join('\n'));
console.log('Reset namebases-real.js');
