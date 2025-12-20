const fs = require('fs');
const path = 'e:/code/Fantasy-Map-Generator/tools/mixer-diagnostics/_no_uniq_base_claims.json';
// Read the file and handle potential trailing garbage or issues
let raw = fs.readFileSync(path, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  // If parsing fails, try to fix common issues (like extra braces at end)
  raw = raw.trim();
  while (raw.endsWith('}')) {
    try {
      data = JSON.parse(raw);
      break;
    } catch (err) {
      raw = raw.substring(0, raw.lastIndexOf('}')).trim();
    }
  }
}

if (!data) {
    console.error("Failed to parse JSON even after cleanup");
    process.exit(1);
}

// Ensure the last entry is Batch 9 and remove Batch 10 if it's broken
data.claims = data.claims.filter(c => c.batchId !== "2025-12-20T05:20:00.000Z-worker1");

// Add Batch 10
data.claims.push({
  workerId: 1,
  batchId: "2025-12-20T05:20:00.000Z-worker1",
  isos: [
    "gagauz",
    "galambu-language",
    "geme",
    "gende",
    "gendza",
    "gengele-creole",
    "gera-language",
    "geruma-language",
    "ggg",
    "ghadames"
  ],
  status: "in_progress",
  startedAt: "2025-12-20T05:20:00.000Z",
  updatedAt: "2025-12-20T05:20:00.000Z",
  reservedRange: [11280, 11329],
  notes: "Reserved i range: 11280-11329\nISO->base mapping:\n- gagauz->11280\n- galambu-language->11281\n- geme->11282\n- gende->11283\n- gendza->11284\n- gengele-creole->11285\n- gera-language->11286\n- geruma-language->11287\n- ggg->11288\n- ghadames->11289"
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
