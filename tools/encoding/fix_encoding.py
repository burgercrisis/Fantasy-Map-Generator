import sys

with open("modules/namebases-asia.js", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

original = content
content = content.replace("â€¦", "...")
content = content.replace('â€"', '"')
content = content.replace("â€¹", "<")

if content != original:
    with open("modules/namebases-asia.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed encoding issues in asia.js")
else:
    print("No changes - patterns not found")
