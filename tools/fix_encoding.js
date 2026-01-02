const fs = require('fs');

// Read the file
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// 1. Fix Annobonese (i: 73)
const annoboneseOld = 'San Antonio de Palâ\x19\x9c\x8d\x8c,Fogo,Mabana,Matamba,Angochi,San Antonio Pequeno,Calvario,Amoco,Amoco Pequeno,Machado,Angu,Moletry,Pingano,Lagoa Azul,Makoko,Matar,Mangueira,Mombaba,Morro Lopes,Morro Fina,Praia da Morena,Praia de Fogo,Praia das Galinhas,Praia da Uva,Praia do Leste,Praia do Sul,Praia de San Antonio,Tchindâ\x19\x9c\xc3\xad,Tandjang,Tanfafe,Tanque,Kapam,Kapado,Ponta Velha,Ponta Kapelo,Ponta Mâ\x19\x9c\xe2\x80\x82,Novo Caminho,Quissanga,Pollonia,Annybon,Anapo,Praia Cabinda,Praia Boa Vista';

const annoboneseNew = 'San Antonio de Pale,Fogo,Mabana,Matamba,Angochi,San Antonio Pequeno,Calvario,Amoco,Amoco Pequeno,Machado,Angu,Moletry,Pingano,Lagoa Azul,Makoko,Matar,Mangueira,Mombaba,Morro Lopes,Morro Fina,Praia da Morena,Praia de Fogo,Praia das Galinhas,Praia da Uva,Praia do Leste,Praia do Sul,Praia de San Antonio,Tchindjin,Tandjang,Tanfafe,Tanque,Kapam,Kapado,Ponta Velha,Ponta Kapelo,Ponta Mo,Novo Caminho,Quissanga,Pollonia,Annybon,Anapo,Praia Cabinda,Praia Boa Vista';

// 2. Fix Forro Sao Tome (i: 74)
const forroOld = 'SÃ¢Â\x9cÂºo TomÃ¢Â\x9cÂ\x8d\x8c';

const forroNew = 'Forro Sao Tome';

// 3. Fix Principense Sundy (i: 75)  
const principenseOld = 'Santo Antâ\x19\x9c\xe2\x80\x82nio,Sao Joaquim,Oquâ\x19\x9c\xc2\xac Daniel';

const principenseNew = 'Santo Antonio,Sao Joaquim,Oqua Daniel';

// 4. Fix Seri (i: 78)
const seriOld = 'Puerto Peâ\x19\x9c\xe2\x80\x90asco,Bahâ\x19\x9c\xc2\xa1a La Choya,Bahâ\x19\x9c\xc2\xa1a San Carlos';

const seriNew = 'Puerto Penasco,Bahia La Choya,Bahia San Carlos';

let newContent = content
  .replace(annoboneseOld, annoboneseNew)
  .replace(forroOld, forroNew)
  .replace(principenseOld, principenseNew)
  .replace(seriOld, seriNew);

// Also fix the language names
newContent = newContent
  .replace('Annobonese Palâ\x19\x9c\x8d\x8c', 'Annobonese Pale')
  .replace('Forro Sâ\x19\x9c\xc3\xbao Tomâ\x19\x9c\x8d\x8c', 'Forro Sao Tome')
  .replace('Principense Sundy', 'Principense Sundy')
  .replace('Seri', 'Seri');

fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
console.log('Fixed encoding issues');
console.log('File size:', newContent.length);
