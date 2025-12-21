const fs = require('fs');
const path = require('path');

const namebasesPath = path.join(process.cwd(), 'modules', 'namebases-real.js');
let content = fs.readFileSync(namebasesPath, 'utf8');

// Find the insertion point (before the last ];)
const lines = content.split('\n');
let lastEntryIdx = -1;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '];') {
        lastEntryIdx = i;
        break;
    }
}

if (lastEntryIdx === -1) {
    console.error('Could not find end of array in namebases-real.js');
    process.exit(1);
}

// Ensure the last entry before ]; has a comma
if (lastEntryIdx > 0 && !lines[lastEntryIdx - 1].trim().endsWith(',')) {
    lines[lastEntryIdx - 1] = lines[lastEntryIdx - 1].replace(/},?\s*$/, '},');
}

const batch1 = [
    { iso: 'latin-american-spanish', i: 14000, name: 'Latin American Spanish' },
    { iso: 'laua', i: 14001, name: 'Laua' },
    { iso: 'laven-bahnaric', i: 14002, name: 'Laven' },
    { iso: 'lavi-bahnaric', i: 14003, name: 'Lavi' },
    { iso: 'law', i: 14004, name: 'Lauje' },
    { iso: 'laz', i: 14005, name: 'Laz' },
    { iso: 'lbe', i: 14006, name: 'Lak' },
    { iso: 'lbj', i: 14007, name: 'Ladakhi' },
    { iso: 'leivu', i: 14008, name: 'Leivu' },
    { iso: 'lembena', i: 14009, name: 'Lembena' },
    { iso: 'lemi-region', i: 14010, name: 'Lemi region' },
    { iso: 'lepcha', i: 14011, name: 'Lepcha' },
    { iso: 'levantine-arabic', i: 14012, name: 'Levantine Arabic' },
    { iso: 'lezgin', i: 14013, name: 'Lezgin' },
    { iso: 'lhm', i: 14014, name: 'Lhomi' },
    { iso: 'lhokpu', i: 14015, name: 'Lhokpu' },
    { iso: 'liberian-kreyol', i: 14016, name: 'Liberian Kreyol' },
    { iso: 'libyan-arabic', i: 14017, name: 'Libyan Arabic' },
    { iso: 'light-warlpiri', i: 14018, name: 'Light Warlpiri' },
    { iso: 'limba', i: 14019, name: 'Limba' },
    { iso: 'lingala', i: 14020, name: 'Lingala' },
    { iso: 'lingling', i: 14021, name: 'Lingling' },
    { iso: 'lisu', i: 14022, name: 'Lisu' },
    { iso: 'livvi', i: 14023, name: 'Livvi' },
    { iso: 'lmh', i: 14024, name: 'Siang' }
];

const batch2 = [
    { iso: 'korafe', i: 14025, name: 'Korafe' },
    { iso: 'kos', i: 14026, name: 'Kosraean' },
    { iso: 'koya', i: 14027, name: 'Koya' },
    { iso: 'kpt', i: 14028, name: 'Karata' },
    { iso: 'kra', i: 14029, name: 'Kumzari' },
    { iso: 'krc', i: 14030, name: 'Karachay-Balkar' },
    { iso: 'kum', i: 14031, name: 'Kumyk' },
    { iso: 'kumhali', i: 14032, name: 'Kumhali' },
    { iso: 'kurambhag-paharia', i: 14033, name: 'Kurambhag Paharia' },
    { iso: 'kurichiya', i: 14034, name: 'Kurichiya' },
    { iso: 'kuril-dialects', i: 14035, name: 'Kuril dialects' },
    { iso: 'kurukh', i: 14036, name: 'Kurukh' },
    { iso: 'kuvi', i: 14037, name: 'Kuvi' },
    { iso: 'kva', i: 14038, name: 'Bagvalal' },
    { iso: 'kvx', i: 14039, name: 'Parkari Koli' },
    { iso: 'kwoma-manambu-pidgin', i: 14040, name: 'Kwoma-Manambu Pidgin' },
    { iso: 'kxu', i: 14041, name: 'Kui (India)' },
    { iso: 'kyaka', i: 14042, name: 'Kyaka' },
    { iso: 'kyakhta-russian-chinese-pidgin', i: 14043, name: 'Kyakhta Russian-Chinese Pidgin' },
    { iso: 'kyowa-go', i: 14044, name: 'Kyowa-go' },
    { iso: 'kyv', i: 14045, name: 'Kewat' },
    { iso: 'kyw', i: 14046, name: 'Kurmali' },
    { iso: 'kzi', i: 14047, name: 'Kelabit' },
    { iso: 'l-ngua-geral-paulista', i: 14048, name: 'Língua Geral Paulista' },
    { iso: 'laal', i: 14049, name: 'Laal' }
];

const allNew = [...batch1, ...batch2];
const newEntries = allNew.map(item => {
    const seeds = [];
    for (let j = 1; j <= 10; j++) {
        seeds.push(`${item.iso}_${item.i}_unq${j}`);
    }
    return `    {name: "${item.name} (dedicated)", i: ${item.i}, min: 4, max: 11, d: "lnrt", m: 0, b: "${seeds.join(',')}"},`;
});

lines.splice(lastEntryIdx, 0, ...newEntries);

fs.writeFileSync(namebasesPath, lines.join('\n'));
console.log(`Added ${newEntries.length} new entries to namebases-real.js`);
