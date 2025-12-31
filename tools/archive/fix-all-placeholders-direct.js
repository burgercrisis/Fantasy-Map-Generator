"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS (LINES 405-414) ===\n');

const replacements = [
  { line: 406, oldBase: "easternnonmetafonetica,easternnonmetafoneticb,easternnonmetafoneticc,easternnonmetafoneticd,easternnonmetafonetice,easternnonmetafoneticf,easternnonmetafoneticg,easternnonmetafonetich,easternnonmetafonetici,easternnonmetafoneticj,easternnonmetafonetick,easternnonmetafoneticl", newBase: "Nantes,Angers,Le Mans,Tours,Rennes,Orléans,Quimper,Laval,Angers" },
  { line: 407, oldBase: "easternromaniana,easternromanianb,easternromanianc,easternromaniand,easternromaniane,easternromanianf,easternromaniang,easternromanianh,easternromaniani,easternromanianj,easternromaniank,easternromanianl", newBase: "Iași,Bacău,Suceava,Botoșani,Baia Mare,Brăila,Focșani,Piatra Neamț" },
  { line: 408, oldBase: "ecuadorianspanisha,ecuadorianspanishb,ecuadorianspanishc,ecuadorianspanishd,ecuadorianspanishe,ecuadorianspanishf,ecuadorianspanishg,ecuadorianspanishh,ecuadorianspanishi,ecuadorianspanishj,ecuadorianspanishk,ecuadorianspanishl", newBase: "Quito,Guayaquil,Cuenca,Loja,Ambato,Ibarra,Manta,Esmerealdas,Riobamba" },
  { line: 409, oldBase: "emiliana,emilianb,emilianc,emiliand,emiliane,emilianf,emiliang,emilianh,emiliani,emilianj,emiliank,emilianl", newBase: "Bologna,Modena,Ferrara,Parma,Reggio Emilia,Piacenza,Ravenna,Rimini,Forlì" },
  { line: 410, oldBase: "doti,dipayal,silgadhi,jorayal,bogtan,shikhar,ghanteshwar,pipalla,rajpur,tikhatar,nawal,kolkata", newBase: "Nagpur,Delhi,Bhopal,Lucknow,Varanasi,Allahabad,Pune,Mumbai" },
  { line: 411, oldBase: "Mangal,Sanpaha,Kamal,Bayalpur,Chaurathi,Dhoti,Bastar,Bilaspur,Bhopal,Ujjain", newBase: "Mangal,Sanpaha,Kamal,Bayalpur,Chaurathi,Dhoti" },
  { line: 412, oldBase: "Baitadi,Dasharathchand,Patan,Jogbuda,Surnaya,Shivnath,Dehimandu,Sigas,Pancheshwar", newBase: "Baitadi,Dasharathchand,Patan,Jogbuda,Surnaya,Shivnath" },
  { line: 413, oldBase: "Bajhangi,Chainpur,JayaPrithvi,Talkot,Surma", newBase: "Bajhangi,Chainpur,JayaPrithvi,Talkot,Surma" }
];

let fixed = 0;

replacements.forEach(r => {
  if (r.line - 1 >= 0 && r.line - 1 < lines.length) {
    const oldLine = lines[r.line - 1];
    if (oldLine && oldLine.includes(r.oldBase.substring(0, 30))) {
      const newLine = oldLine.replace(r.oldBase, r.newBase);
      if (newLine !== oldLine) {
        lines[r.line - 1] = newLine;
        console.log(`✓ Line ${r.line}: Fixed`);
        fixed++;
      }
    }
  }
});

if (fixed > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${fixed} placeholders with authentic cities\n`);
} else {
  console.log('\nNo changes made\n');
}
