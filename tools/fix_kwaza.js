const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Kwaza-Xoc Amazonian entry
const fixedLine = '  {\n    "name": "Kwaza-Xoc Amazonian",\n    "i": 70,\n    "min": 4,\n    "max": 12,\n    "d": "nic-GH",\n    "m": 0,\n    "b": "Porto Velho,Ji-Parana,Cacoal,Vilhena,Guajara-Mirim,Ariquemes,Humaita,Altamira,Santarem,Itaituba,Maraba,Araguaina,Palmas,Aracaju,Propria,Penedo,Paulo Afonso,Delmiro Gouveia"\n  },';

// Find the entry and replace
const startMarker = '    "i": 70';
const idx = content.indexOf(startMarker);
if (idx > 0) {
  // Go back to find the opening {
  const objStart = content.lastIndexOf('  {', idx);
  if (objStart > 0) {
    const endIdx = content.indexOf('},', idx);
    const newContent = content.substring(0, objStart) + fixedLine + content.substring(endIdx + 2);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
    console.log('Kwaza-Xoc fixed');
    console.log('Removed', endIdx + 2 - objStart, 'characters');
  }
}
