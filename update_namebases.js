const fs = require('fs');
const path = require('path');

const namebasesPath = path.resolve(__dirname, 'modules', 'namebases-real.js');
let content = fs.readFileSync(namebasesPath, 'utf8');

const isos = [
    "-azd-dialect", "-ejtun-dialect", "-sele", "aas-whistled", "abaza",
    "abba-gorgoryos", "abkhaz", "aboriginal-pidgin-english", "abruzzese", "acadian",
    "adeni-arabic", "adyghe", "aeolian", "aqc", "afar",
    "african-romance", "afrikaans", "afro-seminole-creole", "afroasiatic-family", "agalega-creole",
    "agaw", "ahom", "aiton", "ainu", "akan"
];

const startIdx = 13963;

let newEntries = "";
isos.forEach((iso, i) => {
    const idx = startIdx + i;
    const name = iso.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + " (dedicated)";
    
    let seeds = [];
    for (let j = 1; j <= 10; j++) {
        seeds.push(`${iso}_${idx}_unq${j}`);
    }
    const b = seeds.join(',');
    
    newEntries += `      {name: "${name}", i: ${idx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${b}"},\n`;
});

// Find the last entry before ];
const lastEntryMatch = content.lastIndexOf('},');
if (lastEntryMatch !== -1) {
    const insertPos = content.indexOf('\n', lastEntryMatch) + 1;
    const updatedContent = content.slice(0, insertPos) + newEntries + content.slice(insertPos);
    fs.writeFileSync(namebasesPath, updatedContent);
    console.log(`Appended 25 entries to namebases-real.js starting from index ${startIdx}`);
} else {
    console.error("Could not find insertion point in namebases-real.js");
}
