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
        if (!fs.existsSync(file)) continue;
        const src = fs.readFileSync(file, "utf8");
        vm.runInContext(src, context);
        
        let fileBases = [];
        if (file.includes('real')) fileBases = sandbox.window.realWorldNameBases || [];
        if (file.includes('fantasy')) fileBases = sandbox.window.fantasyNameBases || [];
        if (file.includes('creole')) fileBases = sandbox.window.creoleNameBases || [];
        
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
