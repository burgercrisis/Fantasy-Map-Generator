# Extract exact Purepecha entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Pur.*?pecha".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
