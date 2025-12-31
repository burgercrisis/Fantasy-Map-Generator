const fs = require('fs');
const d = fs.readFileSync('modules/namebases-real.js', 'utf8');
const lines = d.split('\n');
let count = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{ name:')) {
    const b = lines[i].match(/b:\s*"([^"]*)"/);
    if (b) {
      const cities = b[1].split(',');
      if (cities.length < 5) {
        count++;
        if (count <= 30) {
          console.log('Line ' + (i + 1) + ': ' + lines[i].match(/name:\s*"([^"]+)"/)[1] + ' (' + cities.length + ' cities)');
        }
      }
    }
  }
}
console.log('\nTotal remaining <5 cities: ' + count);
