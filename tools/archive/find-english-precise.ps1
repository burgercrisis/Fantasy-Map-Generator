# Find English entry more precisely
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8

# Look for the specific pattern that includes English
$englishPattern = '"name":"English","i":1'
$patternIndex = $content.IndexOf($englishPattern)

if ($patternIndex -ge 0) {
    # Get context around the English entry
    $startContext = [Math]::Max(0, $patternIndex - 50)
    $endContext = [Math]::Min($content.Length, $patternIndex + 500)
    $context = $content.Substring($startContext, $endContext - $startContext)
    
    Write-Host "Found English entry pattern at position $patternIndex"
    Write-Host "Context around English entry:"
    Write-Host $context
} else {
    Write-Host "English entry pattern not found"
    # Let's check if the file structure is different
    Write-Host "Looking for 'English' in the file..."
    $englishIndex = $content.IndexOf('"English"')
    if ($englishIndex -ge 0) {
        $startContext = [Math]::Max(0, $englishIndex - 50)
        $endContext = [Math]::Min($content.Length, $englishIndex + 200)
        $context = $content.Substring($startContext, $endContext - $startContext)
        Write-Host "Found 'English' at position $englishIndex:"
        Write-Host $context
    }
}
