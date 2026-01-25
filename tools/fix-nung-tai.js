const fs = require('fs');

const asia = fs.readFileSync('modules/namebases-asia.js', 'utf8');

// Fix Nung Tai - replace with authentic cities where Nung people live
const fixedAsia = asia.replace(
    /"b": "Nung,Vietnam,Lang Son,Cao Bang,Cao Báº±ng,Báº¯c Giang,Tuyªn Quang,Ha Giang,L o Cai,Diễn Chân"/g,
    '"b": "Lào Cai,Hà Giang,Cao Bằng,Lạng Sơn,Bắc Kạn,Tuyên Quang,Thái Nguyên,Bắc Giang,Hà Nội,Hải Phòng,Hạ Long,Móng Cái"'
);

if (fixedAsia !== asia) {
    fs.writeFileSync('modules/namebases-asia.js', fixedAsia, 'utf8');
    console.log('Fixed Nung Tai');
} else {
    console.log('Nung Tai pattern not found');
}
