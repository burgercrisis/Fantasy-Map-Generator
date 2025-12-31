# Extract and analyze Vietnamese names (i: 28)
$vietnameseEntry = '{"name":"Vietnamese","i":28,"min":3,"max":12,"d":"","m":1,"b":"An Giang,Anh Son,An Khe,An Nhon,Ayun Pa,Bac Giang,Bac Kan,Bac Lieu,Bac Ninh,Ba Don,Ba Loc,Ba Ria,Ba Ria-Vung Tau,Ba Thuoc,Ben Cat,Ben Tre,Bien Hoa,Bim Son,Binh Dinh,Binh Duong,Binh Long,Binh Minh,Binh Phuoc,Binh Thuan,Buon Ho,Buon Ma Thuot,Cai Lay,Ca Mau,Cam Khe,Cam Pha,Cam Ran,Cam Thuy,Can Tho,Cao Bang,Cao Lanh,Cao Phong,Chau Doc,Chi Linh,Con Cuong,Cua Lo,Da Bac,Dak Lak,Da Lat,Da Nang,Dien Ban,Dien Bien,Dien Bien Phu,Dien Chau,Do Luong,Dong Ha,Dong Hoi,Dong Trieu,Duc Pho,Duyen Hai,Duy Tien,Gia Lai,Gia Nghia,Gia Rai,Go Cong,Ha Giang,Ha Hoa,Hai Duong,Hai Phong,Ha Long,Ha Nam,Ha Noi,Ha Tinh,Ha Trung,Hau Giang,Hoa Binh,Hoang Mai,Hoa Thanh,Ho Chi Minh,Hoi An,Hong Linh,Hong Ngu,Hue,Hung Nguyen,Hung Yen,Huong Thuy,Huong Tra,Khanh Hoa,Kien Tuong,Kim Boi,Kinh Mon,Kon Tum,Ky Anh,Ky Son,Lac Son,Lac Thuy,La Gi,Lai Chau,Lam Thao,Lang Chanh,Lang Son,Lao Cai,Long An,Long Khanh,Long My,Long Xuyen,Luong Son,Mai Chau,Mong Cai,Muong Lat,Muong Lay,My Hao,My Tho,Nam Dan,Nam Dinh,Nam Nam,Nga Son,Nghe An,Nghia Dan,Nghia Lo,Nghi Loc,Nghi Son,Ngoc Lac,Nha Trang,Nhu Thanh,Nhu Xuan,Ninh Binh,Ninh Hoa,Nong Cong,Phan Rang Thap Cham,Phan Thiet,Pho Yen,Phu Ly,Phu My,Phu Ninh,Phuoc Long,Phu Tho,Phu Yen,Pleiku,Quang Binh,Quang Nam,Quang Ngai,Quang Ninh,Quang Tri,Quang Xuongg,Quang Yen,Quan Hoa,Quan Son,Que Phong,Quy Chau,Quy Hop,Quynh Luu,Quy Nhon,Rach Gia,Sa Dec,Sai Gon,Sam Son,Sa Pa,Soc Trang,Song Cau,Song Cong,Son La,Son Tay,Tam Diep,Tam Ky,Tan An,Tan Chau,Tan Ky,Tan Lac,Tan Son,Tan Uyen,Tay Ninh,Thach Thanh,Thai Binh,Thai Hoa,Thai Nguyen,Thanh Chuong,Thanh Hoa,Thieu Hoa,Thuan An,Thua Thien-Hue,Thu Dau Mot,Thu Duc,Thuong Xuan,Tien Giang,Trang Bang,Tra Vinh,Trieu Son,Tu Son,Tuyen Quang,Tuy Hoa,Uong Bi,Viet Tri,Vinh,Vinh Chau,Vinh Loc,Vinh Long,Vinh Yen,Vi Thanh,Vung Tau,Yen Bai,Yen Dinh,Yen Thanh,Yen Thuy,Hanoi,Buon Ma Thuot"}'

# Parse the JSON and extract names
$data = $vietnameseEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Vietnamese (i: 28) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
