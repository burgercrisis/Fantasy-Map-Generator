import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
MODULES = BASE / "modules"

files = ['namebases-europe.js','namebases-asia.js','namebases-africa.js','namebases-northAmerica.js','namebases-southAmerica.js','namebases-oceania.js']

for f in files:
    path = MODULES / f
    content = open(path, 'r', encoding='utf-8').read()

    # Find entries with empty or very short seeds (less than 10 chars)
    # Pattern: "b": "  or "b": ", or just whitespace/commas
    corrupted = re.findall(r'"b":\s*"[^"]{0,10}"', content)
    if corrupted:
        print(f'{f}: {len(corrupted)} potentially corrupted entries')
        for c in corrupted[:5]:
            print(f'  {c}')
