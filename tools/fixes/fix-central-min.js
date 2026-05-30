const fs = require('fs');

const asia = fs.readFileSync('modules/namebases-asia.js', 'utf8');

// Fix Central Min - replace with actual cities in Fujian where Min languages are spoken
const fixedAsia = asia.replace(
    /"b": "Min Nan,Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Fujian,China,Min River,Min Dialect"/g,
    '"b": "Xiamen,Quanzhou,Zhangzhou,Longyan,Fuzhou,Putian,Sanming,Nanping,Longhai,Zhangpu,Yongding,Chengxiang,Jinjiang,Fuding"'
);

if (fixedAsia !== asia) {
    fs.writeFileSync('modules/namebases-asia.js', fixedAsia, 'utf8');
    console.log('Fixed Central Min');
} else {
    console.log('Central Min pattern not found');
}
