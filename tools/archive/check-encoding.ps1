# Check specific encoding issues
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$arrayStart = $content.IndexOf('[')
$arrayEnd = $content.LastIndexOf(']') + 1
$jsonArray = $content.Substring($arrayStart, $arrayEnd - $arrayStart)
$namebases = $jsonArray | ConvertFrom-Json

# Check first few entries with non-ASCII
$entries = @('German', 'Portuguese', 'Basque')
foreach ($name in $entries) {
    $entry = $namebases | Where-Object { $_.name -eq $name } | Select-Object -First 1
    if ($entry) {
        Write-Host "Entry: $($entry.name)"
        $bases = $entry.b
        $nonAscii = $bases -replace '[\x00-\x7F]', ''
        if ($nonAscii.Length -gt 0) {
            Write-Host "  Non-ASCII chars found: $($nonAscii.Substring(0, 50))"
            # Show hex values
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($nonAscii)
            $hex = $bytes | ForEach-Object { '{0:X2}' -f $_ }
            Write-Host "  Hex: $($hex -join ' ')"
        }
    }
}
