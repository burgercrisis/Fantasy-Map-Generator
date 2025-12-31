# Verify Remaining 16 Entries with Non-ASCII Characters
# This script examines each entry to determine if characters are legitimate

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
    
    # Analyze the non-ASCII characters
    $nonAscii = $entry.NonASCIISample
    $analysis = @()
    
    # Check for legitimate UTF-8 patterns
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($nonAscii)
    $hexBytes = $bytes | ForEach-Object { '{0:X2}' -f $_ }
    Write-Host "Hex bytes: $($hexBytes -join ' ')"
    
    # Check for obvious misencoding
    if ($nonAscii.Contains('Ã') -or $nonAscii.Contains('â') -or $nonAscii.Contains('â€')) {
        $analysis += "❌ Contains misencoding patterns"
    }
    
    # Check for legitimate European characters
    if ($nonAscii -match '[áéíóúÁÉÍÓÚñÑüÜöÖçÇàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛãõÃÕäëïöüÄËÏÖÜ]') {
        $analysis += "✅ Contains legitimate European accents"
    }
    
    # Check for legitimate non-European characters
    if ($nonAscii -match '[čćžšđČĆŽŠĐ]') {
        $analysis += "✅ Contains Slavic characters"
    }
    
    if ($nonAscii -match '[ğüşöçİĞÜŞÖÇ]') {
        $analysis += "✅ Contains Turkish characters"
    }
    
    if ($nonAscii -match '[āēīōūĀĒĪŌŪ]') {
        $analysis += "✅ Contains macron characters"
    }
    
    # Check for problematic patterns
    if ($bytes -contains 0xC3 -and $bytes -contains 0x83) {
        $analysis += "❌ Contains ÃÂ pattern (misencoded)"
    }
    
    if ($bytes -contains 0xE2 -and ($bytes -contains 0x80 -or $bytes -contains 0x82)) {
        $analysis += "❌ Contains Windows-1252 artifacts"
    }
    
    # Language-specific analysis
    switch -Wildcard ($entry.Name) {
        "*Arabic*" { 
            if ($nonAscii -match '[\u0600-\u06FF]') {
                $analysis += "✅ Contains legitimate Arabic characters"
            } else {
                $analysis += "⚠️ Arabic entry without Arabic characters"
            }
        }
        "*Maltese*" { 
            if ($nonAscii -match '[ħċżġ]') {
                $analysis += "✅ Contains legitimate Maltese characters"
            } else {
                $analysis += "⚠️ Maltese entry without Maltese-specific characters"
            }
        }
        "*Vietnamese*" { 
            if ($nonAscii -match '[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]') {
                $analysis += "✅ Contains legitimate Vietnamese characters"
            } else {
                $analysis += "⚠️ Vietnamese entry without Vietnamese characters"
            }
        }
        "*Inuit*" { 
            if ($nonAscii -match '[ġĸŋł]') {
                $analysis += "✅ Contains legitimate Inuit characters"
            } else {
                $analysis += "⚠️ Inuit entry without Inuit-specific characters"
            }
        }
    }
    
    # Print analysis
    if ($analysis.Count -gt 0) {
        foreach ($item in $analysis) {
            Write-Host "  $item"
        }
    } else {
        Write-Host "  ⚠️ Could not determine character legitimacy"
    }
    
    Write-Host ""
}

Write-Host "Verification complete!"
