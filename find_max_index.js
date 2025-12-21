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
        path.join(root, "modules", "namebases-real.js"),
        path.join(root, "modules", "namebases-fantasy.js"),
        path.join(root, "modules", "namebases-creole.js")
    ];

    const allBases = [];
    for (const file of files) {
        const src = fs.readFileSync(file, "utf8");
        vm.runInContext(src, context);
        // Each file populates a different window property usually
        if (file.includes('real')) allBases.push(...(sandbox.window.realWorldNameBases || []));
        if (file.includes('fantasy')) allBases.push(...(sandbox.window.fantasyNameBases || []));
        if (file.includes('creole')) allBases.push(...(sandbox.window.creoleNameBases || []));
    }
    return allBases;
}

const bases = loadBases();
let maxI = 0;
const indexMap = new Map();
const collisions = [];

for (const b of bases) {
    if (!b || typeof b.i !== 'number') continue;
    if (b.i > maxI) maxI = b.i;
    if (indexMap.has(b.i)) {
        collisions.push({ i: b.i, first: indexMap.get(b.i).name, second: b.name });
    } else {
        indexMap.set(b.i, b);
    }
}

console.log(`Max Index: ${maxI}`);
console.log(`Total Collisions: ${collisions.length}`);
if (collisions.length > 0) {
    console.log("First 10 collisions:");
    console.log(JSON.stringify(collisions.slice(0, 10), null, 2));
}
