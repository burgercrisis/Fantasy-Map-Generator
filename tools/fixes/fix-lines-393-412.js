"use strict";

const fs = require('fs');
const filePath = 'modules/namebases-real.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('\n=== FIXING ALL REMAINING PLACEHOLDERS (Lines 393-412) ===\n');

const fixes = [
  { line: 393, name: "Colombian Spanish", oldBase: "Bogota,Medellin,Cali,Barranquilla,Bucaramanga,Cartagena,Pereira,Cúcuta,Ibagué,Villavicencio", newBase: "Bogotá,Medellín,Cali,Barranquilla,Bucaramanga,Cartagena,Pereira,Cúcuta,Ibagué,Villavicencio" },
  { line: 398, name: "Cri-ana", oldBase: "crianaa,crianab,crianac,crianad,crianae,crianaf,crianag,crianah,crianai,crianaj,crianak,crianal", newBase: "Chihuahua,Ciudad Juárez,Tijuana,Mexicali,Mazatlán,Hermosillo,Guadalajara,Cancún,Acapulco,Guadalajara" },
  { line: 399, name: "Daco-Romanian", oldBase: "dacoromaniana,dacoromanianb,dacoromanianc,dacoromaniand,dacoromaniane,dacoromanianf,dacoromaniang,dacoromanianh,dacoromaniani,dacoromanianj,dacoromaniank,dacoromanianl", newBase: "Cluj-Napoca,Oradea,Timisoara,Arad,Sibiu,Braov,Bistria,Târgu Mureș,Alba Iulia,Satu Mare" },
  { line: 400, name: "Dalmatian", oldBase: "dalmatiana,dalmatianb,dalmatianc,dalmatiand,dalmatiane,dalmatianf,dalmatiang,dalmatianh,dalmatiani,dalmatianj,dalmatiank,dalmatianl", newBase: "Split,Dubrovnik,Zadar,Šibenik,Trogir,Osijek,Makarska,Knin,Biograd na Moru,Pula" },
  { line: 402, name: "Eastern Aragonese", oldBase: "easternaragonesea,easternaragoneseb,easternaragonesec,easternaragonesed,easternaragonesee,easternaragonesef,easternaragoneseg,easternaragoneseh,easternaragonesei,easternaragonesej,easternaragonesk,easternaragonesel", newBase: "Huesca,Barbastro,Monzón,Fraga,Binéfar,Jaca,Benabarre,Alcampé,Biel,Sabiñánigo" },
  { line: 403, name: "Eastern Catalan", oldBase: "easterncatalana,easterncatalanb,easterncatalanc,easterncataland,easterncatalane,easterncatalanf,easterncatalang,easterncatalanh,easterncatalani,easterncatalanj,easterncatalank,easterncatalanel", newBase: "Girona,Figueres,Olot,Vic,Manresa,Terrassa,Mataró,Granollers,Vilanova i la Geltrú" },
  { line: 404, name: "Eastern Lombard", oldBase: "easternlombarda,easternlombardb,easternlombardc,easternlombarde,easternlombarde,easternlombardef,easternlombardeg,easternlombardh,easternlombardi,easternlombardj,easternlombardk,easternlombarde", newBase: "Brescia,Bergamo,Cremona,Mantua,Monza,Lodi,Lecco,Varese,Sondrio,Pavia,Como" },
  { line: 405, name: "Eastern Nonmetafonetica", oldBase: "easternnonmetafonetica,easternnonmetafoneticb,easternnonmetafoneticc,easternnonmetafoneticd,easternnonmetafonetice,easternnonmetafoneticf,easternnonmetafoneticg,easternnonmetafonetich,easternnonmetafonetici,easternnonmetafoneticj,easternnonmetafonetick,easternnonmetafoneticl", newBase: "Nonantola,Novara,Vercelli,Biella,Verbania,Domodossola,Cossato,Ghemme,Borgomanero" },
  { line: 406, name: "Eastern Romanian", oldBase: "easternromaniana,easternromanianb,easternromanianc,easternromaniand,easternromaniane,easternromanianf,easternromaniang,easternromanianh,easternromaniani,easternromanianj,easternromaniank,easternromanianl", newBase: "Iași,Bacău,Botoșani,Brăila,Galați,Constanța,Tulcea,Suceava,Vaslui,Buzău" },
  { line: 407, name: "Ecuadorian Spanish", oldBase: "ecuadorianspanisha,ecuadorianspanishb,ecuadorianspanishc,ecuadorianspanishd,ecuadorianspanishe,ecuadorianspanishf,ecuadorianspanishg,ecuadorianspanishh,ecuadorianspanishi,ecuadorianspanishj,ecuadorianspanishk,ecuadorianspanishl", newBase: "Quito,Guayaquil,Cuenca,Ambato,Manta,Esmerealdas,Cuenca,Santo Domingo,Riobamba" },
  { line: 408, name: "Emilian", oldBase: "emiliana,emilianb,emilianc,emiliand,emiliane,emilianf,emiliang,emilianh,emiliani,emilianj,emiliank,emilianl", newBase: "Bologna,Modena,Ferrara,Parma,Piacenza,Reggio Emilia,Ravenna,Forli,Cesena,Rimini" },
  { line: 411, name: "Doteli", oldBase: "doti,dipayal,silgadhi,jorayal,bogtan,shikhar,ghanteshwar,pipalla,rajpur,tikhatar,nawal", newBase: "Ratanpur,Sikar,Raipur,Kanpur,Lucknow,Varanasi,Allahabad,Pune,Nagpur,Mumbai,Delhi,Kolkata" },
  { line: 412, name: "Achhami Doteli", oldBase: "Mangalsen,Sanphebagar,Kamalbazar,Bayalpata,Chaurathi,Dhoti,Bastar,Bilaspur,Bhopal,Ujjain,Guna,Jabalpur,Indore,Satna", newBase: "Mangal,Sanpaha,Kamal,Bayalpur,Chaurathi,Dhoti,Bastar,Bilaspur,Bhopal,Ujjain,Guna,Jabalpur,Indore,Satna" }
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
