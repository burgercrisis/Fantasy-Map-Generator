"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING REMAINING PLACEHOLDERS ONE BY ONE ===\n');

const fixes = [
  { line: 333, name: "Pugliese", newBase: "Bari,Brindisi,Taranto,Foggia,Lecce,Barletta,Andria,Bisceglie,Bitonto,Molfetta" },
  { line: 334, name: "South Lucanian", newBase: "Potenza,Matera,Benevento,Salerno,Avellino,Frosinone,Caserta,Naples" },
  { line: 359, name: "Algherese", newBase: "Alghero,Sassari,Olbia,Nuoro,Tempio Pausania,Castelsardo,Bosa,Porto Torres" },
  { line: 361, name: "Andalus Romance", newBase: "Córdoba,Granada,Málaga,Sevilla,Zaragoza,Badajoz,Cáceres,Salamanca" },
  { line: 362, name: "Andalusian", newBase: "Sevilla,Córdoba,Málaga,Granada,Cádiz,Huelva,Jaén,Almería,Zaragoza" },
  { line: 363, name: "Ans|", newBase: "Angers,Saumur,Cholet,Nantes,Le Mans,Tours,Niort,Chinon,Laval,Sablé-sur-Sarthe" },
  { line: 364, name: "Aretino-Chianaiolo", newBase: "Arezzo,Cortona,Sansepolcro,Città di Castello,Pieve Santo Stefano,Capolona,Bibbiena" },
  { line: 365, name: "Argentinian Spanish", newBase: "Buenos Aires,Córdoba,Rosario,Mendoza,La Plata,Mar del Plata,Tucumán,Santa Fe" },
  { line: 366, name: "Arpitan", newBase: "Aosta,Ivrea,Valdosta,Biella,Novara,Verbania,Vercelli,Alessandria,Asti,Cuneo" },
  { line: 367, name: "Asturian", newBase: "Oviedo,Gijón,Avilés,Mieres,Sama,Langreo,Laviana,Polares,Cangas de Narcea" },
  { line: 368, name: "Auvergnat", newBase: "Clermont-Ferrand,Vichy,Moulins,Thiers,Ambert,Brioude,Issoire,Riom,Montluçon" }
];

let fixed = 0;

fixes.forEach(fix => {
  const lineNum = fix.line - 1;
  if (lineNum >= 0 && lineNum < lines.length) {
    const oldLine = lines[lineNum];
    if (oldLine.includes(fix.name)) {
      const bMatch = oldLine.match(/b:\s*"([^"]*)"/);
      if (bMatch) {
        const oldBase = bMatch[1];
        const newLine = oldLine.replace(oldBase, fix.newBase);
        if (newLine !== oldLine) {
          lines[lineNum] = newLine;
          console.log(`✓ Line ${fix.line}: ${fix.name}`);
          console.log(`  ${fix.newBase.substring(0, 60)}...`);
          fixed++;
        }
      }
    }
  }
});

if (fixed > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ FIXED ${fixed} placeholders\n`);
} else {
  console.log('\nNo changes made\n');
}
