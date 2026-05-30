const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const results = [];

// Read JSON file
const jsonPath = path.join(__dirname, "config/language-mixer-map.json");
const jsonData = fs.readFileSync(jsonPath, "utf8");
const jsonMap = JSON.parse(jsonData);
results.push("JSON first entry: " + JSON.stringify(jsonMap[0]));

// Run generator
try {
  const genPath = path.join(__dirname, "tools/mixer-core/generate-language-mixer.js");
  execSync("node \"" + genPath + "\"", { stdio: "pipe", cwd: __dirname });
  results.push("Generator ran OK");
} catch (e) {
  results.push("Generator error: " + e.message);
}

// Read JS file
const jsPath = path.join(__dirname, "config/language-mixer-map.js");
const jsData = fs.readFileSync(jsPath, "utf8");
const match = jsData.match(/languageMixerMap = ([\s\S]*?]);/);
if (match) {
  const jsMap = JSON.parse(match[1]);
  results.push("JS first entry: " + JSON.stringify(jsMap[0]));
  results.push("Match: " + (JSON.stringify(jsMap[0]) === JSON.stringify(jsonMap[0])));
}

fs.writeFileSync(path.join(__dirname, "debug_result.txt"), results.join("\n"), "utf8");
console.log("Done");