"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING FINAL PLACEHOLDERS (Lines 398-402) ===\n');

const fixes = [
  { line: 398, name: "Cri-ana", oldBase: "crianaa,crianab,crianac,crianad,crianae,crianaf,crianag,crianah,crianai,crianaj,crianak,crianal", newBase: "Chihuahua,Mexicali,Ciudad Juárez,Torreon,Chihuahua,Durango,Parral,Monterrey,Saltillo,Monclova" },
  { line: 399, name: "Daco-Romanian", oldBase: "dacoromaniana,dacoromanianb,dacoromaniac,dacoromaniand,dacoromaniane,dacoromanianf,dacoromaniang,dacoromanianh,dacoromaniani,dacoromanianj,dacoromaniank,dacoromanianl", newBase: "Cluj-Napoca,Timișoara,Arad,Oradea,Satu Mare,Sighetu Marmați,Baia Mare,Zalău,Bistrița" },
  { line: 400, name: "Dalmatian", oldBase: "dalmatiana,dalmatianb,dalmatianc,dalmatiand,dalmatiane,dalmatianf,dalmatiang,dalmatianh,dalmatiani,dalmatianj,dalmatiank,dalmatianl", newBase: "Split,Zadar,Dubrovnik,Šibenik,Rijeka,Osijek,Pula,Zadar,Karlovac,Ploče" },
  { line: 401, name: "Eastern Aragonese", oldBase: "easternaragonesea,easternaragoneseb,easternaragonesec,easternaragonesed,easternaragonesee,easternaragonesef,easternaragoneseg,easternaragoneseh,easternaragonesei,easternaragonesej,easternaragonesek,easternaragonesel", newBase: "Huesca,Barbastro,Binéfar,Monzón,Jaca,Fraga,Zaragoza,Teruel,Alcanyiz,Candasinte" },
  { line: 402, name: "Eastern Catalan", oldBase: "easterncatalana,easterncatalanb,easterncatalanc,easterncataland,easterncatalane,easterncatalanf,easterncatalang,easterncatalanh,easterncatalani,easterncatalanj,easterncatalank,easterncatalanel", newBase: "Girona,Figueres,Olot,Ripoll,Berga,Vic,Manresa,Sabadell,Solsones,Mataró" }
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
        console.log(`  ${fix.newBase.substring(0, 60)}...`);
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
