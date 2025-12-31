#!/usr/bin/env pwsh

# Read the entire file
$content = Get-Content "modules\namebases-real.js" -Raw

# Find all entries and their positions
$pattern = '(?s){\s*"name":\s*"([^"]+)",.*?"i":\s*(\d+).*?},'
$matches = [regex]::Matches($content, $pattern)

Write-Host "Found $($matches.Count) entries"

# Create list of entries with their info
$entries = @()
for ($i = 0; $i -lt $matches.Count; $i++) {
    $match = $matches[$i]
    $name = $match.Groups[1].Value
    $oldIndex = [int]$match.Groups[2].Value
    $fullText = $match.Value
    
    $entries += @{
        Name = $name
        OldIndex = $oldIndex
        NewIndex = $i  # Will be sequential from 0
        FullText = $fullText
        Position = $match.Index
        Length = $match.Length
    }
}

# Sort by old index to maintain order
$entries = $entries | Sort-Object OldIndex

# Create the new content
$newContent = $content

# Process entries from last to first to avoid position shifts
$entries | Sort-Object Position -Descending | ForEach-Object {
    $entry = $_
    
    # Replace the index in the entry text
    $newEntryText = $entry.FullText -replace '"i":\s*\d+', "`"i`": $($entry.NewIndex)"
    
    # Replace in the content
    $newContent = $newContent.Remove($entry.Position, $entry.Length).Insert($entry.Position, $newEntryText)
}

# Write the new content
$newContent | Out-File -FilePath "modules\namebases-real.js" -Encoding UTF8 -NoNewline

Write-Host "Successfully reindexed $($entries.Count) entries"
Write-Host "New indices range from 0 to $($entries.Count - 1)"

# Show some examples of changes
$changes = $entries | Where-Object { $_.OldIndex -ne $_.NewIndex } | Select-Object -First 10
Write-Host "`nFirst 10 changes:"
foreach ($change in $changes) {
    Write-Host "  $($change.Name): $($change.OldIndex) → $($change.NewIndex)"
}
