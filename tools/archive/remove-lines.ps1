$lines = Get-Content 'modules/namebases-fantasy.js'
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($i -lt 373 -or $i -ge 376) {
    $newLines += $lines[$i]
  }
}
Set-Content -Path 'modules/namebases-fantasy.js' -Value $newLines
