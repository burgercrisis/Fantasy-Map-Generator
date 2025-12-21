const fs = require('fs');

const batch2 = JSON.parse(fs.readFileSync('tools/mixer-deltas/2025-12-21-triage-batch-2.json', 'utf8'));

const namesMap = {
  "korafe": "Korafe",
  "kos": "Kosraean",
  "koya": "Koya",
  "kpt": "Karata",
  "kra": "Kumhali",
  "krc": "Karachay-Balkar",
  "kum": "Kumyk",
  "kumhali": "Kumhali (alias)",
  "kurambhag-paharia": "Kurambhag Paharia",
  "kurichiya": "Kurichiya",
  "kuril-dialects": "Kuril dialects",
  "kurukh": "Kurukh",
  "kuvi": "Kuvi",
  "kva": "Bagvalal",
  "kvx": "Parkari Koli",
  "kwoma-manambu-pidgin": "Kwoma-Manambu Pidgin",
  "kxu": "Kui (India)",
  "kyaka": "Kyaka",
  "kyakhta-russian-chinese-pidgin": "Kyakhta Russian-Chinese Pidgin",
  "kyowa-go": "Kyowa-go",
  "kyv": "Kayve",
  "kyw": "Kudmali",
  "kzi": "Kelon",
  "l-ngua-geral-paulista": "Língua Geral Paulista",
  "laal": "Laal"
};

let appendString = "";
for (const item of batch2) {
    const iso = item.iso;
    const index = item.bases[item.bases.length - 1];
    const name = namesMap[iso] || (iso.charAt(0).toUpperCase() + iso.slice(1));
    
    const seeds = [];
    for (let j = 1; j <= 10; j++) {
        seeds.push(`${iso}_${index}_unq${j}`);
    }
    
    appendString += `    {name: "${name} (dedicated)", i: ${index}, min: 4, max: 11, d: "lnrt", m: 0, b: "${seeds.join(',')}"},\n`;
}

console.log(appendString);
fs.writeFileSync('tools/mixer-core/append-batch-2.txt', appendString);
