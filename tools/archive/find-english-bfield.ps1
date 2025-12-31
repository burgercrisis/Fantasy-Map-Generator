# Find exact English entry content
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'
$englishEntry = $entries | Where-Object { $_ -match '"i":\s*1' } | Select-Object -First 1

# Extract just the b field
if ($englishEntry -match '"b":\s*"([^"]*)"') {
    $bField = $matches[1]
    Write-Host "Found English b field:"
    Write-Host $bField
    Write-Host ""
    Write-Host "Looking for 'Berden'..."
    if ($bField -match 'Berden') {
        Write-Host "Found 'Berden' in the field"
    } else {
        Write-Host "'Berden' not found - checking exact spelling"
        # Show names around where Berden should be
        $names = $bField -split ','
        $index = 0
        for ($i = 0; $i -lt $names.Count; $i++) {
            if ($names[$i] -match 'Berden|Barden') {
                Write-Host "Found at index $i : $($names[$i])"
                if ($i -gt 0) { Write-Host "Previous: $($names[$i-1])" }
                if ($i -lt $names.Count - 1) { Write-Host "Next: $($names[$i+1])" }
                break
            }
        }
    }
}
