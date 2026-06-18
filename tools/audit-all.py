#!/usr/bin/env python3
"""Audit namebases using the canonical bills.jsonl exported by the working fixer."""
import json, sys, io
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

FP = r"E:\code\Fantasy-Map-Generator\docs\plans\namebase-research\data.json"

# Use a tolerant non-strict loader so the prepended "use strict"; and the comma
# between entries on Windows (CRLF) don’t break things.
OPEN = '['
CLOSE = ']'

raw = open(FP, "r", encoding="utf-8").read()
start = raw.index(OPEN)
end = raw.rindex(CLOSE) + 1
payload = raw[start:end]

try:
    items = json.loads(payload)
except Exception as e:
    print(f"json.loads strict failed: {e}")
    items = None

# Reliable sentinels that unambiguously indicate a non-place contamination
SENTINELS = [
    "Lima","Paris","London","Berlin","Tokyo","Delhi","Madrid","Moscow","Rome",
    "Chicago","Toronto","Vienna","Oslo","Stockholm","Prague","Warsaw","Budapest",
    "Reno","Las Vegas","Cardamom","Ho Chi Minh","Kuala Lumpur","Marseille","Lyon",
    "Santiago","Mali","Benin","Poland","Florida","Delaware","Goias",
    "Espirito Santo","Federal District",
    "3403360","3403362","3403697","3404545","3405457","3406202","3406996",
    "5504003","5505411","5506956","5508180","3407486","3408210",
    "3444876","3445418","3446392","3446753","3447409","3447779","3448207",
    "1524889","1524958","1525462","1525798","1525988",
    "10281812","10303818","10337414",
    "13494542","13494582","13494583","13494584","13494585","13494586",
    "2043572","2043677","2043835","2043837","2043962","2044050","2044091",
    "15493793","15494249","15494297","15494351","15494424","15494523",
    "15494640","15494680","15494706","15494721","15494729","15494746",
    "3346839","3347160","3347215","3347430","3347575","3347763",
    "4893171","4893365","4893392","4893591","4893811","4893886",
    "1453869","1453896","1453902","1453903","1453909","1453920",
    "2139521","2140066","2141394",
]

bad = []
good = 0
total = 0
for entry in items:
    total += 1
    b = entry.get("b","")
    contaminated = any(s.lower() in b.lower() for s in SENTINELS)
    if contaminated:
        bad.append((entry.get("i"), entry.get("name","?"), b[:90]))
    else:
        good += 1

print(f"total parsed : {total}")
print(f"clean        : {good}")
print(f"contaminated : {len(bad)}")
print("\nFirst 40 contaminated:")
for i, nm, bs in bad[:40]:
    print(f"  i:{i} | {nm:<40} | {bs}")
