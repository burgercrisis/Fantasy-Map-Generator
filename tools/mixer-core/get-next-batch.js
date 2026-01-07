/**
 * Next Batch ISO Selector
 *
 * Analyzes language mixer seed uniqueness report and extracts target ISOs
 * for the next remediation batch (limited to 25 entries).
 *
 * Usage:
 *   node tools/mixer-core/get-next-batch.js
 *
 * Output:
 *   JSON array of ISO codes with NO_UNIQ_BASE status
 */

const { execSync } = require('child_process');
const fs = require('fs');

const report = execSync('node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=1000').toString();
const lines = report.split('\n');
const targetIsos = [];

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('NO_UNIQ_BASE')) {
        const iso = lines[i].split('|')[0].trim();
        targetIsos.push(iso);
    }
    if (targetIsos.length >= 25) break;
}

console.log(JSON.stringify(targetIsos, null, 2));
