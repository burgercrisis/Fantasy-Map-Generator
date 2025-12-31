# Extract and analyze Korean names (i: 9)
$koreanEntry = '{"name":"Korean","i":9,"min":5,"max":11,"d":"","m":0,"b":"Anjung,Ansan,Anseong,Anyang,Aphae,Apo,Baekseok,Baeksu,Beolgyo,Boeun,Boseong,Busan,Buyeo,Changnyeong,Changwon,Cheonan,Cheongdo,Cheongjin,Cheongsong,Cheongyang,Cheorwon,Chirwon,Chuncheon,Chungju,Daedeok,Daegaya,Daejeon,Damyang,Dangjin,Dasa,Donghae,Dongsong,Doyang,Eonyang,Gaeseong,Ganggyeong,Ganghwa,Gangneung,Ganseong,Gaun,Geochang,Geoje,Geoncheon,Geumho,Geumil,Geumwang,Gijang,Gimcheon,Gimhwa,Gimje,Goa,Gochang,Gohan,Gongdo,Gongju,Goseong,Goyang,Gumi,Gunpo,Gunsan,Guri,Gurye,Gwangju,Gwangyang,Gwansan,Gyeongseong,Hadong,Hamchang,Hampyeong,Hamyeol,Hanam,Hapcheon,Hayang,Heungnam,Hongnong,Hongseong,Hwacheon,Hwando,Hwaseong,Hwasun,Hwawon,Hyangnam,Incheon,Inje,Iri,Janghang,Jangheung,Jangseong,Jangseungpo,Jangsu,Jecheon,Jeju,Jeomchon,Jeongeup,Jeonggwan,Jeongju,Jeongok,Jeongseon,Jeonju,Jido,Jiksan,Jinan,Jincheon,Jindo,Jingeon,Jinjeop,Jinnampo,Jinyeong,Jocheon,Jochiwon,Jori,Maepo,Mangyeong,Mokpo,Muju,Munsan,Naesu,Naju,Namhae,Namwon,Namyang,Namyangju,Nongong,Nonsan,Ocheon,Okcheon,Okgu,Onam,Onsan,Onyang,Opo,Paengseong,Pogok,Poseung,Pungsan,Pyeongchang,Pyeonghae,Pyeongyang,Sabi,Sacheon,Samcheok,Samho,Samrye,Sancheong,Sangdong,Sangju,Sapgyo,Sariwon,Sejong,Seocheon,Seogwipo,Seonghwan,Seongjin,Seongju,Seongnam,Seongsan,Seosan,Seungju,Siheung,Sindong,Sintaein,Soheul,Sokcho,Songak,Songjeong,Songnim,Songtan,Suncheon,Taean,Taebaek,Tongjin,Uijeongbu,Uiryeong,Uiwang,Uljin,Ulleung,Unbong,Ungcheon,Ungjin,Waegwan,Wando,Wayang,Wiryeseong,Wondeok,Yangju,Yangsan,Yangyang,Yecheon,Yeomchi,Yeoncheon,Yeongam,Yeongcheon,Yeongdeok,Yeongdong,Yeonggwang,Yeongju,Yeongwol,Yeongyang,Yeonil,Yongin,Yongjin,Yugu"}'

# Parse the JSON and extract names
$data = $koreanEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Korean (i: 9) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
