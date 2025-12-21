const fs = require('fs');
const path = require('path');

const mapPath = path.resolve(__dirname, 'config', 'language-mixer-map.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const isos = [
    "tura", "northern-khanty", "sherkal", "southern-khanty", "upper-demjanka",
    "surgut-khanty", "malij-jugan", "tremjugan", "lusoga", "tetserret",
    "ber-family", "tasawaq", "tagdal", "talodi", "tegali",
    "tegem", "tima", "tembo", "tocho", "tumtum",
    "tsotsitaal-and-camtho-aka-iscamtho", "zenati-berber", "koya", "kurambhag-paharia", "kurichiya"
];

const results = map.filter(row => isos.includes(row.iso));
console.log(JSON.stringify(results, null, 2));
