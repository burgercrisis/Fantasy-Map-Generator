const fs = require('fs');
const path = require('path');

const mapPath = path.resolve('config/language-mixer-map.json');
const nbPath = path.resolve('modules/namebases-real.js');
const isosPath = path.resolve('all_failed_isos.json');
const catalogPath = path.resolve('config/language-mixes.json'); // catalog is here

function processBatch(batchSize = 500) {
    if (!fs.existsSync(isosPath)) {
        console.error('No all_failed_isos.json found');
        return;
    }

    const allIsos = JSON.parse(fs.readFileSync(isosPath, 'utf8'));
    if (allIsos.length === 0) {
        console.log('All ISOs processed!');
        return;
    }

    const isosToProcess = allIsos.slice(0, batchSize);
    const remainingIsos = allIsos.slice(batchSize);

    // Load map
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    
    // Load namebases
    let nbContent = fs.readFileSync(nbPath, 'utf8');
    
    // Find current max index
    const matches = nbContent.match(/i: (\d+)/g);
    const indices = matches ? matches.map(m => parseInt(m.match(/\d+/)[0])) : [0];
    const startIdx = Math.max(...indices) + 1;
    console.log(`Processing ${isosToProcess.length} ISOs starting from index ${startIdx}`);

    // Load catalog for names
    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const catalog = catalogData.catalog || [];

    let newNbEntries = "";
    
    isosToProcess.forEach((iso, i) => {
        const newIdx = startIdx + i;
        
        // Find name in catalog
        const catEntry = catalog.find(c => c.iso === iso);
        let displayName = iso;
        if (catEntry && catEntry.name) {
            displayName = catEntry.name;
        } else {
            // fallback: capitalize and remove dashes
            displayName = iso.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        const name = `${displayName} (dedicated)`;
        
        // Generate 10 unique seeds
        let seeds = [];
        for (let j = 1; j <= 10; j++) {
            // format: iso_index_unqN
            seeds.push(`${iso}_${newIdx}_unq${j}`);
        }
        const b = seeds.join(',');
        
        newNbEntries += `    {name: "${name}", i: ${newIdx}, min: 4, max: 11, d: "lnrt", m: 0, b: "${b}"},\n`;
        
        // Update map
        const mapEntry = map.find(e => e.iso === iso);
        if (mapEntry) {
            // Remove any existing numeric indices (they might be old/broken)
            mapEntry.bases = mapEntry.bases.filter(b => typeof b !== 'number');
            mapEntry.bases.push(newIdx);
        } else {
            map.push({ iso, bases: [newIdx] });
        }
    });

    // Insert into namebases-real.js before the closing bracket
    const lastBracketIdx = nbContent.lastIndexOf('];');
    if (lastBracketIdx === -1) {
        console.error('Could not find end of array in namebases-real.js');
        return;
    }
    
    const updatedNbContent = nbContent.slice(0, lastBracketIdx) + newNbEntries + nbContent.slice(lastBracketIdx);
    
    fs.writeFileSync(nbPath, updatedNbContent);
    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
    fs.writeFileSync(isosPath, JSON.stringify(remainingIsos, null, 2));

    console.log(`Updated ${nbPath}`);
    console.log(`Updated ${mapPath}`);
    console.log(`Updated ${isosPath}, ${remainingIsos.length} remaining.`);
}

processBatch(500);
