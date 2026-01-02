const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Angolar São Tomé entry
const fixedLine = '  {\n    "name": "Angolar São Tomé",\n    "i": 72,\n    "min": 5,\n    "max": 11,\n    "d": "lnr",\n    "m": 0,\n    "b": "São Tomé,Porto Alegre,Santa Catarina,Neves,Trindade,São João,Buenos Aires,Bom Retiro,Raminho,São Rafael,Nova Cuba,Santa Cruz,Monte Cafe,Angolares,Santa Maria,Maldo,Condado,Lobata,Guadalupe"\n  },';

// Find the entry and replace
const startMarker = '    "i": 72';
const idx = content.indexOf(startMarker);
if (idx > 0) {
  // Go back to find the opening {
  const objStart = content.lastIndexOf('  {', idx);
  if (objStart > 0) {
    const endIdx = content.indexOf('},', idx);
    const newContent = content.substring(0, objStart) + fixedLine + content.substring(endIdx + 2);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
    console.log('Angolar São Tomé fixed');
    console.log('Removed', endIdx + 2 - objStart, 'characters');
  }
}
