"""Regenerate namebases-*.js from data.json with CRLF line endings.

Only applies defaults (min/max/d/m) to entries that are missing those fields
entirely. Existing metadata from data.json is preserved.
"""
import json, os, sys, io
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "docs" / "plans" / "namebase-research" / "data.json"
OUT  = BASE / "modules"

if not DATA.exists():
    print(f"ERROR: data file not found: {DATA}", file=sys.stderr)
    sys.exit(1)

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

DEFAULTS = {"min": 4, "max": 11, "d": "lnrt", "m": 0}

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
        # Preserve existing metadata; only fill in defaults when missing
        min_val = e.get("min") if e.get("min") is not None else DEFAULTS["min"]
        max_val = e.get("max") if e.get("max") is not None else DEFAULTS["max"]
        d_val = e.get("d") if e.get("d") else DEFAULTS["d"]
        m_val = e.get("m") if e.get("m") is not None else DEFAULTS["m"]
        block = (
            '{\n'
            '    "name": "' + nm + '",\n'
            '  "i": ' + str(bid) + ',\n'
            '  "min": ' + str(min_val) + ',\n'
            '  "max": ' + str(max_val) + ',\n'
            '  "d": "' + d_val + '",\n'
            '  "m": ' + str(m_val) + ',\n'
            '  "b": "' + places + '"\n'
            '},\n',
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
