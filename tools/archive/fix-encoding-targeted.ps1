# Targeted Encoding Fix for Namebases
# This script only removes specific problematic encoding patterns

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
    
    # Only fix specific problematic patterns that indicate encoding errors
    # These are the patterns that were flagged in the analysis
    
    # Fix the specific Windows-1252 to UTF-8 conversion artifacts
    if ($fixedBases -match 'â"œ') {
        $fixedBases = $fixedBases -replace 'â"œ', '"'
        $entryChanges += "Fixed opening quote artifact"
    }
    
    if ($fixedBases -match 'â"') {
        $fixedBases = $fixedBases -replace 'â"', '"'
        $entryChanges += "Fixed closing quote artifact"
    }
    
    if ($fixedBases -match 'â"') {
        $fixedBases = $fixedBases -replace 'â"', '-'
        $entryChanges += "Fixed dash artifact"
    }
    
    if ($fixedBases -match 'â"') {
        $fixedBases = $fixedBases -replace 'â"', "'"
        $entryChanges += "Fixed apostrophe artifact"
    }
    
    if ($fixedBases -match 'â"') {
        $fixedBases = $fixedBases -replace 'â"', '...'
        $entryChanges += "Fixed ellipsis artifact"
    }
    
    # Fix specific misencoded accented characters
    if ($fixedBases -match 'Ã¡') {
        $fixedBases = $fixedBases -replace 'Ã¡', 'á'
        $entryChanges += "Fixed misencoded a acute"
    }
    
    if ($fixedBases -match 'Ã©') {
        $fixedBases = $fixedBases -replace 'Ã©', 'é'
        $entryChanges += "Fixed misencoded e acute"
    }
    
    if ($fixedBases -match 'Ã') {
        $fixedBases = $fixedBases -replace 'Ã', 'í'
        $entryChanges += "Fixed misencoded i acute"
    }
    
    if ($fixedBases -match 'Ã³') {
        $fixedBases = $fixedBases -replace 'Ã³', 'ó'
        $entryChanges += "Fixed misencoded o acute"
    }
    
    if ($fixedBases -match 'Ãº') {
        $fixedBases = $fixedBases -replace 'Ãº', 'ú'
        $entryChanges += "Fixed misencoded u acute"
    }
    
    if ($fixedBases -match 'Ã±') {
        $fixedBases = $fixedBases -replace 'Ã±', 'ñ'
        $entryChanges += "Fixed misencoded n tilde"
    }
    
    if ($fixedBases -match 'Ã¼') {
        $fixedBases = $fixedBases -replace 'Ã¼', 'ü'
        $entryChanges += "Fixed misencoded u umlaut"
    }
    
    if ($fixedBases -match 'Ã¶') {
        $fixedBases = $fixedBases -replace 'Ã¶', 'ö'
        $entryChanges += "Fixed misencoded o umlaut"
    }
    
    if ($fixedBases -match 'Ã§') {
        $fixedBases = $fixedBases -replace 'Ã§', 'ç'
        $entryChanges += "Fixed misencoded c cedilla"
    }
    
    # Fix Unicode replacement characters
    if ($fixedBases -match '\?\?') {
        $fixedBases = $fixedBases -replace '\?\?', '?'
        $entryChanges += "Fixed Unicode replacement characters"
    }
    
    # Remove only control characters (not legitimate accented characters)
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
Write-Host "`n=== Targeted Encoding Fix Summary ==="
Write-Host "Total entries processed: $($namebases.Count)"
Write-Host "Entries with fixes: $($fixedEntries.Count)"

if ($fixedEntries.Count -gt 0) {
    Write-Host "`nFirst 10 fixed entries:"
    $fixedEntries | Select-Object -First 10 | Format-Table -AutoSize
    
    if ($fixedEntries.Count -gt 10) {
        Write-Host "... and $($fixedEntries.Count - 10) more entries fixed"
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

Write-Host "`nTargeted encoding fix complete!"
