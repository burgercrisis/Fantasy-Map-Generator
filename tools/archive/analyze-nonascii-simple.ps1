# Simple Analysis of Non-ASCII Characters
# This script examines entries with non-ASCII characters

# Load the file
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)
$namebases = $jsonArray | ConvertFrom-Json

Write-Host "Analyzing non-ASCII characters in $($namebases.Count) entries..."

# Track entries with issues
$problematicEntries = @()
$legitimateEntries = @()

# Process each entry
foreach ($entry in $namebases) {
    $bases = $entry.b
    $nonAscii = $bases -replace '[\x00-\x7F]', ''
    
    if ($nonAscii.Length -gt 0) {
        # Check for obvious misencoding patterns
        $hasObviousIssues = $false
        
        # Look for common misencoding indicators
        if ($bases.Contains('Ã') -or $bases.Contains('â') -or $bases.Contains('â€')) {
            $hasObviousIssues = $true
        }
        
        # Look for control characters
        if ($bases -match '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]') {
            $hasObviousIssues = $true
        }
        
        # Categorize
        if ($hasObviousIssues) {
            $problematicEntries += [PSCustomObject]@{
                Name = $entry.name
                NonASCIICount = $nonAscii.Length
                Sample = if ($nonAscii.Length -gt 30) { $nonAscii.Substring(0, 27) + "..." } else { $nonAscii }
            }
        } else {
            $legitimateEntries += [PSCustomObject]@{
                Name = $entry.name
                NonASCIICount = $nonAscii.Length
                Sample = if ($nonAscii.Length -gt 30) { $nonAscii.Substring(0, 27) + "..." } else { $nonAscii }
            }
        }
    }
}

# Summary
Write-Host "`n=== Non-ASCII Character Analysis ==="
Write-Host "Entries with obvious encoding issues: $($problematicEntries.Count)"
Write-Host "Entries with likely legitimate characters: $($legitimateEntries.Count)"

if ($problematicEntries.Count -gt 0) {
    Write-Host "`n=== Entries with Obvious Encoding Issues ==="
    $problematicEntries | Select-Object -First 20 | Format-Table -AutoSize
    if ($problematicEntries.Count -gt 20) {
        Write-Host "... and $($problematicEntries.Count - 20) more entries with issues"
    }
}

if ($legitimateEntries.Count -gt 0) {
    Write-Host "`n=== Sample Entries with Likely Legitimate Characters ==="
    $legitimateEntries | Select-Object -First 10 | Format-Table -AutoSize
}

Write-Host "`nAnalysis complete!"
