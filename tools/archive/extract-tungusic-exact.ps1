# Extract exact Tungusic entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Tungusic".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
