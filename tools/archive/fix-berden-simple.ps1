# Simple fix for Berden -> Barden in English entry
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Replace Berden with Barden in the English entry context
# Look for the pattern: "name":"English","i":1...Berden,Bere
$fixedContent = $content -replace '"name":"English","i":1[^}]*Berden,Bere', '"name":"English","i":1$0Barden,Bere'

# Check if the replacement was made
if ($fixedContent -ne $content) {
    Write-Host "Successfully replaced 'Berden' with 'Barden'"
    # Save the file
    $fixedContent | Out-File -FilePath "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Encoding UTF8 -NoNewline
    Write-Host "File saved successfully"
} else {
    Write-Host "No replacement made - pattern not found"
    
    # Try a simpler approach
    Write-Host "Trying simple replacement..."
    $simpleFixed = $content -replace 'Berden,', 'Barden,'
    if ($simpleFixed -ne $content) {
        Write-Host "Simple replacement worked"
        $simpleFixed | Out-File -FilePath "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Encoding UTF8 -NoNewline
        Write-Host "File saved with simple replacement"
    } else {
        Write-Host "Simple replacement also failed"
    }
}
