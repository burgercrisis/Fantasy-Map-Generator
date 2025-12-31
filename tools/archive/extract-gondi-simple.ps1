# Extract Gondi entry
$content = Get-Content "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw
$pattern = '"name": "Gondi".*?\},'
if($content -match $pattern) {
    $matches[0]
}
