# Advanced Encoding Fix for Namebases
# This script handles remaining encoding issues after initial cleanup

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
    
    # Check for specific problematic sequences
    if ($fixedBases.Contains('â"œ')) {
        $fixedBases = $fixedBases -replace 'â"œ', '"'
        $entryChanges += "Fixed opening quote variant"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', '"'
        $entryChanges += "Fixed closing quote variant"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', '-'
        $entryChanges += "Fixed dash variant"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', "'"
        $entryChanges += "Fixed apostrophe variant"
    }
    
    if ($fixedBases.Contains('â"')) {
        $fixedBases = $fixedBases -replace 'â"', '...'
        $entryChanges += "Fixed ellipsis variant"
    }
    
    # Fix specific accented character patterns
    if ($fixedBases.Contains('Ã¡')) {
        $fixedBases = $fixedBases -replace 'Ã¡', 'á'
        $entryChanges += "Fixed a acute variant"
    }
    
    if ($fixedBases.Contains('Ã©')) {
        $fixedBases = $fixedBases -replace 'Ã©', 'é'
        $entryChanges += "Fixed e acute variant"
    }
    
    if ($fixedBases.Contains('Ã')) {
        $fixedBases = $fixedBases -replace 'Ã', 'í'
        $entryChanges += "Fixed i acute variant"
    }
    
    if ($fixedBases.Contains('Ã³')) {
        $fixedBases = $fixedBases -replace 'Ã³', 'ó'
        $entryChanges += "Fixed o acute variant"
    }
    
    if ($fixedBases.Contains('Ãº')) {
        $fixedBases = $fixedBases -replace 'Ãº', 'ú'
        $entryChanges += "Fixed u acute variant"
    }
    
    if ($fixedBases.Contains('Ã±')) {
        $fixedBases = $fixedBases -replace 'Ã±', 'ñ'
        $entryChanges += "Fixed n tilde variant"
    }
    
    if ($fixedBases.Contains('Ã¼')) {
        $fixedBases = $fixedBases -replace 'Ã¼', 'ü'
        $entryChanges += "Fixed u umlaut variant"
    }
    
    if ($fixedBases.Contains('Ã¶')) {
        $fixedBases = $fixedBases -replace 'Ã¶', 'ö'
        $entryChanges += "Fixed o umlaut variant"
    }
    
    if ($fixedBases.Contains('Ã§')) {
        $fixedBases = $fixedBases -replace 'Ã§', 'ç'
        $entryChanges += "Fixed c cedilla variant"
    }
    
    # Remove any remaining problematic characters
    if ($fixedBases -match '[\x80-\xFF]') {
        # Keep legitimate UTF-8 but remove broken sequences
        $fixedBases = $fixedBases -replace '[\x80-\x9F]', ''
        $fixedBases = $fixedBases -replace '[\xF0-\xF4][\x80-\xBF][\x80-\xBF][\x80-\xBF]', ''  # Remove 4-byte sequences
        $fixedBases = $fixedBases -replace '[\xE0-\xEF][\x80-\xBF]{2}', ''  # Remove 3-byte sequences
        $fixedBases = $fixedBases -replace '[\xC0-\xDF][\x80-\xBF]', ''  # Remove 2-byte sequences
        $entryChanges += "Removed remaining non-ASCII"
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
Write-Host "`n=== Advanced Encoding Fix Summary ==="
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
    Write-Host "`nDry run mode - no changes made. Use -DryRun:$false to apply fixes."
}

Write-Host "`nAdvanced encoding fix complete!"
