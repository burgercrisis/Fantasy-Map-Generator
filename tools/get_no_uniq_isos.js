const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPriorityIsos() {
    console.error('Running diagnostics...');
    const output = execSync('node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=200').toString();
    console.error('Diagnostics finished.');
    const lines = output.split('\n');
    const isos = [];
    
    // Priority 1: NO_MAP
    for (const line of lines) {
        if (line.includes('|') && line.includes('NO_MAP')) {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length >= 3) {
                isos.push({ iso: parts[0], name: parts[1], status: parts.slice(2).join(' | '), priority: 1 });
            }
        }
        if (isos.length >= 25) break;
    }

    // Priority 2: NO_UNIQ_BASE
    if (isos.length < 25) {
        for (const line of lines) {
            if (line.includes('|') && line.includes('NO_UNIQ_BASE')) {
                const parts = line.split('|').map(s => s.trim());
                if (parts.length >= 3) {
                    const iso = parts[0];
                    if (!isos.find(i => i.iso === iso)) {
                        isos.push({ iso: parts[0], name: parts[1], status: parts.slice(2).join(' | '), priority: 2 });
                    }
                }
            }
            if (isos.length >= 25) break;
        }
    }

    // Priority 3: Quality Debt (strict<1 or norm<10)
    if (isos.length < 25) {
        for (const line of lines) {
            if (line.includes('|') && (line.includes('strict<') || line.includes('norm<'))) {
                const parts = line.split('|').map(s => s.trim());
                if (parts.length >= 3) {
                    const iso = parts[0];
                    if (!isos.find(i => i.iso === iso)) {
                        isos.push({ iso: parts[0], name: parts[1], status: parts.slice(2).join(' | '), priority: 3 });
                    }
                }
            }
            if (isos.length >= 25) break;
        }
    }

    console.error(`Found ${isos.length} priority ISOs.`);
    return isos;
}

const priorityIsos = getPriorityIsos();
fs.writeFileSync('priority_isos.json', JSON.stringify(priorityIsos, null, 2));
console.log('Done.');
