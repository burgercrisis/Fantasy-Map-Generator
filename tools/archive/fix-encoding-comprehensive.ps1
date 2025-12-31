# Comprehensive Fix for Remaining Encoding Issues
# This script fixes all remaining encoding problems while preserving legitimate characters

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

# List of languages with legitimate non-ASCII characters (preserve these)
$legitimateLanguages = @('Bosnian', 'Croatian', 'Montenegrin', 'Serbian', 'Macedonian', 'Slovene')

# Process each entry
foreach ($entry in $namebases) {
    $originalBases = $entry.b
    $fixedBases = $originalBases
    $entryChanges = @()
    
    # Skip if this is a language with legitimate accents
    if ($legitimateLanguages -contains $entry.name) {
        continue
    }
    
    # Fix all misencoded patterns
    # Pattern 1: Remove all sequences starting with 0xC3 (Ã) followed by anything
    if ($fixedBases.Contains([char]0xC3)) {
        $fixedBases = $fixedBases -replace "$([char]0xC3).", ''
        $entryChanges += "Removed misencoded accent patterns"
    }
    
    # Pattern 2: Remove all sequences starting with 0xE2 (â) followed by anything
    if ($fixedBases.Contains([char]0xE2)) {
        $fixedBases = $fixedBases -replace "$([char]0xE2).", ''
        $entryChanges += "Removed Windows-1252 quote artifacts"
    }
    
    # Pattern 3: Remove Chinese/Japanese characters (0xE5-0xE9 range)
    if ($fixedBases -match '[\xE5-\xE9].') {
        $fixedBases = $fixedBases -replace '[\xE5-\xE9].', ''
        $entryChanges += "Removed CJK characters"
    }
    
    # Pattern 4: Remove any remaining control characters
    if ($fixedBases -match '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]') {
        $fixedBases = $fixedBases -replace '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ''
        $entryChanges += "Removed control characters"
    }
    
    # Pattern 5: Fix Unicode replacement characters
    if ($fixedBases.Contains('??')) {
        $fixedBases = $fixedBases -replace '\?\?', '?'
        $entryChanges += "Fixed Unicode replacement characters"
    }
    
    # Pattern 6: Remove any remaining high-byte characters that aren't legitimate
    # Keep only ASCII and legitimate European characters (0xC0-0xFF range for proper UTF-8)
    $tempBases = ""
    for ($i = 0; $i -lt $fixedBases.Length; $i++) {
        $char = $fixedBases[$i]
        $byteVal = [int][char]$char
        
        # Keep ASCII, or check if it's a legitimate UTF-8 sequence
        if ($byteVal -lt 128) {
            $tempBases += $char
        } elseif ($byteVal -ge 192 -and $byteVal -le 255) {
            # Check if this is the start of a legitimate UTF-8 sequence
            if ($i + 1 -lt $fixedBases.Length) {
                $nextByte = [int][char]$fixedBases[$i + 1]
                if ($nextByte -ge 128 -and $nextByte -le 191) {
                    # This looks like a legitimate UTF-8 sequence, keep it
                    $tempBases += $char
                    $tempBases += $fixedBases[$i + 1]
                    $i++  # Skip the next byte as we've processed it
                }
            }
        }
    }
    
    if ($tempBases -ne $fixedBases) {
        $fixedBases = $tempBases
        $entryChanges += "Cleaned remaining non-UTF-8 sequences"
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
Write-Host "`n=== Comprehensive Encoding Fix Summary ==="
Write-Host "Total entries processed: $($namebases.Count)"
Write-Host "Entries with fixes: $($fixedEntries.Count)"
Write-Host "Legitimate languages preserved: $($legitimateLanguages.Count)"

if ($fixedEntries.Count -gt 0) {
    Write-Host "`nFirst 20 fixed entries:"
    $fixedEntries | Select-Object -First 20 | Format-Table -AutoSize
    
    if ($fixedEntries.Count -gt 20) {
        Write-Host "... and $($fixedEntries.Count - 20) more entries fixed"
    }
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

Write-Host "`nComprehensive encoding fix complete!"
