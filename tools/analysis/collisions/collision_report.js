/**
 * The `loadBases` function reads and processes name bases from different modules to identify and log
 * any index collisions.
 * @returns The `loadBases` function is returning an array of objects representing all the name bases
 * loaded from the specified files. Each object in the array contains information about a name base,
 * such as its index (`i`), name, and the source file it was loaded from.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadBases() {
    const root = process.cwd();
    const sandbox = { window: {}, module: { exports: {} }, exports: {}, console, nameBases: [] };
    sandbox.exports = sandbox.module.exports;
    sandbox.globalThis = sandbox;
    const context = vm.createContext(sandbox);

    const files = [
        path.join(root, "modules", "namebases-europe.js"),
        path.join(root, "modules", "namebases-africa.js"),
        path.join(root, "modules", "namebases-asia.js"),
        path.join(root, "modules", "namebases-northAmerica.js"),
        path.join(root, "modules", "namebases-southAmerica.js"),
        path.join(root, "modules", "namebases-oceania.js"),
        path.join(root, "modules", "namebases-fantasy.js")
    ];

    const allBases = [];
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        const src = fs.readFileSync(file, "utf8");
        vm.runInContext(src, context);
        
        let fileBases = [];
        if (file.includes('europe')) fileBases = sandbox.window.EuropeNameBases || [];
        if (file.includes('africa')) fileBases = sandbox.window.AfricaNameBases || [];
        if (file.includes('asia')) fileBases = sandbox.window.AsiaNameBases || [];
        if (file.includes('northAmerica')) fileBases = sandbox.window.NorthAmericaNameBases || [];
        if (file.includes('southAmerica')) fileBases = sandbox.window.SouthAmericaNameBases || [];
        if (file.includes('oceania')) fileBases = sandbox.window.OceaniaNameBases || [];
        if (file.includes('fantasy')) fileBases = sandbox.window.fantasyNameBases || [];
        
        fileBases.forEach(b => {
            if (b && typeof b.i === 'number') {
                allBases.push({ ...b, sourceFile: path.basename(file) });
            }
        });
    }
    return allBases;
}

const bases = loadBases();
const indexMap = new Map();
const collisions = [];

for (const b of bases) {
    if (indexMap.has(b.i)) {
        const first = indexMap.get(b.i);
        collisions.push({
            i: b.i,
            first: { name: first.name, file: first.sourceFile },
            second: { name: b.name, file: b.sourceFile }
        });
    } else {
        indexMap.set(b.i, b);
    }
}

console.log(JSON.stringify(collisions, null, 2));
