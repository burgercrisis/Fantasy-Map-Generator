# Extract exact Bemba-Bembe-Fwe entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Bemba-Bembe-Fwe".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
