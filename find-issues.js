const fs = require('fs');
const csv = fs.readFileSync('docs/reports/language-quality-metrics.csv', 'utf8');
const lines = csv.split('\n');
const header = lines[0];
const issues = lines.slice(1).filter(l => l && l.includes('TRUE'));

console.log('=== ALL ISSUES ===\n');

issues.forEach(l => {
  const cols = l.split(',');
  const name = cols[0];
  const idx = cols[1];
  const suspicious = cols[19];
  const indexCollision = cols[22];
  const nameCollision = cols[23];
  const nearDuplicate = cols[24];
  
  if (suspicious === 'TRUE' || indexCollision === 'TRUE' || nameCollision === 'TRUE' || nearDuplicate === 'TRUE') {
    console.log(`${name} at index ${idx}: suspicious=${suspicious}, index_collision=${indexCollision}, name_collision=${nameCollision}, near_duplicate=${nearDuplicate}`);
  }
});
