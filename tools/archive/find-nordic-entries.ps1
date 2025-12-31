# Find entries around i: 6 to see what's available
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Extract all language names and indices
$pattern = '"name":"([^"]+)","i":(\d+)'
$matches = [regex]::Matches($content, $pattern)

Write-Host "Entries around i: 6:"
foreach ($match in $matches) {
    $name = $match.Groups[1].Value
    $index = [int]$match.Groups[2].Value
    if ($index -ge 4 -and $index -le 10) {
        Write-Host "i: $index - $name"
    }
}

# Look for any Nordic-related entries
$nordicRelated = $matches | Where-Object { $_.Groups[1].Value -match "Nordic|Swedish|Danish|Norwegian|Finnish|Icelandic" }
if ($nordicRelated) {
    Write-Host ""
    Write-Host "Nordic-related entries found:"
    foreach ($match in $nordicRelated) {
        $name = $match.Groups[1].Value
        $index = $match.Groups[2].Value
        Write-Host "i: $index - $name"
    }
} else {
    Write-Host ""
    Write-Host "No Nordic-related entries found"
}
