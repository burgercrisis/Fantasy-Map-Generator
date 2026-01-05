const fs = require('fs');
const content = fs.readFileSync('modules/namebases-africa.js', 'utf8');
const entries = content.split('},');
entries.forEach(entry => {
  if (entry.includes('"b": "New Place"')) {
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    const iMatch = entry.match(/"i":\s*(\d+)/);
    if (nameMatch && iMatch) {
      console.log(`Index ${iMatch[1]}: ${nameMatch[1]}`);
    }
  }
});
