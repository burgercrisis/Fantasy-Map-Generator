#!/usr/bin/env python3
import re

with open('modules/namebases-unknown.js', 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# Fix common mojibake patterns (UTF-8 bytes misinterpreted as Latin-1)
mojibake_fixes = [
    # Click language special characters
    ('Ekoka ÇƒKung', 'Ekoka !Kung'),
    ('Ç‚Ê¼Amkoe', 'Amkoe'),
    ('NÇng Click', 'Nung Click'), 
    ('GÇƒui Click', 'Gui Click'),
    
    # Complex mojibake sequences
    ('â"œâ"‚', 'o'),
    ('â"œâŒ', 'e'),
    ('â"œÃº', 'a'),
    ('â"œÃ­', 'i'),
    ('â"œâ•'', 'u'),
    ('â"œâ–'', 'n'),
    ('â"œÃ±', 'a'),
    ('â"œâ"¤', 'o'),
    ('â"œÂ¡', 'a'),
    ('â"œÂ¿', 'e'),
    ('â"œÂ½', 'a'),
    ('â"œÂ«', 'i'),
    ('â"œÃ'', 'a'),
    ('â"œÂº', 'c'),
    ('â"œÂ¬', 'e'),
    ('Î"Ã‡Ã´', '-'),
    ('â•©â• ', "'"),
    ('â•©â•', "'"),
    ('â•Ÿâ•¢', 'a'),
    ('â•©Ã«', 'u'),
    ('â•ŸÃ¢', '!'),
    ('â•ŸÃ©', '!'),
    ('â•ŸÃ¼', '-'),
    ('â•ŸÂ½', "'"),
    ('â"¼Ã©', 'l'),
    ('â"€Â»', 'o'),
    ('Î©â‚§Ã®', "'p"),
    ('â•¦Ã‡', ''),
    ('â"¼â•—', 'Z'),
    ('â"œÃ ', 'A'),
    
    # Standard diacritic mojibake
    ('Ã§', 'c'),
    ('Ã©', 'e'),
    ('Ã¨', 'e'),
    ('Ã¤', 'a'),
    ('Ãµ', 'o'),
    ('Ã±', 'n'),
    ('Ã­', 'i'),
    ('Ã³', 'o'),
    ('Ã¡', 'a'),
    ('Ã ', 'a'),
    ('Ã¢', 'a'),
    ('Ã´', 'o'),
    ('Ã¶', 'o'),
    ('Ãº', 'u'),
    ('Ã¼', 'u'),
    ('Ã–', 'O'),
    ('â€"', '-'),
    ('â€™', "'"),
    ('Ê¼', "'"),
]

count = 0
for old, new in mojibake_fixes:
    if old in content:
        occurrences = content.count(old)
        content = content.replace(old, new)
        print(f'Fixed: {repr(old)[:20]} -> {repr(new)} ({occurrences}x)')
        count += occurrences

# Fix trailing spaces in name fields
trailing_fixed = len(re.findall(r'"name": "[^"]+ "', content))
content = re.sub(r'"name": "([^"]+) "', r'"name": "\1"', content)
if trailing_fixed:
    print(f'Fixed trailing spaces: {trailing_fixed}')
    count += trailing_fixed

print(f'\nTotal fixes: {count}')
print(f'Size: {original_len} -> {len(content)}')

with open('modules/namebases-unknown.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved!')
