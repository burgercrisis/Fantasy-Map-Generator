# Extract entries from i: 1 to i: 23 to see what was missed
$content = Get-Content -Path "e:\code\Fantasy-Map-Generator\modules\namebases-real.js" -Raw -Encoding UTF8
$entries = $content -split '(?<=\}),\s*'

for ($i = 1; $i -le 23; $i++) {
    $entry = $entries | Where-Object { $_ -match '"i":\s*' + $i + '\b' } | Select-Object -First 1
    if ($entry) {
        if ($entry -match '"name":\s*"([^"]+)"') {
            Write-Host "i: $i - $($matches[1])"
        } else {
            Write-Host "i: $i - [Could not extract name]"
        }
    } else {
        Write-Host "i: $i - [No entry found]"
    }
}
