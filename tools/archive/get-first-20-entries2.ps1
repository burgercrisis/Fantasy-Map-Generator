# Get first 20 entries to see what's available
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Extract all language names and indices
$pattern = '"name":"([^"]+)","i":(\d+)'
$matches = [regex]::Matches($content, $pattern)

Write-Host "First 20 language entries:"
for ($i = 0; $i -lt [Math]::Min(20, $matches.Count); $i++) {
    $name = $matches[$i].Groups[1].Value
    $index = $matches[$i].Groups[2].Value
    Write-Host "i: $index - $name"
}
