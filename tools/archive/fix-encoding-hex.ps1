# Fix Encoding Issues in Namebases
# This script will identify and fix common UTF-8 encoding issues in namebases-real.js

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
    
    # Fix common encoding issues using regex patterns
    $patterns = @(
        @{Pattern = '[\x80-\x9F]'; Replacement = ''; Description = 'Control characters'},
        @{Pattern = '\?\?'; Replacement = '?'; Description = 'Unicode replacement'},
        @{Pattern = '\xE2\x80\x9C'; Replacement = '"'; Description = 'Opening quote'},
        @{Pattern = '\xE2\x80\x9D'; Replacement = '"'; Description = 'Closing quote'},
        @{Pattern = '\xE2\x80\xA6'; Replacement = '...'; Description = 'Ellipsis'},
        @{Pattern = '\xE2\x80\x93'; Replacement = '-'; Description = 'En dash'},
        @{Pattern = '\xE2\x80\x99'; Replacement = "'"; Description = 'Apostrophe'},
        @{Pattern = '\xC3\xA1'; Replacement = 'á'; Description = 'a acute'},
        @{Pattern = '\xC3\xA9'; Replacement = 'é'; Description = 'e acute'},
        @{Pattern = '\xC3\xAD'; Replacement = 'í'; Description = 'i acute'},
        @{Pattern = '\xC3\xB3'; Replacement = 'ó'; Description = 'o acute'},
        @{Pattern = '\xC3\xBA'; Replacement = 'ú'; Description = 'u acute'},
        @{Pattern = '\xC3\xB1'; Replacement = 'ñ'; Description = 'n tilde'},
        @{Pattern = '\xC3\xBC'; Replacement = 'ü'; Description = 'u umlaut'},
        @{Pattern = '\xC3\xB6'; Replacement = 'ö'; Description = 'o umlaut'},
        @{Pattern = '\xC3\xA7'; Replacement = 'ç'; Description = 'c cedilla'}
    )
    
    foreach ($fix in $patterns) {
        if ($fixedBases -match $fix.Pattern) {
            $fixedBases = $fixedBases -replace $fix.Pattern, $fix.Replacement
            $entryChanges += $fix.Description
        }
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
Write-Host "`n=== Encoding Fix Summary ==="
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
    Write-Host "`nDry run mode - no changes made. Use -DryRun:`$false to apply fixes."
}

Write-Host "`nEncoding fix complete!"
