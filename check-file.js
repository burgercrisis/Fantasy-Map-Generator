const fs = require('fs');
const data = fs.readFileSync('modules/namebases-africa.js', 'utf8');
console.log('File size:', data.length, 'characters');
console.log('Entries found:', (data.match(/"name":/g) || []).length);
console.log('Placeholder entries:', (data.match(/_unq\d+/g) || []).length);
try {
  JSON.parse(data);
  console.log('✓ Valid JSON');
} catch(e) {
  console.error('✗ Invalid JSON:', e.message);
}