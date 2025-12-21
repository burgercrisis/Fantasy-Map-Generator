const fs = require('fs');
const path = require('path');

const deltaPath = path.join(process.cwd(), 'tools', 'mixer-deltas', '2025-12-21-triage-batch-1.json');
const data = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));

// Batch 1 starts at index 14000
let nextIndex = 14000;

data.forEach(item => {
    // Remove any index >= 14000 and add the new one
    item.bases = item.bases.filter(b => b < 14000);
    item.bases.push(nextIndex++);
});

fs.writeFileSync(deltaPath, JSON.stringify(data, null, 2));
console.log('Updated Batch 1 delta file with correct contiguous indices (14000-14024)');
