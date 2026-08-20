import re
with open('modules/namebases-oceania.js', 'r') as f:
    content = f.read()
names = re.findall(r'"name":\s*"([^"]+)"', content)
statuses = re.findall(r'"status":\s*"([^"]+)"', content)
print(f'Names: {len(names)} Status: {len(statuses)} Missing: {len(names)-len(statuses)}')

# Find entries without status
entries = re.findall(r'\{[^{]*?"name":\s*"([^"]+)"[^{]*?\}', content)
for e in entries:
    if 'status' not in e:
        name_match = re.search(r'"name":\s*"([^"]+)"', e)
        if name_match:
            print(f'Missing status: {name_match.group(1)}')