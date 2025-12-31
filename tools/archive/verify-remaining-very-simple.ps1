# Very Simple Verification of Remaining Entries
# This script checks the remaining entries with non-ASCII characters

# Load the file
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)
$namebases = $jsonArray | ConvertFrom-Json

Write-Host "Verifying remaining entries with non-ASCII characters..."

# Find all entries with non-ASCII characters
$entriesWithNonAscii = @()

foreach ($entry in $namebases) {
    $bases = $entry.b
    $nonAscii = $bases -replace '[\x00-\x7F]', ''
    
    if ($nonAscii.Length -gt 0) {
        $entriesWithNonAscii += [PSCustomObject]@{
            Name = $entry.name
            NonASCIICount = $nonAscii.Length
            NonASCIISample = $nonAscii
            FullSample = if ($bases.Length -gt 100) { $bases.Substring(0, 97) + "..." } else { $bases }
        }
    }
}

Write-Host "Found $($entriesWithNonAscii.Count) entries with non-ASCII characters"
Write-Host ""

# Analyze each entry
foreach ($entry in $entriesWithNonAscii) {
    Write-Host "=== $($entry.Name) ==="
    Write-Host "Non-ASCII characters: $($entry.NonASCIICount)"
    Write-Host "Non-ASCII sample: '$($entry.NonASCIISample)'"
    Write-Host "Full sample: '$($entry.FullSample)'"
    
    # Get hex bytes for analysis
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($entry.NonASCIISample)
    $hexBytes = $bytes | ForEach-Object { '{0:X2}' -f $_ }
    Write-Host "Hex bytes: $($hexBytes -join ' ')"
    
    # Simple analysis
    $needsFix = $false
    $analysis = @()
    
    # Check for obvious misencoding patterns
    if ($bytes -contains 0xC3 -and $bytes -contains 0x83) {
        $analysis += "Contains misencoded patterns (C3 83)"
        $needsFix = $true
    }
    
    if ($bytes -contains 0xE2 -and ($bytes -contains 0x80 -or $bytes -contains 0x82)) {
        $analysis += "Contains Windows-1252 artifacts"
        $needsFix = $true
    }
    
    # Check for legitimate UTF-8 patterns
    $hasLegitimateUTF8 = $false
    for ($i = 0; $i -lt $bytes.Count; $i++) {
        $b1 = $bytes[$i]
        if ($b1 -ge 0xC0 -and $b1 -le 0xDF -and $i + 1 -lt $bytes.Count) {
            $b2 = $bytes[$i + 1]
            if ($b2 -ge 0x80 -and $b2 -le 0xBF) {
                $hasLegitimateUTF8 = $true
                $i++
            }
        } elseif ($b1 -ge 0xE0 -and $b1 -le 0xEF -and $i + 2 -lt $bytes.Count) {
            $b2 = $bytes[$i + 1]
            $b3 = $bytes[$i + 2]
            if ($b2 -ge 0x80 -and $b2 -le 0xBF -and $b3 -ge 0x80 -and $b3 -le 0xBF) {
                $hasLegitimateUTF8 = $true
                $i += 2
            }
        }
    }
    
    if ($hasLegitimateUTF8 -and -not $needsFix) {
        $analysis += "Contains legitimate UTF-8 sequences"
    }
    
    # Language-specific analysis based on name
    $nameLower = $entry.Name.ToLower()
    if ($nameLower -like "*arabic*") {
        if ($bytes -ge 0xD8 -and $bytes -le 0xDF) {
            $analysis += "Likely contains Arabic characters"
        }
    }
    elseif ($nameLower -like "*maltese*") {
        $analysis += "Maltese language - check for specific characters"
    }
    elseif ($nameLower -like "*vietnamese*") {
        $analysis += "Vietnamese language - check for diacritics"
    }
    elseif ($nameLower -like "*inuit*" -or $nameLower -like "*inupiaq*") {
        $analysis += "Inuit language - check for specific characters"
    }
    
    # Print analysis
    if ($analysis.Count -gt 0) {
        foreach ($item in $analysis) {
            Write-Host "  - $item"
        }
    }
    
    # Recommendation
    if ($needsFix) {
        Write-Host "  RECOMMENDATION: FIX - Contains encoding errors"
    } elseif ($hasLegitimateUTF8) {
        Write-Host "  RECOMMENDATION: KEEP - Contains legitimate characters"
    } else {
        Write-Host "  RECOMMENDATION: REVIEW - Needs manual inspection"
    }
    
    Write-Host ""
}

Write-Host "Verification complete!"
