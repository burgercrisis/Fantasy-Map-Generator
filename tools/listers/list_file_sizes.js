"use strict";
const fs = require('node:fs');
const path = require('node:path');

const dir = 'modules';
const files = fs.readdirSync(dir).filter(f => f.startsWith('namebases-') && f.endsWith('.js'));

console.log('File'.padEnd(40), 'Size (KB)');
console.log('-'.repeat(50));

files.forEach(file => {
    const stats = fs.statSync(path.join(dir, file));
    console.log(file.padEnd(40), (stats.size / 1024).toFixed(2));
});
