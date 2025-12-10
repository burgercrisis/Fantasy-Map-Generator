const fs = require("fs");
const path = "config/language-mixer-map.json";
const lines = fs.readFileSync(path, "utf8").split("\n");
const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("\"bases\"") && line.includes("[")) {
    out.push(line);
    const numbers = [];
    let indent = null;
    let closingLine = null;
    while (++i < lines.length) {
      const current = lines[i];
      const trimmed = current.trim();
      if (trimmed.startsWith("]")) {
        closingLine = current;
        break;
      }
      if (!indent) {
        const m = current.match(/^(\s*)/);
        indent = m ? m[1] : "      ";
      }
      const match = current.match(/-?\d+/);
      if (match) {
        const value = Number(match[0]);
        if (!numbers.includes(value)) numbers.push(value);
      }
    }
    if (closingLine === null) {
      throw new Error("Unterminated bases array near line " + i);
    }
    numbers.forEach((value, idx) => {
      const suffix = idx < numbers.length - 1 ? "," : "";
      out.push(`${indent}${value}${suffix}`);
    });
    out.push(closingLine);
  } else {
    out.push(line);
  }
}
fs.writeFileSync(path, out.join("\n"));
