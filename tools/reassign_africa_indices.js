const fs = require('fs');
const path = require('path');

const africaPath = path.join(__dirname, '../modules/namebases-africa.js');
let content = fs.readFileSync(africaPath, 'utf8');

const regularReassignments = {
  376: 41,
  377: 81,
  378: 137,
  379: 398,
  384: 435,
  390: 437,
  391: 454,
  392: 475,
  393: 479,
  591: 487,
  824: 490,
  945: 492,
  948: 497,
  1330: 500,
  1493: 501,
  1503: 510,
  1505: 511,
  1506: 526,
  1601: 530,
  1602: 542,
  1604: 543,
  1606: 544,
  2006: 545,
  2007: 546,
  2008: 566,
  2009: 580,
  2014: 581,
  2029: 582,
  2031: 583,
  2319: 584,
  2320: 585,
  2321: 596,
  2420: 608,
  2427: 610,
  2428: 611,
  2430: 612,
  2431: 613,
  2432: 614,
  2433: 615
};

const dedicatedReassignments = {
  2015: 20001,
  2016: 20002,
  2017: 20003,
  2018: 20004,
  2019: 20006,
  2020: 20007,
  2021: 20008,
  2022: 20017,
  2023: 20019,
  2024: 20026,
  2025: 20030,
  2026: 20032,
  2738: 20045,
  2743: 20061
};

// Apply regular reassignments
for (const [oldIdx, newIdx] of Object.entries(regularReassignments)) {
  const regex = new RegExp(`"i":\\s*${oldIdx},`, 'g');
  content = content.replace(regex, `"i": ${newIdx},`);
}

// Apply dedicated reassignments
for (const [oldIdx, newIdx] of Object.entries(dedicatedReassignments)) {
  const regex = new RegExp(`"i":\\s*${oldIdx},`, 'g');
  content = content.replace(regex, `"i": ${newIdx},`);
}

fs.writeFileSync(africaPath, content);
console.log('Reassigned indices in namebases-africa.js');
