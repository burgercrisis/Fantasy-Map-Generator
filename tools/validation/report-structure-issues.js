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

let issues = [];

continentFiles.forEach(file => {
  const filePath = path.join(modulesPath, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const entries = parseJSArray(content);

    entries.forEach((entry, idx) => {
      if (!entry) return;

      const lineNum = idx + 1;

      if (!entry.name) {
        issues.push({ file, line: lineNum, issue: 'missing name', value: 'N/A' });
      } else if (entry.name.match(/^\s+$/)) {
        issues.push({ file, line: lineNum, issue: 'empty name', value: entry.name });
      } else if (entry.name.length < 2) {
        issues.push({ file, line: lineNum, issue: 'name too short', value: entry.name });
      } else if (entry.name.length > 50) {
        issues.push({ file, line: lineNum, issue: 'name too long', value: entry.name });
      }

      if (typeof entry.i !== 'number') {
        issues.push({ file, line: lineNum, issue: 'missing index', value: entry.i, name: entry.name });
      } else if (entry.i < 0 || entry.i > 30000) {
        issues.push({ file, line: lineNum, issue: 'invalid index', value: entry.i, name: entry.name });
      }

      if (!entry.b) {
        issues.push({ file, line: lineNum, issue: 'missing cities', name: entry.name });
      } else if (entry.b.length === 0) {
        issues.push({ file, line: lineNum, issue: 'empty cities', name: entry.name });
      } else if (entry.b.match(/,\s*$/)) {
        issues.push({ file, line: lineNum, issue: 'trailing comma in cities', name: entry.name });
      }
    });
  }
});

console.log(`Found ${issues.length} structural issues:`);
issues.slice(0, 30).forEach(x => {
  console.log(`[${x.file}] Line ${x.line} (${x.issue})${x.name ? ': ' + x.name : ''}${x.value !== undefined ? ' = ' + x.value : ''}`);
});
