const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Forro São Tomé entry - ONLY replace the b field value
const oldB = 'São Tomé,Trindade,Santana,Neves,Guadalupe,Bombom,Pantufo,Água Grande,Riboque,Mesquita,Batepá,Piedade,Ribeira Afonso,Ribeira Peixe,Madalena,Micólito,Monte Café,Conde,Boa Entrada,Boa Vista,Santa Margarida,Santa Catarina,Santa Cruz,Santa Clara,Santa Luzia,Diogo Vaz,Porto Alegre,Praia Cruz,Palmares,Água Izé,Fruta Fruta,São Marçal,São Miguel,São Pedro,Uba Budo,Emolve,Monte Mário,Caixão Grande,Almas,Alto Douro,São Lázaro,Almeirim,Andrade,Bobô Forro,Bela Vista,Bom Sucesso,Bom Bom,Bom Despacho';

const newB = 'Sao Tome,Trindade,Santana,Neves,Guadalupe,Bombom,Pantufo,Agua Grande,Riboque,Mesquita,Batepa,Piedade,Ribeira Afonso,Ribeira Peixe,Madalena,Micólito,Monte Cafe,Conde,Boa Entrada,Boa Vista,Santa Margarida,Santa Catarina,Santa Cruz,Santa Clara,Santa Luzia,Diogo Vaz,Porto Alegre,Praia Cruz,Palmares,Agua Ize,Fruta Fruta,Sao Marcal,Sao Miguel,Sao Pedro,Uba Budo,Emolve,Monte Mario,Caixao Grande,Almas,Alto Douro,Sao Lazaro,Almeirim,Andrade,Bobo Forro,Bela Vista,Bom Sucesso,Bom Bom,Bom Despacho';

if (content.includes(oldB)) {
  const newContent = content.replace(oldB, newB);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
  console.log('Forro Sao Tome fixed');
} else {
  // Try finding with corruption pattern
  const corrupted = 'Sâ"œÃºo Tomâ"œâŒ"';
  if (content.includes(corrupted)) {
    console.log('Found corrupted version, need different approach');
    // Find and replace the whole entry
    const entryStart = content.indexOf('    "i": 74');
    const objStart = content.lastIndexOf('  {', entryStart);
    const entryEnd = content.indexOf('},', entryStart);
    
    const fixedEntry = `  {
    "name": "Forro Sao Tome",
    "i": 74,
    "min": 5,
    "max": 12,
    "d": "nic-GH",
    "m": 0,
    "b": "${newB}"
  },`;
    
    const newContent = content.substring(0, objStart) + fixedEntry + content.substring(entryEnd + 2);
    fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
    console.log('Forro Sao Tome fixed (entry replacement)');
  } else {
    console.log('Forro Sao Tome pattern not found');
  }
}
