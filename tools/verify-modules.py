#!/usr/bin/env python3
"""Verify corruption only in modules/*.js after regeneration."""
import re, sys, io
from pathlib import Path
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

MODULES = Path(r"E:\code\Fantasy-Map-Generator\modules")
SENTINELS = ["Lima","Paris","London","Berlin","Tokyo","Delhi","Madrid","Moscow","Rome",
    "Chicago","Toronto","Vienna","Oslo","Stockholm","Prague","Warsaw","Budapest",
    "Reno","Las Vegas","Cardamom","Ho Chi Minh","Kuala Lumpur","Marseille","Lyon",
    "Santiago","Mali","Benin","Poland","Florida","Delaware","Goias","Espirito Santo",
    "Federal District","Birmingham","Manchester","Madrid","Kyiv","Montana","Sofia",
    "Quito","Angola","Sudan","Nigeria","Cameroon","Niger","Honiara","Port Vila",
    "Apia","Papeete","Nuku.alofa"]

total_bad = 0
for fp in sorted(MODULES.glob("namebases-*.js")):
    if "backup" in fp.name or ".backup" in fp.name:
        continue
    content = fp.read_text(encoding="utf-8", errors="replace")
    PAT = re.compile(r'"i":\s*(\d+)\s*,\s*\n.*?"b":\s*"([^"]*)"', re.DOTALL)
    bad = []
    for m in PAT.finditer(content):
        i = m.group(1)
        b = m.group(2)
        if any(s.lower() in b.lower() for s in SENTINELS):
            bad.append(f"  i:{i}")
    if bad:
        print(f"\n=== {fp.name}: {len(bad)} corrupted ===")
        for b in bad[:5]:
            print(b)
        if len(bad) > 5:
            print(f"  ... and {len(bad)-5} more")
        total_bad += len(bad)

print(f"\nTOTAL CORRUPTED in modules/: {total_bad}")
if total_bad == 0:
    print("ALL CLEAR")
