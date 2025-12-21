const fs = require('fs');
const content = fs.readFileSync('modules/namebases-real.js', 'utf8');
const regex = /{name: "Ket \(dedicated\)", i: (\d+),.*?, b: "(.*?)"}/;
const match = content.match(regex);
if (match) {
  console.log(`Index: ${match[1]}`);
  console.log(`Seeds: ${match[2]}`);
}
