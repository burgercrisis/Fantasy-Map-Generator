const fs = require('fs');
const content = fs.readFileSync('modules/namebases-oceania.js', 'utf8');

// Split by entries more reliably
const entries = content.split(/\}\s*,\s*\{/);

entries.forEach((entry, i) => {
  // Extract name
  const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
  if (!nameMatch) return;
  
  // Extract b field
  const bMatch = entry.match(/"b":\s*"([^"]+)"/);
  if (!bMatch) return;
  
  const cities = bMatch[1].split(',').length;
  if (cities < 25) {
    console.log(`${nameMatch[1]}: ${cities} cities (index ~${i})`);
  }
});
