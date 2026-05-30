const fs = require('fs');
const path = 'e:/code/Fantasy-Map-Generator/tools/mixer-diagnostics/_no_uniq_base_claims.json';
let content = fs.readFileSync(path, 'utf8').trim();
content = content.substring(0, content.lastIndexOf('}'));
content = content.substring(0, content.lastIndexOf(']'));
content = content.substring(0, content.lastIndexOf('}'));
const newClaim = `    },
    {
      "workerId": 1,
      "batchId": "2025-12-20T05:20:00.000Z-worker1",
      "isos": [
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
      "status": "in_progress",
      "startedAt": "2025-12-20T05:20:00.000Z",
      "updatedAt": "2025-12-20T05:20:00.000Z",
      "reservedRange": [
        11280,
        11329
      ],
      "notes": "Reserved i range: 11280-11329\\nISO->base mapping:\\n- gagauz->11280\\n- galambu-language->11281\\n- geme->11282\\n- gende->11283\\n- gendza->11284\\n- gengele-creole->11285\\n- gera-language->11286\\n- geruma-language->11287\\n- ggg->11288\\n- ghadames->11289"
    }
  ]
}`;
fs.writeFileSync(path, content + ',\n' + newClaim + '\n}');
