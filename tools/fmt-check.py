#!/usr/bin/env python3
import re, sys, io, os
from pathlib import Path
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
BASE = Path(__file__).resolve().parent.parent / "modules"
VARMAP = {
    "namebases-africa.js":"africaNameBases",
    "namebases-asia.js":"asiaNameBases",
    "namebases-dedicated.js":"dedicatedNameBases",
    "namebases-europe.js":"europeNameBases",
    "namebases-fantasy.js":"fantasyNameBases",
    "namebases-northAmerica.js":"northAmericaNameBases",
    "namebases-oceania.js":"oceaniaNameBases",
    "namebases-southAmerica.js":"southAmericaNameBases",
    "namebases-unknown.js":"unknownNameBases",
}
for fname, var in sorted(VARMAP.items()):
    fp = BASE / fname
    c = fp.read_bytes()
    cr = c.count(b'\r\n')
    lf = c.count(b'\n') - cr
    content = fp.read_text(encoding="utf-8", errors="replace")
    if f'window.{var} = [' not in content:
        print(f"FAIL: {fname} missing window.{var}")
        continue
    PAT = re.compile(r'"i":\s*(\d+)\s*,\s*\n.*?"b":\s*"([^"]*)"', re.DOTALL)
    count = len(PAT.findall(content))
    print(f"{fname}: {count} entries | CRLF={cr} LF={lf} | var={var}")
