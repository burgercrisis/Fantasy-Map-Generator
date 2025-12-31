"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const replacements = [
  {
    line: 426,
    name: "Fabriano",
    oldBase: "fabrianoa,fabrianob,fabrianoc,fabrianod,fabrianoe,fabrianof,fabrianog,fabrianoh,fabrianoi,fabrianj,fabrianok,fabrianol",
    newBase: "Fabriano,Fano,Senigallia,Osimo,Caldarola,Serra de'Conti,Alta Valle Teverina,Città di Castello"
  },
  {
    line: 427,
    name: "Faetar",
    oldBase: "faetara,faetarb,faetarc,faetard,faetare,faetarf,faetarg,faetarh,faetari,faetarj,faetark,faetarl",
    newBase: "Fátima,Ourém,Leiria,Coimbra,Santarém,Tomar,Abrantes,Pombal,Portalegre,Charneca,Vila Nova de Ourém"
  },
  {
    line: 451,
    name: "Genoese",
    oldBase: "genoesea,genoeseb,genoesec,genoesed,genoesee,genoesef,genoeseg,genoeseeh,genoesei,genoesej,genoesek,genoesel",
    newBase: "Genoa,Savona,La Spezia,Imperia,Chiavari,Rapallo,Albenga,Novi Ligure,Ventimiglia,Sestri Levante,Cogoleto"
  },
  {
    line: 475,
    name: "Latin",
    oldBase: "latina,latinb,latinc,latind,latine,latinf,lating,latinh,latini,latinj,latink,latinl",
    newBase: "Rome,Venetia,Trieste,Milan,Firenze,Livorno,Ancona,Genoa,Naples,Bari,Palermo"
  }
];

console.log('\n=== FIXING SKIPPED PLACEHOLDERS ===\n');
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
      console.log(`- Line ${r.line}: ${r.name} (no change needed)`);
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Fixed ${replaced} placeholders\n`);
} else {
  console.log('\nNo changes needed\n');
}
