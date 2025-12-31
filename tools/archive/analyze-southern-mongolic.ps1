# Extract and analyze Southern Mongolic names (i: 65)
$southernMongolicEntry = '{"name":"Southern Mongolic","i":65,"min":5,"max":11,"d":"nic-GH","m":0,"b":"Lanzhou,Wuwei,Zhangye,Jiuquan,Dunhuang,Zhongwei,Yinchuan,Wuzhong,Guyuan,Shapotou,Qingyang,Tianshui,Dingxi,Baiyin,Xining,Haibei,Haidong,Hainan,Huangyuan,Minhe,Ledu,Yongchang"}'

# Parse the JSON and extract names
$data = $southernMongolicEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Southern Mongolic (i: 65) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
