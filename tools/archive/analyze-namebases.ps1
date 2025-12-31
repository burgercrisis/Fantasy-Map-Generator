# Load the file content
$filePath = "e:\code\Fantasy-Map-Generator\modules\namebases-real.js"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Extract the array part from the file
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)

# Convert JSON array to PowerShell objects
try {
    $namebases = $jsonArray | ConvertFrom-Json -ErrorAction Stop
}
catch {
    Write-Host "Error parsing JSON: $_"
    exit 1
}

# Initialize counters
$nameCounts = @{
    '1' = 0; '2' = 0; '3' = 0; '4' = 0; '5' = 0;
    '6-10' = 0; '11-19' = 0; '20+' = 0
}

$entriesWithEncodingIssues = @()
$entriesWithFewNames = @()

# Patterns to detect encoding issues
$encodingIssues = @(
    @{ Pattern = '[\x80-\xFF]'; Description = 'Non-ASCII characters' },
    @{ Pattern = 'â€[^"]*'; Description = 'Windows-1252 to UTF-8 conversion artifacts' },
    @{ Pattern = '\?\?'; Description = 'Unicode replacement characters' }
)

# Analyze each entry
foreach ($entry in $namebases) {
    $name = $entry.name
    $bases = $entry.b
    
    # Count names
    $nameList = @($bases -split ',' | Where-Object { $_.Trim() -ne '' })
    $count = $nameList.Count
    
    # Categorize by count
    if ($count -eq 0) { $nameCounts['1']++ }
    elseif ($count -eq 1) { $nameCounts['1']++ }
    elseif ($count -eq 2) { $nameCounts['2']++ }
    elseif ($count -eq 3) { $nameCounts['3']++ }
    elseif ($count -eq 4) { $nameCounts['4']++ }
    elseif ($count -eq 5) { $nameCounts['5']++ }
    elseif ($count -le 10) { $nameCounts['6-10']++ }
    elseif ($count -le 19) { $nameCounts['11-19']++ }
    else { $nameCounts['20+']++ }
    
    # Track entries with few names
    if ($count -ge 1 -and $count -le 5) {
        $entriesWithFewNames += [PSCustomObject]@{
            Name      = $name
            NameCount = $count
            Example   = if ($nameList.Count -gt 0) { $nameList[0] } else { "" }
        }
    }
    
    # Check for encoding issues
    $issues = @()
    foreach ($issue in $encodingIssues) {
        if ($bases -match $issue.Pattern) {
            $issues += $issue.Description
        }
    }
    
    if ($issues.Count -gt 0) {
        $entriesWithEncodingIssues += [PSCustomObject]@{
            Name       = $name
            IssueCount = $issues.Count
            Issues     = $issues -join '; '
            Example    = if ($bases.Length -gt 30) { $bases.Substring(0, 27) + '...' } else { $bases }
        }
    }
}

# Output analysis
Write-Host "`n=== Namebase Analysis ==="
Write-Host "File: $filePath"
Write-Host "Total size: $([math]::Round($content.Length/1MB, 2)) MB"
Write-Host "Total entries: $($namebases.Count)"

Write-Host "`n=== Entries by Name Count ==="
$total = $namebases.Count
$nameCounts.GetEnumerator() | Sort-Object {
    if ($_.Key -match '^(\d+)-?') { [int]$matches[1] } else { [int]::MaxValue }
} | ForEach-Object {
    $percent = if ($total -gt 0) { $_.Value / $total } else { 0 }
    Write-Host ("{0,-6} : {1,4} ({2,6:P1})" -f $_.Key, $_.Value, $percent)
}

# Output encoding issues
if ($entriesWithEncodingIssues.Count -gt 0) {
    Write-Host "`n=== Potential Encoding Issues ==="
    $entriesWithEncodingIssues | Select-Object -First 10 | Format-Table -AutoSize
    if ($entriesWithEncodingIssues.Count -gt 10) {
        Write-Host "... and $($entriesWithEncodingIssues.Count - 10) more entries with potential encoding issues"
    }
}

# Output entries with few names
if ($entriesWithFewNames.Count -gt 0) {
    Write-Host "`n=== Entries with 1-5 Names ==="
    $entriesWithFewNames | Sort-Object NameCount, Name | Select-Object -First 20 | Format-Table -AutoSize
    if ($entriesWithFewNames.Count -gt 20) {
        Write-Host "... and $($entriesWithFewNames.Count - 20) more entries with 1-5 names"
    }
}

Write-Host "`nAnalysis complete."
