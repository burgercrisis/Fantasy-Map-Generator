"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS (Lines 361-390) ===\n');

const fixes = [
  { line: 361, name: "Andalus Romance", newBase: "Córdoba,Granada,Málaga,Sevilla,Zaragoza,Murcia,Cádiz,Huelva" },
  { line: 363, name: "Ans", newBase: "Angers,Saumur,Cholet,Nantes,Le Mans,Tours,Niort,Chinon" },
  { line: 369, name: "Balearic", newBase: "Palma,Ibiza,Manacor,Formentera,Mahón,Ciutadella,Eivissa" },
  { line: 370, name: "Banat", newBase: "Timisoara,Arad,Oradea,Baia Mare,Satu Mare,Craiova,Caransebe" },
  { line: 371, name: "Barranquenho", newBase: "Tilcara,San Salvador de Jujuy,Jujuy,Salta,La Quiaca,Tartagal" },
  { line: 372, name: "Benasquese", newBase: "Benasqué,Fraga,Barbastro,Binéfar,Boltaña,Monzón" },
  { line: 373, name: "Bercian", newBase: "Berges,Terrasson-Lavilledieu,Lormes,Neuvy-sur-Barangeon,Bar-le-Duc" },
  { line: 374, name: "Bergamasque", newBase: "Toulouse,Béziers,Albi,Carcassonne,Montauban,Perpignan" },
  { line: 376, name: "Bolivian Spanish", newBase: "Sucre,La Paz,Cochabamba,Santa Cruz,Oruro,Potosí,Tarija" },
  { line: 377, name: "Bolognese", newBase: "Bologna,Ferrara,Modena,Parma,Reggio Emilia,Forli,Rimini,Ravenna" },
  { line: 378, name: "Bragonean", newBase: "Braga,Guimarães,Viseu,Porto,Celorico da Beira,Vila Real" },
  { line: 379, name: "Brazilian Portuguese", newBase: "São Paulo,Rio de Janeiro,Belo Horizonte,Brasília,Salvador,Fortaleza,Recife,Porto Alegre" },
  { line: 380, name: "Brianzoo", newBase: "Briançon,Montgenèvre,La Roche-en-Brenil,Oulx,Vars,Briançon,Embrun,Seyne" },
  { line: 382, name: "Brivasc", newBase: "Briançon,Sestrières,Pragel,Guillestre,Valloire,Embrun,Gap" },
  { line: 383, name: "British Latin", newBase: "London,York,Edinburgh,Manchester,Liverpool,Glasgow,Cardiff,Bristol,Birmingham" },
  { line: 384, name: "Bukovinian", newBase: "Chernivtsi,Kamianets-Podilsky,Ivano-Frankivsk,Kolomyia,Sniatyn,Khmelnytskyi" },
  { line: 385, name: "Burgundian", newBase: "Dijon,Beaune,Chalon-sur-Saône,Mâcon,Auxerre,Sens,Nevers,Avallon" },
  { line: 386, name: "Canzes", newBase: "Cannes,Nice,Grasse,Antibes,Mandelieu,Draguignan,Vence,Fréjus,Le Muy,Saint-Tropez" },
  { line: 387, name: "Cantabrian", newBase: "Santander,Torrelavega,Cantabria,Laredo,Reinosa,Castro Urdiales,Potes,Cabezón de la Sal" },
  { line: 388, name: "Castilian", newBase: "Madrid,Toledo,Ávila,Segovia,Valladolid,Zamora,Salamanca,Burgos,Soria" },
  { line: 389, name: "Catalan", newBase: "Barcelona,Girona,Tarragona,Lleida,Tortosa,Reus,Manresa,Granollers,Vic" },
  { line: 390, name: "Castilian-Lenon", newBase: "Léon,Valladolid,Zamora,Burgos,Palencia,Oviedo,Gijón,Santander,Madrid" }
];

let fixed = 0;

fixes.forEach(fix => {
  const lineNum = fix.line - 1;
  if (lineNum >= 0 && lineNum < lines.length) {
    const oldLine = lines[lineNum];
    const bMatch = oldLine.match(/b:\s*"([^"]*)"/);
    if (bMatch) {
      const oldBase = bMatch[1];
      const newLine = oldLine.replace(oldBase, fix.newBase);
      if (newLine !== oldLine) {
        lines[lineNum] = newLine;
        console.log(`✓ Line ${fix.line}: ${fix.name}`);
        console.log(`  ${fix.newBase.substring(0, 50)}...`);
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
