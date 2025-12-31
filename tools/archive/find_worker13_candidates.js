const fs = require('fs');
const path = require('path');

function main() {
    const catalog = JSON.parse(fs.readFileSync('config/language-mixes.json', 'utf8'));
    const map = JSON.parse(fs.readFileSync('config/language-mixer-map.json', 'utf8'));

    const range = ['khun', 'khv', 'khw', 'kiautschou-pidgin-german', 'kiche', 'kichwa', 'kiga', 'kij', 'kija', 'kikai', 'kikar', 'kiknur', 'kikuyu', 'kildin-sami', 'kili', 'kim-mun', 'kimaama-kimaghama', 'kimre-language', 'kinyarwanda', 'kio', 'kiong-nai', 'kip', 'kir-balar-language', 'kiranti', 'kiribati', 'kirundi', 'kirya-konzal-language', 'kituba', 'kiwai', 'kiwaian', 'kjq', 'kkn', 'kkt', 'klb', 'kle', 'klon', 'klr', 'kls'];

    const results = {
        candidates: [],
        missing_map: [],
        no_uniq_base: []
    };

    const baseUseCount = new Map();
    for (const entry of map) {
        if (!entry.bases) continue;
        for (const b of entry.bases) {
            if (typeof b === 'number') {
                baseUseCount.set(b, (baseUseCount.get(b) || 0) + 1);
            }
        }
    }

    for (const iso of range) {
        const catalogEntry = catalog.find(e => e.iso === iso);
        if (!catalogEntry) continue;

        const mapEntry = map.find(e => e.iso === iso);
        if (!mapEntry) {
            results.missing_map.push({ iso, name: catalogEntry.name });
            continue;
        }

        const uniqueBases = mapEntry.bases.filter(b => typeof b === 'number' && baseUseCount.get(b) === 1);
        if (uniqueBases.length === 0) {
            results.no_uniq_base.push({
                iso,
                name: catalogEntry.name,
                bases: mapEntry.bases
            });
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

main();
