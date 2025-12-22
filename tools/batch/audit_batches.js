const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

const batch1 = [
  "kuril-ainu", "kuril-dialects", "kurukh", "kuvi", "kva", "kvx", "kwoma-manambu-pidgin", "kxu", "kyaka", "kyakhta-russian-chinese-pidgin", "kyowa-go", "kyv", "kyw", "kzi", "l-ngua-geral-paulista", "laal", "labrador-inuit-pidgin-french", "lachi", "laha", "lahu", "laiuse-romani", "lakota", "lampung", "land-dayak", "lanping-bai-dialect"
];

const batch2 = [
  "-azd-dialect", "-ejtun-dialect", "-sele", "aas-whistled", "abaza", "abba-gorgoryos", "abkhaz", "aboriginal-pidgin-english", "abruzzese", "acadian", "adeni-arabic", "adyghe", "aeolian", "aqc", "afar", "african-romance", "afrikaans", "afro-seminole-creole", "afroasiatic-family", "agalega-creole", "agaw", "ahom", "aiton", "ainu", "akan"
];

console.log('--- Batch 1 Audit ---');
batch1.forEach(iso => {
  const row = map.find(r => r.iso === iso);
  console.log(`${iso}: ${row ? JSON.stringify(row.bases) : 'NOT FOUND'}`);
});

console.log('\n--- Batch 2 Audit ---');
batch2.forEach(iso => {
  const row = map.find(r => r.iso === iso);
  console.log(`${iso}: ${row ? JSON.stringify(row.bases) : 'NOT FOUND'}`);
});
