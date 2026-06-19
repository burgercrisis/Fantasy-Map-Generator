#!/usr/bin/env python3
"""Print full corruption list: i, language name, first contaminant found."""
import re, sys, io
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
MODULES = BASE / "modules"
SENTINELS = ["Lima","Paris","London","Berlin","Tokyo","Delhi","Madrid","Moscow","Rome",
    "Chicago","Toronto","Vienna","Oslo","Stockholm","Prague","Warsaw","Budapest",
    "Reno","Las Vegas","Cardamom","Ho Chi Minh","Kuala Lumpur","Marseille","Lyon",
    "Santiago","Mali","Benin","Poland","Florida","Delaware","Goias","Espirito Santo",
    "Federal District","Birmingham","Manchester","Madrid","Kyiv","Montana","Sofia",
    "Quito","Angola","Sudan","Nigeria","Cameroon","Niger","Honiara","Port Vila",
    "Apia","Papeete","Nuku.alofa","Brno","Zwickau","Zweibrücken","Rheinland","Zossen",
    "Conselheiro","Congonhas","Condeúba","Perus","Peruíbe","Pelotas","SaoPaulo",
    "BeloHorizonte","PortoAlegre","SaoBernardo","RioGrande","Pernambuco"]

for fp in sorted(MODULES.glob("namebases-*.js")):
    if "backup" in fp.name:
        continue
    content = fp.read_text(encoding="utf-8", errors="replace")
    PAT = re.compile(r'"i":\s*(\d+)\s*,\s*\n.*?"name":\s*"([^"]*)"[\s\S]*?"b":\s*"([^"]*)"', re.DOTALL)
    for m in PAT.finditer(content):
        i = m.group(1)
        name = m.group(2)
        b = m.group(3)
        if any(s.lower() in b.lower() for s in SENTINELS):
            # find first matching sentinel
            hit = next((s for s in SENTINELS if s.lower() in b.lower()), "???")
            print(f"i:{i} | {name} | {hit}")
