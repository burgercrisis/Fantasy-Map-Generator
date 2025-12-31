# Extract exact Bauchi Chadic entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Bauchi Chadic".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
