# Extract exact Kwaza-Xoc Amazonian entry for fixing
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$pattern = '"name": "Kwaza-Xoc.*?Amazonian".*?\},'
if ($content -match $pattern) {
    $matches[0]
}
