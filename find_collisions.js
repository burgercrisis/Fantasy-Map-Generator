const fs = require('fs');
const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));
const clusters = {};
map.forEach(e => {
    const key = JSON.stringify(e.bases);
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(e.iso);
});
const collisions = Object.entries(clusters).filter(([k, v]) => v.length > 1);
collisions.forEach(([k, v]) => {
    console.log(`${k}: ${v.join(', ')}`);
});
