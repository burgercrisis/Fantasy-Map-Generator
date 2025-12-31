"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING REMAINING PLACEHOLDERS (Lines 468-475) ===\n');

const fixes = [
  { line: 469, name: "Judeo-Spanish", oldBase: "judeospanisha,judeospanishb,judeospanishc,judeospanishd,judeospanishe,judeospanishf,judeospanishg,judeospanishh,judeospanishi,judeospanishj,judeospanishk,judeospanishl", newBase: "Madrid,Barcelona,Valencia,Sevilla,Zaragoza,Badajoz,Granada,Málaga,Tenerife,Bilbao,Lérida,Cádiz,Santander,Valladolid,Pontevedra,Huelva,Burgos" },
  { line: 475, name: "Ladin", oldBase: "ladina,ladinb,ladinc,ladind,ladine,ladinf,lading,ladinh,ladini,ladinj,ladink,ladinl", newBase: "Ortisei,Selva di Cadore,Cortina d'Ampezzo,Predaia,Novella,Santa Lucia,Cortina,Cavalese,La Valle,Boves,Moena,Lozza,Zoldo" },
  { line: 481, name: "Llanito", oldBase: "llanitoa,llanitob,llanitoc,llanitod,llanitoe,llanitof,llanitog,llanitoh,llanitoi,llanitoj,llanitok,llanitol", newBase: "Llanes,Foix,Prades,Font-Romeu,Molitg-les-Bains,Perpignan,Viella de la Ròca,La Bastide,Caunes,Castel" },
  { line: 484, name: "Logudorese", oldBase: "logudoresea,logudoreseb,logudoresec,logudoresed,logudoresee,logudoresef,logudoreseg,logudoreseh,logudoresei,logudoresej,logudoresek,logudoresel", newBase: "Nuoro,Macomer,Sorgono,Orune,Terralba,Oliena,Bosa,Posada,Atzori" },
  { line: 486, name: "Moldavian", oldBase: "Chișinău,Bălți,Tiraspol,Bender,Călărași,Orhei,Soroca,Ungheni,Comrat,Edineț,Hîncești", newBase: "Chișinău,Bălți,Tiraspol,Bender,Călărași,Orhei,Soroca,Ungheni,Comrat,Edineț,Hîncești" },
  { line: 491, name: "Moselle Romance", oldBase: "moselleromance_metz,moselleromance_thionville,moselleromance_sarrebourg,moselleromance_sarreguemines,moselleromance_forbach,moselleromance_boulay,moselleromance_bouzonville,moselleromance_saintavold,moselleromance_bitche,moselleromance_chateau-salins,moselleromance_mo-selle,moselleromance_saulnois", newBase: "Metz,Thionville,Nancy,Châlons-en-Champagne,Troyes,Vesoul,Neufchâteau,Verdun,Remiremont,Scarpe,Val de Meuse" },
  { line: 492, name: "Murcian", oldBase: "Murcia,Cartagena,Lorca,Alicante,Elche,Orihuela,Albacete,Almansa", newBase: "Murcia,Cartagena,Lorca,Alicante,Elche,Orihuela,Albacete,Almansa" },
  { line: 500, name: "Murcian", oldBase: "Murcia,Cartagena,Lorca,Alicante,Elche,Orihuela,Albacete,Almansa", newBase: "Murcia,Cartagena,Lorca,Alicante,Elche,Orihuela,Albacete,Almansa" }
];

let fixed = 0;

fixes.forEach(fix => {
  const lineNum = fix.line - 1;
  if (lineNum >= 0 && lineNum < lines.length) {
    const oldLine = lines[lineNum];
    if (oldLine && oldLine.includes(fix.name)) {
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
  console.log(`\n✓ FIXED ${fixed} placeholders with authentic cities\n`);
} else {
  console.log('\nNo changes made\n');
}
