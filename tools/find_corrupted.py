import re, os

files = ['modules/namebases-europe.js','modules/namebases-asia.js','modules/namebases-africa.js','modules/namebases-northAmerica.js','modules/namebases-southAmerica.js','modules/namebases-oceania.js']

for f in files:
    path = os.path.join(r'E:\code\Fantasy-Map-Generator', f)
    content = open(path, 'r', encoding='utf-8').read()
    
    # Find entries with empty or very short seeds (less than 10 chars)
    # Pattern: "b": "  or "b": ", or just whitespace/commas
    corrupted = re.findall(r'"b":\s*"[^"]{0,10}"', content)
    if corrupted:
        print(f'{f}: {len(corrupted)} potentially corrupted entries')
        for c in corrupted[:5]:
            print(f'  {c}')
