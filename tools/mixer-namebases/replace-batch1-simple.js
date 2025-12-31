#!/usr/bin/env node

// Direct replacement without bash dependencies
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../modules/namebases-real.js');
const content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
  {
    search: '{ name: "Chakato language (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }',
    replace: '{ name: "Chakato language (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Mobile,Pascagoula,Biloxi,Pensacola,Pascagoula,Dauphin Island,Mobile Bay,Biloxi Bay,Pensacola Bay,Mobile Bay,Pascagoula River,Biloxi River,Pensacola River,Mobile River,Pensacola River,Pascagoula River,Choctawhatchee,Escambia,Yellow River,Conecuh,Perdido,Tensaw,Mobile,Tensaw River,Escambia River,Choctawhatchee River" }'
  },
  {
    search: '{ name: "Chaldean Neo-Aramaic (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }',
    replace: '{ name: "Chaldean Neo-Aramaic (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Baghdad,Basra,Mosul,Kirkuk,Erbil,Duhok,Akre,Zakho,Amadiyah,Behdinnan,Semel,Koy Sanjaq,Sinja,Duhok,Zakho,Akre,Erbil,Kirkuk,Basra,Mosul,Baghdad,Balad,Samarra,Baqubah,Kut,Nasiriyah,Amara,Diwaniyah,Karbala,Hilla,Kufa,Najaf,Hilla,Babylon,Karbala,Najaf" }'
  },
  {
    search: '{ name: "Chamdo (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }',
    replace: '{ name: "Chamdo (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Chamdo,Bangda,Jomda,Gongbogyamda,Dagze,Riwoqe,Konjo,Markam,Zogang,Chamdo County,Bangda County,Jomda County,Gongbogyamda County,Dagze County,Riwoqe County,Konjo County,Markam County,Zogang County,Baxoi,Lhorong,Banbar,Dengqen,Pala,Zhagyab,Jiacha,Qusum,Baxoi County" }'
  },
  {
    search: '{ name: "Chakhar (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }',
    replace: '{ name: "Chakhar (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Choibalsan,Ulaanbaatar,Darkhan,Erdenet,Bulgan,Selenge,Khentii,Arkhangai,Ovorkhangai,Uvurkhangai,Dundgovi,Arkhangai Province,Ovorkhangai Province,Dundgovi Province,Selenge Province,Khentii Province,Bulgan Province,Erdenet City,Darkhan City,Ulaanbaatar City,Choibalsan City,Tsetserleg,Moron,Tsetserleg" }'
  },
  {
    search: '{ name: "Tibeto-Kanauri (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }',
    replace: '{ name: "Tibeto-Kanauri (dedicated)", i: 8561, min: 4, max: 11, d: "lnrt", m: 0, b: "Lhasa,Shigatse,Nyingchi,Chamdo,Nagqu,Ngari,Lhokha,Shannan,Shigatse City,Lhasa City,Chamdo City,Nyingchi City,Nagqu City,Ngari Prefecture,Lhokha City,Shannan City,Gyantse,Shigatse,Tsedang,Nagqu,Shigatse City,Shannan,Nyingchi Prefecture,Lhasa Prefecture" }'
  }
];

let newContent = content;
let count = 0;

replacements.forEach(repl => {
  if (newContent.includes(repl.search)) {
    newContent = newContent.replace(repl.search, repl.replace);
    count++;
    console.log(`Replaced: ${repl.search.substring(10, 40)}...`);
  }
});

if (count > 0) {
  const backupPath = filePath + '.backup-before-batch1';
  fs.writeFileSync(backupPath, content);
  fs.writeFileSync(filePath, newContent);
  console.log(`\n✅ Made ${count} replacements`);
  console.log(`📦 Backup: ${backupPath}`);
  console.log(`📄 Updated: ${filePath}`);
} else {
  console.log('No matching entries found');
  console.log('Entries might have different formatting or not exist');
}
