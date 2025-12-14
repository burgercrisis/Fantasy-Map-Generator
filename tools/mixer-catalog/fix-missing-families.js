"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "config", "language-mixes.json");

const args = process.argv.slice(2);
const multiAgentSafe = args.includes("--multi-agent-safe");
if (multiAgentSafe) {
  console.log("[multi-agent-safe] Read-only mode enabled: will not write config/language-mixes.json");
}

const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

let updated = 0;

for (const lang of data) {
  if (!lang.family || lang.family === "Other") {
    if (lang.category && lang.category !== "Other") {
      lang.family = lang.category;
      updated++;
    } else if (!lang.category) {
      // Fallback: if somehow category is missing, mark both as Unclassified
      lang.category = "Unclassified";
      lang.family = "Unclassified";
      updated++;
    }
  }
}

// Keep existing sort convention
data.sort((a, b) => (a.region || "" + a.name || "").localeCompare((b.region || "") + (b.name || "")));

if (multiAgentSafe) {
  console.log("[multi-agent-safe] Not writing config/language-mixes.json (dry-run)");
} else {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}
console.log("Updated entries:", updated);
