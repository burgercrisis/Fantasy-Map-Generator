const fs = require('fs');

const files = fs.readdirSync('modules').filter(f => f.startsWith('namebases-') && f.endsWith('.js')).map(f => 'modules/' + f);

let total = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/\{/g);
  const count = matches ? matches.length : 0;
  console.log(file, count);
  total += count;
});

console.log('Total languages:', total);