# Detailed Analysis of Non-ASCII Characters
# This script examines the specific non-ASCII characters in each entry

# Load the file
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)
$namebases = $jsonArray | ConvertFrom-Json

Write-Host "Analyzing non-ASCII characters in $($namebases.Count) entries..."

# Track entries with different types of issues
$legitimateAccents = @()
$misencodedEntries = @()
$controlCharEntries = @()
$otherIssues = @()

# Process each entry
foreach ($entry in $namebases) {
    $bases = $entry.b
    $nonAscii = $bases -replace '[\x00-\x7F]', ''
    
    if ($nonAscii.Length -gt 0) {
        # Check for legitimate UTF-8 accented characters
        $hasLegitimate = $false
        $hasMisencoded = $false
        $hasControl = $false
        
        # Check for legitimate accented characters (common European characters)
        if ($nonAscii -match '[áéíóúÁÉÍÓÚñÑüÜöÖçÇ]') {
            $hasLegitimate = $true
        }
        
        # Check for misencoded patterns
        if ($nonAscii -match 'Ã|â|â€|â"') {
            $hasMisencoded = $true
        }
        
        # Check for control characters
        if ($nonAscii -match '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]') {
            $hasControl = $true
        }
        
        # Categorize the entry
        if ($hasMisencoded -or $hasControl) {
            $misencodedEntries += [PSCustomObject]@{
                Name = $entry.name
                NonASCIICount = $nonAscii.Length
                Sample = if ($nonAscii.Length -gt 20) { $nonAscii.Substring(0, 17) + "..." } else { $nonAscii }
                Issues = @()
                if ($hasMisencoded) { "Misencoded" }
                if ($hasControl) { "Control chars" }
            }
        } elseif ($hasLegitimate) {
            $legitimateAccents += [PSCustomObject]@{
                Name = $entry.name
                NonASCIICount = $nonAscii.Length
                Sample = if ($nonAscii.Length -gt 20) { $nonAscii.Substring(0, 17) + "..." } else { $nonAscii }
            }
        } else {
            $otherIssues += [PSCustomObject]@{
                Name = $entry.name
                NonASCIICount = $nonAscii.Length
                Sample = if ($nonAscii.Length -gt 20) { $nonAscii.Substring(0, 17) + "..." } else { $nonAscii }
            }
        }
    }
}

# Summary
Write-Host "`n=== Non-ASCII Character Analysis ==="
Write-Host "Entries with legitimate accents: $($legitimateAccents.Count)"
Write-Host "Entries with misencoded characters: $($misencodedEntries.Count)"
Write-Host "Entries with control characters: $($controlCharEntries.Count)"
Write-Host "Entries with other issues: $($otherIssues.Count)"

if ($misencodedEntries.Count -gt 0) {
    Write-Host "`n=== Entries with Misencoded Characters (Need Fixing) ==="
    $misencodedEntries | Select-Object -First 20 | Format-Table -AutoSize
    if ($misencodedEntries.Count -gt 20) {
        Write-Host "... and $($misencodedEntries.Count - 20) more entries with misencoded characters"
    }
}

if ($legitimateAccents.Count -gt 0) {
    Write-Host "`n=== Sample Entries with Legitimate Accents (Should Keep) ==="
    $legitimateAccents | Select-Object -First 10 | Format-Table -AutoSize
}

if ($otherIssues.Count -gt 0) {
    Write-Host "`n=== Entries with Other Non-ASCII Issues ==="
    $otherIssues | Select-Object -First 10 | Format-Table -AutoSize
}

Write-Host "`nAnalysis complete!"
