const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('\n=== CHECKING SPECIFIC PLACEHOLDERS ===\n');

const fixes = [
  { name: "Fabriano", newBase: "Fabriano,Fano,Senigallia,Osimo,Macerata,Recanati,Matelica" },
  { name: "Faetar", newBase: "Fátima,Ourém,Leiria,Coimbra,Santarém,Tomar,Abrantes,Portalegre,Bajos,Vila Nova" },
  { name: "Fala", newBase: "Zamora,Salamanca,Valladolid,Ávila,Segovia,Soria,Burgos,Palencia,Ourense" },
  { name: "Ferrarese", newBase: "Ferrara,Bondeno,Portomaggiore,Cento,Mirabello,Vigarano,Argenta,Comacchio,Molinara" },
  { name: "Florentine", newBase: "Florence,Fiesole,Sesto Fiorentino,Campi Bisenzio,Scandicci,Prato,Pistoia,Pistoia,Empoli" },
  { name: "Forlivese", newBase: "Forlì,Cesena,Meldola,Forlimpopoli,Bertinoro,Predappio,Faenza,Rocca San Casciano" },
  { name: "Fornes", newBase: "Forno,Varennes,Jarny,Clamecy,Châlons-en-Champagne,Château-Thierry" }
];

let fixed = 0;
const lines = content.split('\n');

fixes.forEach(fix => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(fix.name) && line.includes(fix.newBase.split(',')[0])) {
      const bMatch = line.match(/b:\s*"([^"]*)"/);
      if (bMatch) {
        const oldBase = bMatch[1];
        const newLine = line.replace(oldBase, fix.newBase);
        if (newLine !== line) {
          lines[i] = newLine;
          console.log(`✓ Fixed: ${fix.name}`);
          console.log(`  Cities: ${fix.newBase}`);
          fixed++;
          break;
        }
      }
    }
  }
});

if (fixed > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Fixed ${fixed} placeholders\n`);
}
