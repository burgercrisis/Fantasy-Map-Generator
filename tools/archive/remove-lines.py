with open("modules/namebases-fantasy.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Remove lines 374, 375, 376 (indices 373, 374, 375 in 0-based indexing)
new_lines = [line for i, line in enumerate(lines) if i < 373 or i > 375]

with open("modules/namebases-fantasy.js", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Lines 374-376 removed successfully")
