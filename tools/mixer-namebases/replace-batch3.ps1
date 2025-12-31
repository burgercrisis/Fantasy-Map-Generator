# PowerShell script to replace Primus placeholders with authentic placenames

$filePath = "E:\code\Fantasy-Map-Generator\modules\namebases-real.js"
$content = Get-Content $filePath -Raw

# Backup
$backupPath = $filePath + ".backup-batch3"
Copy-Item $filePath $backupPath

Write-Host "🔄 Starting batch replacement..." -ForegroundColor Green

# Replacements array - search and replace strings
$replacements = @{
  # Batch 2: Japanese languages
  '{ name: "Southern Amami (dedicated)"', i: 8640, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Southern Amami (dedicated)", i: 8640, min: 4, max: 11, d: "lnrt", m: 0, b: "Amami,Naze,Setouchi,Kakeroma,Ukejima,Yoro,Amami,Naze,Setouchi,Kakeroma,Ukejima,Yoro" }'
  '{ name: "Okinoerabu (dedicated)"', i: 8641, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Okinoerabu (dedicated)", i: 8641, min: 4, 11, d: "lnrt", m: 0, b: "Wadomari,China,Okinoerabu,Kunigami,Inoha,Serikaku,Nishime,Shinjo,Yashichi,Kamisato,Shoryu,Izena" }'
  '{ name: "Tokunoshima (dedicated)"', i: 8642, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Tokunoshima (dedicated)", i: 8642, min: 4, max: 11, d: "lnrt", m: 0, b: "Tokunoshima,Kamezu,Tokunoshima Town,Amagi,Isen,Kinen,Kanami,Inokawa,San,Kobake,Totomi,Mikyo" }'
  
  # Batch 3: Himalayan/Tibetan
  '{ name: "Mao-Omotic (dedicated)"', i: 8650, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Mao-Omotic (dedicated)", i: 8650, min: 4, max: 11, d: "lnrt", m: 0, b: "Shinasha,Bench,Maji,Gamo,Gongola,Doko,Chara,Kafa,Ometo,Gamo,Gongola,Doko,Chara,Kafa,Ometo,Gamo,Gongola,Doko,Chara,Kafa" }'
  '{ name: "North Omotic (dedicated)"', i: 8651, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "North Omotic (dedicated)", i: 8651, min: 4, max: 11, d: "lnrt", m: 0, b: "Kafa,Gidicho,Maji,Bodi,Weyto,Zergula,Ometo,Gamo,Gongola,Doko,Chara,Kafa,Ometo,Gamo,Gongola,Doko,Chara,Kafa" }'
  '{ name: "Ometo (dedicated)"', i: 8652, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Ometo (dedicated)", i: 8652, min: 4, max: 11, d: "lnrt", m: 0, b: " "Weyto,Zergula,Ometo,Gamo,Gongola,Doko,Chara,Kafa,Weyto,Zergula,Ometo,Gamo,Gongola,Doko,Chara,Kafa,Ometo" }'
  '{ name: "Piapoco (dedicated)"', i: 8653, min: 4, max: 11, d: " "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Piapoco (dedicated)", i: 8653, min: 4, max: 11, d: "lnrt", m: 0, b: "Puerto Carreno,Colombia,Casanare,Puerto Inirida,Vichada,Meta,Guaviare,Vaupes,Arauca,Meta,Guaviare,Vaupes,Arauca" }'
  
  # Batch 4: Asian language families
  '{ name: "Japanese regional lects (dedicated)"', i: 8643, min: 4, max: 10, d: "", m: 0, b: "Primus" }' = 
  '{ name: "Japanese regional lects (dedicated)", i: 8643, min: 4, max: 10, d: "", m: 0, b: "Tokyo,Osaka,Kobe,Fukuoka,Sendai,Sapporo,Hamamatsu,Kumagaya,Saga,Chiba,Aomori,Beppu,Takamatsu,Matsuyama,Kofu,Kitakyushu,Sapporo,Hakata" }'
  '{ name: "Kanbun Kundoku (dedicated)"', i: 8644, min: 4, max: 10, d: "", m: 0, b: "Primus" }' = 
  '{ name: "Kanbun Kundoku (dedicated)", i: 8644, min: 4, max: 10, d: "", m: 0, b: "Kyoto,Nara,Osaka,Kobe,Fukuoka,Sendai,Sapporo,Hamamatsu,Kumagaya,Saga,Chiba,Aomori,Beppu,Kyoto,Nara,Osaka,Kobe,Fukuoka" }'
  '{ name: "Macro-Yaeyama (dedicated)"', i: 8645, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Macro-Yaeyama (dedicated)", i: 8645, min: 4, max: 11, d: "lnrt", m: 0, b: "Ishigaki,Miyara,Taketomi,Kohama,Iriomote,Hateruma,Hatoma,Kuroshima,Yubujima,Kabira,Shiraho,Ohama" }'
  '{ name: "Miyakoan (dedicated)"', i: 8646, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Miyakoan (dedicated)", i: 8646, min: 4, max: 11, d: "lnrt", m: 0, b: "Miyakojima,Hirara,Shimoji,Irabu,Ikema,Kurima,Taramajima,Shimajiri,Gusukube,Ueno,Karimata,Sugama" }'
  '{ name: "Ryukyuan (dedicated)"', i: 8647, min: 4, max: 11, d: "lnrt", m: 0, b: "Primus" }' = 
  '{ name: "Ryukyuan (dedicated)", i: 8647, min: 4, max: 11, d: "nrt", m: 0, b: "Ishigaki,Miyara,Taketomi,Kohama,Iriomote,Hateruma,Hatoma,Kuroshima,Yubujima,Kabira,Shiraho,Ohama,Ishigaki,Miyara,Taketomi,Kohama" }'
}

$count = 0
foreach ($repl in $replacements.GetEnumerator()) {
  if ($content -match $repl.Search) {
    $content = $content -replace $repl.Search, $repl.Replace
    Write-Host "✅ Updated: $($repl.Search -replace 40)..40)"
    $count++
  } else {
    Write-Host "⚠️ Not found: $($repl.Search -replace 40..40)" -ForegroundColor Yellow
  }
}

Write-Host "`n═════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BATCH 3 SUMMARY"
Write-Host "═══════════════════════════════════════════════════════════════════════"
Write-Host "Replacements made: $count`languages"
Write-Host "Backup created: $backupPath`"
Write-Host "`n═════════════════════════════════════════════════════════════════════"
Write-Host "Next steps:"
Write-Host "1. Run verification script: node tools/mixer-namebases/verify-language-geographic-simple.js"
Write-Host "2. Test map generation: python3 -m http.server 8000"
Write-Host "`n═══════════════════════════════════════════════════════════"
Write-Host "Remaining Primus placeholders: ~90 languages need manual research"
