const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Principense Sundy entry
const newB = 'Santo Antonio,Porto Real,Belo Monte,Bom Bom,Nova Estrela,Fazenda Sundy,Sundy,Bom Viver,Sao Joaquim,Oqua Daniel,Praia Banana,Praia Bom Bom,Praia Sundy,Praia Boi,Praia Inhame,Praia Abade,Praia Caixao,Praia Campainha,Praia Burra,Praia Curral Velho,Praia Grande,Praia Ponta Cabinda,Praia Tartufo,Praia Uva,Praia Ribeira Iheu,Praia Catamara,Praia Macaco,Praia Caixote,Praia Croa,Praia Pedra,Praia Coco,Praia Luanda,Praia Agulhas,Praia Caverna,Praia Fantasma,Praia Bacia,Praia Boiao,Praia Infante,Praia Budo,Praia Esprainha,Praia Galego,Santo Antonio';

// Find the entry and replace
const entryStart = content.indexOf('    "i": 75');
if (entryStart > 0) {
  const objStart = content.lastIndexOf('  {', entryStart);
  const entryEnd = content.indexOf('},', entryStart);
  
  const fixedEntry = `  {
    "name": "Principense Sundy",
    "i": 75,
    "min": 5,
    "max": 11,
    "d": "lnr",
    "m": 0,
    "b": "${newB}"
  },`;
    
  const newContent = content.substring(0, objStart) + fixedEntry + content.substring(entryEnd + 2);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
  console.log('Principense Sundy fixed');
} else {
  console.log('Principense entry not found');
}
