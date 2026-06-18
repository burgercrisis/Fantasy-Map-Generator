"""Regenerate namebases-*.js from data.json with CRLF line endings."""
import json, os, sys, io
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = Path(r"E:\code\Fantasy-Map-Generator")
DATA = BASE / "docs/plans/namebase-research/data.json"
OUT  = BASE / "modules"

raw = DATA.read_text(encoding="utf-8", errors="replace")
start = raw.index("[")
end   = raw.rindex("]") + 1
items = json.loads(raw[start:end])

by_file = {}
for e in items:
    fn = e.get("filename", "unknown")
    by_file.setdefault(fn, []).append(e)

VARMAP = {
    "namebases-africa.js":    "africaNameBases",
    "namebases-asia.js":      "asiaNameBases",
    "namebases-dedicated.js": "dedicatedNameBases",
    "namebases-europe.js":    "europeNameBases",
    "namebases-fantasy.js":   "fantasyNameBases",
    "namebases-northAmerica.js":"northAmericaNameBases",
    "namebases-oceania.js":   "oceaniaNameBases",
    "namebases-southAmerica.js":"southAmericaNameBases",
    "namebases-unknown.js":   "unknownNameBases",
}

def sort_key(e):
    i = e.get("i","")
    try: return (0, int(i), str(e.get("name","")))
    except: return (1, str(i), str(e.get("name","")))

for fname, arr in sorted(by_file.items()):
    arr.sort(key=sort_key)
    var = VARMAP.get(fname, fname.replace(".js","NameBases"))
    lines = []
    lines.append('"use strict";\n')
    lines.append("\nwindow." + var + " = [\n\n\n")
    for e in arr:
        nm = str(e.get("name","")).replace('"','\\"')
        bid = e.get("i", "?")
        seeds_raw = e.get("allSeeds") or e.get("sampleSeeds") or ""
        tokens = [t.strip() for t in str(seeds_raw).split(",") if t.strip() and not t.strip().isdigit()]
        if not tokens:
            continue
        places = ",".join(tokens)
        block = (
            '{\n'
            '    "name": "' + nm + '",\n'
            '  "i": ' + str(bid) + ',\n'
            '  "min": 4,\n'
            '  "max": 11,\n'
            '  "d": "lnrt",\n'
            '  "m": 0,\n'
            '  "b": "' + places + '"\n'
            '},\n'
        )
        lines.append(block)
    lines.append("\n];\n")
    out_text = "".join(lines)
    # Normalize to CRLF
    crlf = out_text.replace("\r\n","\n").replace("\n","\r\n").encode("utf-8")
    path = OUT / fname
    # Write via temp file to avoid locking issues
    tmp = path.with_suffix(".tmp")
    tmp.write_bytes(crlf)
    os.replace(str(tmp), str(path))
    count = out_text.count('"i":')
    print("Wrote " + path.name + ": " + str(count) + " entries")
