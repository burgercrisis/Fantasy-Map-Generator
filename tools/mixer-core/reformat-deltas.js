const fs = require('fs');
const path = require('path');

const deltasDir = path.join(process.cwd(), 'tools', 'mixer-deltas');
const files = ['2025-12-21-triage-batch-1.json', '2025-12-21-triage-batch-2.json'];

files.forEach(file => {
    const filePath = path.join(deltasDir, file);
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // If it's already in the correct format, skip
    if (!Array.isArray(data)) return;

    const newFormat = {
        setBases: {}
    };

    data.forEach(item => {
        newFormat.setBases[item.iso] = item.bases;
    });

    fs.writeFileSync(filePath, JSON.stringify(newFormat, null, 2));
    console.log(`Converted ${file} to correct format for apply-mixer-deltas.js`);
});
