# Extract exact Berta-Besme entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Berta-Besme".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
