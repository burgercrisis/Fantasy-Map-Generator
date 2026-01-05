const fs = require('fs');
const path = require('path');

const africaPath = path.join(__dirname, '../modules/namebases-africa.js');
let content = fs.readFileSync(africaPath, 'utf8');

const reassignments = {
  // Regular range collisions
  311: 616,
  356: 617,
  357: 630,
  358: 631,
  359: 632,
  361: 633,
  362: 634,
  364: 640,
  2429: 648,

  // Dedicated range collisions
  20006: 20009,
  20007: 20088,
  20008: 20220,
  20017: 20221,
  20019: 20222,
  20026: 20227,
  20030: 20228,
  20032: 20229,
  20045: 20230,
  20061: 20231
};

for (const [oldIdx, newIdx] of Object.entries(reassignments)) {
  const regex = new RegExp(`"i":\\s*${oldIdx},`, 'g');
  content = content.replace(regex, `"i": ${newIdx},`);
}

fs.writeFileSync(africaPath, content);
console.log('Resolved remaining 19 collisions in namebases-africa.js');
