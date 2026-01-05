const fs = require('fs');
const content = fs.readFileSync('tools/data/namebase-aggregated.js', 'utf8');
const names = [
  "Polish (dedicated)",
  "Kashubian (dedicated)",
  "Silesian (dedicated)",
  "Montenegrin (dedicated)",
  "Croatian (dedicated)",
  "Dutch (dedicated)",
  "Franglish (dedicated)",
  "Solombala-English (dedicated)",
  "Greek (dedicated)"
];

console.log("Searching for names in namebase-aggregated.js:");
const entries = content.split('},').map(e => e.trim());
names.forEach(name => {
  let found = false;
  entries.forEach(entry => {
    if (entry.includes(`"name": "${name}"`)) {
      const iMatch = entry.match(/"i":\s*(\d+)/);
      if (iMatch) {
        console.log(`Name "${name}": Authoritative index is ${iMatch[1]}`);
        found = true;
      }
    }
  });
  if (!found) {
    console.log(`Name "${name}": No authoritative entry found.`);
  }
});
