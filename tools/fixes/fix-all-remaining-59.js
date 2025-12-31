"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING 59 PLACEHOLDERS ===\n');

const replacements = [
  { line: 329, name: "Irpino", newBase: "Ariano,Irpinia,Benevento,Avellino,Sant'Arcangelo,Avellino,Baronissi,Rocca San Felice,Cervinara" },
  { line: 330, name: "Molisan", newBase: "Campobasso,Isernia,Termoli,Venafro,Larino,Bojano,Termoli,Agnone,Rionero,Pescasseroli,Capracotta" },
  { line: 332, name: "Northern Calabrian", newBase: "Cosenza,Rende,Castrovillari,Rogliano,Acri,Rossano,Corigliano,San Giovanni in Fiore,Corigliano" },
  { line: 333, name: "South Lucanian", newBase: "Policoro,Matera,Torre del Greco,Maratea,Olbia,Olbia,San Giovanni Rotondo,Bernalda" },
  { line: 335, name: "Southern Latian", newBase: "Cosenza,Rossano,Castrovillari,Rogliano,Acri,Rendinara,San Marco Argentano,Acri,San Demetrio" },
  { line: 336, name: "Southern Laziale", newBase: "Latina,Frosinone,Formia,Priverno,Sora,Cassino,Ceprano,Pontecorvo,Isola del Liri" },
  { line: 337, name: "Tarantino", newBase: "Taranto,Martina Franca,Grottaglie,Massafra,Carosino,Mottola,Bisceglie,Molfetta,Rutigliano" },
  { line: 338, name: "Vastese", newBase: "Vasto,Atessa,Casalbordino,Carpinone,Lanuvio,Gavignano,Castel di Ieri,Cervaro" },
  { line: 339, name: "Ardennais", newBase: "Bastogne,Sedan,Charleville-Mézières,Vouziers,Reims,Laon,Rethel,Saint-Quentin,Mézières" },
  { line: 340, name: "Berrichon", newBase: "Saint-Dié,Epinal,Mirecourt,Vittel,Neufchâteau,Bruyères,Gérardmer,Le Thillot" },
  { line: 341, name: "Bourbonnais", newBase: "Moulins,Bourges,Nevers,Digoin,Bézençon,Autun,Montceau-les-Mines,Clamecy,Avallon" },
  { line: 343, name: "Franc-Comtou", newBase: "Besançon,Belfort,Montbéliard,Dole,Lons-le-Saunier,Vesoul,Gray,Dole,Besançon" },
  { line: 344, name: "Gallo", newBase: "Toulouse,Bordeaux,Bergerac,Périgueux,Agen,Marmande,Villeneuve-sur-Lot,Lauzun,Cahors,Brive" },
  { line: 345, name: "Gaumais", newBase: "Toulouse,Carcassonne,Perpignan,Narbonne,Albi,Montauban,Bagnères-de-Luchon,Foix,Mirepoix" },
  { line: 346, name: "Law French", newBase: "Vernon,Évreux,Louvers,Les Andelys,Dreux,Pacy-sur-Eure,Conches-en-Ouche,Nonancourt,Gisors" },
  { line: 348, name: "Mayennais", newBase: "Laval,Mayenne,Château-Gontier,Craon,Ernée,Sablé-sur-Sarthe,Mayenne,Laval,Château-Gontier" },
  { line: 355, name: "Acadian", newBase: "Moncton,Shediac,Bathurst,Fredericton,Charlottetown,Amherst,Truro,Yarmouth,Prince Edward Island" },
  { line: 356, name: "Aeolian", newBase: "Lipari,Salinella,Vulcano,Stromboli,Alicudi,Filicudi,Panarea,Milazzo,Santa Marina Salina" },
  { line: 357, name: "African Romance", newBase: "Algiers,Oran,Constantine,Annaba,Batna,Sétif,Biskra,Bejaia,Tlemcen,Tizi-Ouzou,Blida" },
  { line: 358, name: "Alentejan", newBase: "Évora,Portalegre,Beja,Santarém,Setúbal,Sines,Almodôvar,Mora,Mourão,Cuba" }
];

let replaced = 0;

replacements.forEach(r => {
  if (lines[r.line - 1]) {
    const oldLine = lines[r.line - 1];
    const bMatch = oldLine.match(/b:\s*"([^"]*)"/);
    if (bMatch) {
      const oldBase = bMatch[1];
      const nameMatch = oldLine.match(/name:\s*"([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1].replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (oldBase.includes(name + 'a,')) {
          const newLine = oldLine.replace(oldBase, r.newBase);
          lines[r.line - 1] = newLine;
          console.log(`✓ Line ${r.line}: ${nameMatch[1]}`);
          console.log(`  ${r.newBase.substring(0, 50)}...`);
          replaced++;
        }
      }
    }
  }
});

if (replaced > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Fixed ${replaced} placeholders\n`);
} else {
  console.log('\nNo changes made\n');
}
