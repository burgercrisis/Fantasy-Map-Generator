# Find all entries and their indices to locate Nordic
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Extract all language names and indices
$pattern = '"name":"([^"]+)","i":(\d+)'
$matches = [regex]::Matches($content, $pattern)

Write-Host "All language entries found:"
foreach ($match in $matches) {
    $name = $match.Groups[1].Value
    $index = $match.Groups[2].Value
    Write-Host "i: $index - $name"
}

# Look specifically for Nordic
$nordicMatch = $matches | Where-Object { $_.Groups[1].Value -eq "Nordic" }
if ($nordicMatch) {
    Write-Host ""
    Write-Host "Found Nordic at i: $($nordicMatch.Groups[2].Value)"
} else {
    Write-Host ""
    Write-Host "Nordic not found in entries"
}
