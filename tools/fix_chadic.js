const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed East Chadic entry
const fixedLine = '  {\n    "name": "East Chadic",\n    "i": 69,\n    "min": 4,\n    "max": 11,\n    "d": "nic-GH",\n    "m": 0,\n    "b": "N\'Djamena,Bol,Massakory,Mao,Moussoro,Massaguet,Bongor,Pala,Kelo,Lai,Sarh,Am Timan,Ati,Mongo,Biltine,Abe,Bitkine,Bousso,Fianga,Boro,Moussoro,Bathaa,Goz Beida,Doba,Beboto"\n  },';

// Find the entry and replace
const startMarker = '    "i": 69';
const idx = content.indexOf(startMarker);
if (idx > 0) {
  // Go back to find the opening {
  const objStart = content.lastIndexOf('  {', idx);
  if (objStart > 0) {
    const endIdx = content.indexOf('},', idx);
    const newContent = content.substring(0, objStart) + fixedLine + content.substring(endIdx + 2);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
    console.log('East Chadic fixed');
    console.log('Removed', endIdx + 2 - objStart, 'characters');
  }
}
