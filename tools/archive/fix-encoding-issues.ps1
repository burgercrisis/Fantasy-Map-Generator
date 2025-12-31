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
    
    # Fix Windows-1252 to UTF-8 conversion artifacts
    $fixes = @{
        'â€œ'  = '"'
        'â€'   = '"'
        'â€¦'  = '...'
        'â€'   = '-'
        'â€™'  = "'"
        'â€""' = '"'
    }
    
    foreach ($pattern in $fixes.Keys) {
        $replacement = $fixes[$pattern]
        if ($fixedBases -match [regex]::Escape($pattern)) {
            $fixedBases = $fixedBases -replace [regex]::Escape($pattern), $replacement
            $entryChanges += "Fixed '$pattern' -> '$replacement'"
        }
    }
    
    # Fix common misencoded accented characters
    $accentFixes = @{
        'Ã¡' = 'á'
        'Ã©' = 'é'
        'Ã­' = 'í'
        'Ã³' = 'ó'
        'Ãº' = 'ú'
        'Ã±' = 'ñ'
        'Ã¼' = 'ü'
        'Ã¶' = 'ö'
        'Ã§' = 'ç'
    }
    
    foreach ($pattern in $accentFixes.Keys) {
        $replacement = $accentFixes[$pattern]
        if ($fixedBases -match [regex]::Escape($pattern)) {
            $fixedBases = $fixedBases -replace [regex]::Escape($pattern), $replacement
            $entryChanges += "Fixed accent '$pattern' -> '$replacement'"
        }
    }
    
    # Fix Unicode replacement characters
    if ($fixedBases -match '\?\?') {
        $fixedBases = $fixedBases -replace '\?\?', '?'
        $entryChanges += "Fixed Unicode replacement characters"
    }
    
    # Remove control characters (except common ones)
    $fixedBases = $fixedBases -replace '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ''
    
    # If changes were made, record them
    if ($entryChanges.Count -gt 0 -or $fixedBases -ne $originalBases) {
        $fixedEntries += [PSCustomObject]@{
            Name           = $entry.name
            OriginalLength = $originalBases.Length
            FixedLength    = $fixedBases.Length
            Changes        = if ($entryChanges.Count -gt 0) { $entryChanges -join '; ' } else { "Control character cleanup" }
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
