const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Seri entry
const newB = 'Punta Chueca,El Desemboque,Bahia Kino,Bahia de Kino,Hermosillo,Guaymas,Empalme,Puerto Libertad,Puerto Penasco,Bahia La Choya,La Cholla,Kino Nuevo,Pitiquito,Caborca,Altar,Santa Ana,Magdalena de Kino,Imuris,San Carlos,Bahia San Carlos,Ortiz,Pesqueira';

// Find the entry and replace
const entryStart = content.indexOf('    "i": 78');
if (entryStart > 0) {
  const objStart = content.lastIndexOf('  {', entryStart);
  const entryEnd = content.indexOf('},', entryStart);
  
  const fixedEntry = `  {
    "name": "Seri",
    "i": 78,
    "min": 4,
    "max": 11,
    "d": "nic-GH",
    "m": 0,
    "b": "${newB}"
  },`;
    
  const newContent = content.substring(0, objStart) + fixedEntry + content.substring(entryEnd + 2);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
  console.log('Seri fixed');
} else {
  console.log('Seri entry not found');
}
