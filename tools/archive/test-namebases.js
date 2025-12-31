try {
    require('../modules/namebases-real.js');
    console.log('SUCCESS: File loaded without errors!');
} catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
}
