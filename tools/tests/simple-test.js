console.log("SCRIPT EXECUTED");
const fs = require("fs");
const p = require("path");
const root = "E:\\code\\Fantasy-Map-Generator";
const out = root + "\\output.txt";
fs.writeFileSync(out, "Test output here\n");
console.log("Done!");