const fs = require('fs');

const lines = fs.readFileSync('modules/namebases-real.js', 'utf8').split('\n');
let issues = [];

lines.forEach((line, i) => {
  const nameMatch = line.match(/name:\s*"([^"]+)"/);
  if (!nameMatch) return;
  const name = nameMatch[1];

  // Empty name
  if (name.match(/^\s+$/)) {
    issues.push({line: i+1, issue: 'empty name', value: name});
  }

  // Name too short (< 2 chars, already handled)
  if (name.length < 2) {
    issues.push({line: i+1, issue: 'name too short', value: name});
  }

  // Name too long (> 50 chars)
  if (name.length > 50) {
    issues.push({line: i+1, issue: 'name too long', value: name});
  }

  // Invalid index
  const iMatch = line.match(/i:\s*(\d+)/);
  if (iMatch) {
    const idx = parseInt(iMatch[1]);
    if (idx < 0 || idx > 30000) {
      issues.push({line: i+1, issue: 'invalid index', value: idx, name: name});
    }
  }

  // Empty cities
  const bMatch = line.match(/b:\s*"([^"]+)"/);
  if (bMatch) {
    const cities = bMatch[1];
    if (cities.length === 0) {
      issues.push({line: i+1, issue: 'empty cities', name: name});
    }
    // Trailing comma in cities
    if (cities.match(/,\s*$/)) {
      issues.push({line: i+1, issue: 'trailing comma', name: name});
    }
  }

  // Check for unbalanced quotes
  const openQuotes = (line.match(/"/g) || []).length;
  const closeQuotes = (line.match(/"/g) || []).length;
  if (openQuotes !== closeQuotes) {
    issues.push({line: i+1, issue: 'unbalanced quotes', name: name});
  }
});

console.log(`Found ${issues.length} structural issues:`);
issues.slice(0, 30).forEach(x => {
  console.log(`Line ${x.line} (${x.issue})${x.name ? ': ' + x.name : ''}${x.value !== undefined ? ' = ' + x.value : ''}`);
});
