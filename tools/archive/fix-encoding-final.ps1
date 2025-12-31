# Final Encoding Fix for Namebases
# Preserves legitimate UTF-8 but fixes misencoded sequences

param(
    [switch]$DryRun,
    [switch]$Verbose
)

# Load the file
$filePath = "e:\code\Fantasy-Map-Generator\modules\namebases-real.js"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Extract the array part
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)

# Parse JSON
try {
    $namebases = $jsonArray | ConvertFrom-Json -ErrorAction Stop
}
catch {
    Write-Host "Error parsing JSON: $_"
    exit 1
}

Write-Host "Loaded $($namebases.Count) namebase entries"

# Track fixed entries
$fixedEntries = @()

# Process each entry
foreach ($entry in $namebases) {
    $originalBases = $entry.b
    $fixedBases = $originalBases
    $entryChanges = @()
    
    # Fix specific misencoded sequences (these are the ones we found)
    # C3 83 C2 B1 = Ã± -> ñ
    if ($fixedBases.Contains([char]0xC3) -and $fixedBases.Contains([char]0x83) -and $fixedBases.Contains([char]0xC2) -and $fixedBases.Contains([char]0xB1)) {
        $fixedBases = $fixedBases -replace "$([char]0xC3)$([char]0x83)$([char]0xC2)$([char]0xB1)", 'ñ'
        $entryChanges += "Fixed misencoded n tilde"
    }
    
    # C3 83 E2 80 B0 C3 BA = Ãâ°ú -> remove the misencoded part
    if ($fixedBases.Contains([char]0xC3) -and $fixedBases.Contains([char]0x83) -and $fixedBases.Contains([char]0xE2) -and $fixedBases.Contains([char]0x80) -and $fixedBases.Contains([char]0xB0) -and $fixedBases.Contains([char]0xC3) -and $fixedBases.Contains([char]0xBA)) {
        $fixedBases = $fixedBases -replace "$([char]0xC3)$([char]0x83)$([char]0xE2)$([char]0x80)$([char]0xB0)$([char]0xC3)$([char]0xBA)", 'ú'
        $entryChanges += "Fixed misencoded Portuguese sequence"
    }
    
    # Fix other common misencoded patterns
    if ($fixedBases.Contains([char]0xC3) -and $fixedBases.Contains([char]0x83)) {
        # Ã followed by any character - this is usually a misencoding
        $fixedBases = $fixedBases -replace "$([char]0xC3)$([char]0x83)", ''
        $entryChanges += "Removed misencoded Ã sequence"
    }
    
    # Fix the specific patterns we saw in the analysis
    if ($fixedBases.Contains('â"œ')) {
        $fixedBases = $fixedBases -replace 'â"œ', '"'
        $entryChanges += "Fixed opening quote"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', '"'
        $entryChanges += "Fixed closing quote"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', '-'
        $entryChanges += "Fixed dash"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', "'"
        $entryChanges += "Fixed apostrophe"
    }
    
    # Remove any remaining control characters
    if ($fixedBases -match '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]') {
        $fixedBases = $fixedBases -replace '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ''
        $entryChanges += "Removed control characters"
    }
    
    # If changes were made, record them
    if ($entryChanges.Count -gt 0 -or $fixedBases -ne $originalBases) {
        $fixedEntries += [PSCustomObject]@{
            Name           = $entry.name
            OriginalLength = $originalBases.Length
            FixedLength    = $fixedBases.Length
            Changes        = if ($entryChanges.Count -gt 0) { $entryChanges -join '; ' } else { "Cleanup" }
        }
        
        if ($Verbose) {
            Write-Host "Fixed: $($entry.name)"
            foreach ($change in $entryChanges) {
                Write-Host "  - $change"
            }
        }
        
        # Update the entry if not dry run
        if (-not $DryRun) {
            $entry.b = $fixedBases
        }
    }
}

# Summary
Write-Host "`n=== Final Encoding Fix Summary ==="
Write-Host "Total entries processed: $($namebases.Count)"
Write-Host "Entries with fixes: $($fixedEntries.Count)"

if ($fixedEntries.Count -gt 0) {
    Write-Host "`nFixed entries:"
    $fixedEntries | Format-Table -AutoSize
}

# Save changes if not dry run
if (-not $DryRun -and $fixedEntries.Count -gt 0) {
    # Rebuild the JSON
    $fixedJson = $namebases | ConvertTo-Json -Depth 100 -Compress
    
    # Rebuild the full file content
    $beforeArray = $content.Substring(0, $arrayStart)
    $afterArray = $content.Substring($arrayEnd)
    $newContent = $beforeArray + $fixedJson + $afterArray
    
    # Save to file
    $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
    Write-Host "`nChanges saved to $filePath"
}
elseif ($DryRun) {
    Write-Host "`nDry run mode - no changes made. Run without -DryRun to apply fixes."
}

Write-Host "`nFinal encoding fix complete!"
