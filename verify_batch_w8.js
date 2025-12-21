const fs = require('fs');
const path = require('path');

const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const targetIsos = [
  "jpn-lang",
  "judeo-berber",
  "juk-bahnaric",
  "jul",
  "kam-tai",
  "kamang",
  "kamasa",
  "kamassian-proper",
  "kambaira",
  "kamberau"
];

console.log(`Found ${targetIsos.length} targets.`);

const allBaseArrays = new Map();
map.forEach(item => {
  const key = JSON.stringify(item.bases.sort((a, b) => a - b));
  if (!allBaseArrays.has(key)) allBaseArrays.set(key, []);
  allBaseArrays.get(key).push(item.iso);
});

let allUnique = true;
targetIsos.forEach(iso => {
  const item = map.find(i => i.iso === iso);
  if (!item) {
    console.log(`${iso}: NOT FOUND`);
    allUnique = false;
    return;
  }
  const key = JSON.stringify(item.bases.sort((a, b) => a - b));
  const colliders = allBaseArrays.get(key);
  if (colliders.length > 1) {
    console.log(`${iso}: COLLISION with ${colliders.filter(i => i !== iso).join(', ')}`);
    allUnique = false;
  } else {
    console.log(`${iso}: UNIQUE`);
  }
});

if (allUnique) {
  console.log("All targets have globally unique base arrays among the mapped languages.");
} else {
  console.log("Some targets still have collisions.");
}
