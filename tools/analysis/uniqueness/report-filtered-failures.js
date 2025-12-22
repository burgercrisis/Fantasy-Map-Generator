const { execSync } = require('child_process');

try {
    console.log('Running seed uniqueness report...');
    const output = execSync('pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=5000', { 
        encoding: 'utf8', 
        maxBuffer: 100 * 1024 * 1024 
    });
    
    const lines = output.split('\n');
    let failures = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('|') && line.includes('map')) {
            // Check if it's a "fixable" failure (has uniqBase)
            if (line.includes('|uniqBase') && (line.includes('|strict<1') || line.includes('|norm<10'))) {
                const parts = line.split('|').map(p => p.trim());
                const iso = parts[0];
                const name = parts[1];
                
                // Get next line for more details
                let details = '';
                if (i + 1 < lines.length) {
                    details = lines[i+1].trim();
                }
                
                failures.push({
                    iso,
                    name,
                    line,
                    details
                });
            }
        }
    }
    
    console.log(`Found ${failures.length} fixable failures (have unique bases but fail thresholds):`);
    console.log('ISO | Name | Status | Details');
    console.log('--- | --- | --- | ---');
    failures.forEach(f => {
        const status = f.line.split('|').slice(3).join(' | ');
        console.log(`${f.iso} | ${f.name} | ${status} | ${f.details}`);
    });

} catch (e) {
    console.error('Error running report:', e.message);
}
