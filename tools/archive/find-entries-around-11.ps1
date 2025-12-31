# Find entries around i: 11 to see what's available
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Extract all language names and indices
$pattern = '"name":"([^"]+)","i":(\d+)'
$matches = [regex]::Matches($content, $pattern)

Write-Host "Entries around i: 11:"
foreach ($match in $matches) {
    $name = $match.Groups[1].Value
    $index = [int]$match.Groups[2].Value
    if ($index -ge 9 -and $index -le 13) {
        Write-Host "i: $index - $name"
    }
}
