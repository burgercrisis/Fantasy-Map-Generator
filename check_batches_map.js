const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const batch1 = [
  "kuril-ainu", "kuril-dialects", "kurukh", "kuvi", "kva", "kvx", "kwoma-manambu-pidgin", "kxu", "kyaka", "kyakhta-russian-chinese-pidgin", "kyowa-go", "kyv", "kyw", "kzi", "l-ngua-geral-paulista", "laal", "labrador-inuit-pidgin-french", "lachi", "laha", "lahu", "laiuse-romani", "lakota", "lampung", "land-dayak", "lanping-bai-dialect"
];

const batch2 = [
  "-azd-dialect", "-en-scots", "-et-dialect", "-id-dialect", "-it-dialect",
  "-jv-dialect", "-la-dialect", "-ml-dialect", "-ms-dialect", "-my-dialect",
  "-pl-dialect", "-pt-dialect", "-sv-dialect", "-th-dialect", "-tr-dialect",
  "-uk-dialect", "-vi-dialect", "-zh-dialect", "aa", "aa-dialect", "ab",
  "ab-dialect", "ace", "ace-dialect", "ach"
];

console.log('Batch 1 Map Status:');
batch1.forEach(iso => {
  const row = map.find(r => r.iso === iso);
  console.log(`${iso}: ${row ? JSON.stringify(row.bases) : 'NOT_FOUND'}`);
});

console.log('\nBatch 2 Map Status:');
batch2.forEach(iso => {
  const row = map.find(r => r.iso === iso);
  console.log(`${iso}: ${row ? JSON.stringify(row.bases) : 'NOT_FOUND'}`);
});
