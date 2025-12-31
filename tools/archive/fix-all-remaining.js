"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS ===\n');

const replacements = [
  {
    line: 484,
    name: "Louisiana French",
    oldBase: "louisianafrencha,louisianafrenchb,louisianafrenchc,louisianafrenchd,louisianafrenche,louisianafrenchf,louisianafrenchg,louisianafrenchh,louisianafrenchi,louisianafrenchj,louisianafrenchk,louisianafrenchl",
    newBase: "New Orleans,Baton Rouge,Lafayette,Shreveport,Lake Charles,Monroe,Alexandria,Houma,Thibodaux,Morgan City,Slidell"
  },
  {
    line: 487,
    name: "Macerata",
    oldBase: "Macerata,Civitanova Marche,Tolentino,San Severino Marche,Recanati,San Ginesio,Monte San Giusto,Pollenza",
    newBase: "Macerata,Civitanova Marche,Tolentino,San Severino Marche,Recanati,San Ginesio,Monte San Giusto,Pollenza"
  },
  {
    line: 490,
    name: "Mallorcan",
    oldBase: "Palma,Manacor,Ibiza,Mahón,Ciutadella,Eivissa,Alaior,Santanyí,Soller,Andratx,Pollença",
    newBase: "Palma de Mallorca,Manacor,Ibiza,Mahón,Ciutadella,Eivissa,Alaior,Santanyí,Sóller,Andratx,Pollença"
  },
  {
    line: 492,
    name: "Manduriano",
    oldBase: "Mantua,Crema,Suzzara,Viadana,Curtatone,Marcigno,Motteggiana,Volta Mantovana,Goito,Quistello,Sabbioneta",
    newBase: "Mantua,Crema,Suzzara,Viadana,Curtatone,Marcigno,Motteggiana,Volta Mantovana,Goito,Quistello,Sabbioneta"
  },
  {
    line: 493,
    name: "Maramure-",
    oldBase: "Maramureș,Târgu Mureș,Reghin,Toplița,Sighișoara,Reghin,Sângeru,Târnăveni,Bistrița",
    newBase: "Maramureș,Târgu Mureș,Reghin,Toplița,Sighișoara,Reghin,Sângeru,Târnăveni,Bistrița"
  },
  {
    line: 497,
    name: "Mentonasc",
    oldBase: "Menton,Roquebrune-Cap-Martin,Saint-Agnès,Beausoleil,Èze,La Turbie,Castellar,Peille",
    newBase: "Menton,Roquebrune-Cap-Martin,Saint-Agnès,Beausoleil,Èze,La Turbie,Castellar,Peille"
  },
  {
    line: 498,
    name: "Mexican Spanish",
    oldBase: "mexicanspanisha,mexicanspanishb,mexicanspanishc,mexicanspanishd,mexicanspanishe,mexicanspanishf,mexicanspanishg,mexicanspanishh,mexicanspanishi,mexicanspanishj,mexicanspanishk,mexicanspanishl",
    newBase: "Mexico City,Guadalajara,Monterrey,Puebla,Ciudad Juárez,Tijuana,León,Veracruz,Cancún,Guadalajara,Mazatlán"
  },
  {
    line: 501,
    name: "Mineiro",
    oldBase: "Belo Horizonte,Uberlândia,Juiz de Fora,Contagem,Betim,Montes Claros,Governador Valadares,Ipatinga,Sete Lagoas,Divinópolis,Varginha,Ouro Preto",
    newBase: "Belo Horizonte,Uberlândia,Juiz de Fora,Contagem,Betim,Montes Claros,Governador Valadares,Ipatinga,Sete Lagoas,Divinópolis,Varginha,Ouro Preto"
  },
  {
    line: 505,
    name: "Monégasque",
    oldBase: "Monaco,Monte Carlo,La Condamine,Fontvieille,Moneghetti,Larvotto,La Rousse,Saint Roman,Jardin Exotique,Les Moulins,Spelugues,Port Hercule",
    newBase: "Monaco,Monte Carlo,La Condamine,Fontvieille,Moneghetti,Larvotto,La Rousse,Saint Roman,Jardin Exotique,Les Moulins,Spélugues,Port Hercule"
  },
  {
    line: 506,
    name: "Mozarabic",
    oldBase: "mozarabica,mozarabicb,mozarabicc,mozarabicd,mozarabice,mozarabicf,mozarabicg,mozarabich,mozarabici,mozarabicj,mozarabick,mozarabicl",
    newBase: "Córdoba,Granada,Málaga,Sevilla,Toledo,Zaragoza,Lérida,Burgos,Zamora,Soria,Ávila,Salamanca"
  }
];

let replaced = 0;

replacements.forEach(r => {
  if (lines[r.line - 1] && lines[r.line - 1].includes(r.name)) {
    const oldLine = lines[r.line - 1];
    const newLine = oldLine.replace(r.oldBase, r.newBase);
    if (oldLine !== newLine) {
      lines[r.line - 1] = newLine;
      console.log(`✓ Line ${r.line}: ${r.name}`);
      console.log(`  ${r.newBase.substring(0, 65)}...`);
      replaced++;
    } else {
      console.log(`- Line ${r.line}: ${r.name} (already good)`);
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Fixed ${replaced} remaining placeholders\n`);
} else {
  console.log('\nNo changes needed\n');
}
