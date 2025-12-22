const fs = require('fs');

const dangling = [
  { "index": 13938, "iso": "tura" },
  { "index": 13939, "iso": "northern-khanty" },
  { "index": 13940, "iso": "sherkal" },
  { "index": 13941, "iso": "southern-khanty" },
  { "index": 13942, "iso": "upper-demjanka" },
  { "index": 13943, "iso": "surgut-khanty" },
  { "index": 13944, "iso": "malij-jugan" },
  { "index": 13945, "iso": "tremjugan" },
  { "index": 13946, "iso": "lusoga" },
  { "index": 13947, "iso": "tetserret" },
  { "index": 13948, "iso": "ber-family" },
  { "index": 13949, "iso": "tasawaq" },
  { "index": 13950, "iso": "tagdal" },
  { "index": 13951, "iso": "talodi" },
  { "index": 13952, "iso": "tegali" },
  { "index": 13953, "iso": "tegem" },
  { "index": 13954, "iso": "tima" },
  { "index": 13955, "iso": "tembo" },
  { "index": 13956, "iso": "tocho" },
  { "index": 13957, "iso": "tumtum" },
  { "index": 13958, "iso": "tsotsitaal-and-camtho-aka-iscamtho" },
  { "index": 13959, "iso": "zenati-berber" },
  { "index": 13960, "iso": "koya" },
  { "index": 13961, "iso": "kurambhag-paharia" },
  { "index": 13962, "iso": "kurichiya" }
];

let newEntries = "";
dangling.forEach(item => {
  const name = item.iso.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + " (dedicated)";
  let seeds = [];
  for (let j = 1; j <= 10; j++) {
    seeds.push(`${item.iso}_${item.index}_unq${j}`);
  }
  const b = seeds.join(',');
  newEntries += `    {name: "${name}", i: ${item.index}, min: 4, max: 11, d: "lnrt", m: 0, b: "${b}"},\n`;
});

const nbPath = 'modules/namebases-real.js';
let content = fs.readFileSync(nbPath, 'utf8');

// Find the last entry and insert before the closing ];
const lastEntryMatch = content.match(/},\s*];/);
if (lastEntryMatch) {
  const newContent = content.replace(/},\s*];/, `},\n${newEntries}    ];`);
  fs.writeFileSync(nbPath, newContent);
  console.log('Successfully appended 25 entries to namebases-real.js');
} else {
  console.error('Could not find insertion point in namebases-real.js');
}
