const fs = require('fs');
const content = fs.readFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', 'utf8');

// Fixed Annobonese entry - ONLY replace the b field value
const oldB = 'San Antonio de Palâ"œâŒ",Fogo,Mabana,Matamba,Angochi,San Antonio Pequeno,Calvario,Amoco,Amoco Pequeno,Machado,Angu,Moletry,Pingano,Lagoa Azul,Makoko,Matar,Mangueira,Mombaba,Morro Lopes,Morro Fina,Praia da Morena,Praia de Fogo,Praia das Galinhas,Praia da Uva,Praia do Leste,Praia do Sul,Praia de San Antonio,Tchindâ"œÃ­,Tandjang,Tanfafe,Tanque,Kapam,Kapado,Ponta Velha,Ponta Kapelo,Ponta Mâ"œâ"‚,Novo Caminho,Quissanga,Pollonia,Annybon,Anapo,Praia Cabinda,Praia Boa Vista';

const newB = 'San Antonio de Palé,Fogo,Mabana,Matamba,Angochi,San Antonio Pequeno,Calvario,Amoco,Amoco Pequeno,Machado,Angu,Moletry,Pingano,Lagoa Azul,Makoko,Matar,Mangueira,Mombaba,Morro Lopes,Morro Fina,Praia da Morena,Praia de Fogo,Praia das Galinhas,Praia da Uva,Praia do Leste,Praia do Sul,Praia de San Antonio,Tchindjín,Tandjang,Tanfafe,Tanque,Kapam,Kapado,Ponta Velha,Ponta Kapelo,Ponta Mó,Novo Caminho,Quissanga,Pollonia,Annybon,Anapo,Praia Cabinda,Praia Boa Vista';

if (content.includes(oldB)) {
  const newContent = content.replace(oldB, newB);
  fs.writeFileSync('E:/code/Fantasy-Map-Generator/modules/namebases-real.js', newContent);
  console.log('Annobonese fixed');
  console.log('Old:', oldB.substring(0, 50));
  console.log('New:', newB.substring(0, 50));
} else {
  console.log('Annobonese pattern not found');
  // Try to find partial match
  if (content.includes('San Antonio de Pal')) {
    console.log('Found partial match');
  }
}
