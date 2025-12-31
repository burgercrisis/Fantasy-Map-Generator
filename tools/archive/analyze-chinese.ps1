# Extract and analyze Chinese names (i: 10)
$chineseEntry = '{"name":"Chinese","i":10,"min":5,"max":10,"d":"","m":0,"b":"Anding,Anlu,Anqing,Anshun,Baixing,Banyang,Baoqing,Binzhou,Caozhou,Changbai,Changchun,Changde,Changling,Changsha,Changzhou,Chengdu,Chenzhou,Chizhou,Chongqing,Chuxiong,Chuzhou,Dading,Daming,Datong,Daxing,Dengzhou,Deqing,Dihua,Dingli,Dongan,Dongchang,Dongchuan,Dongping,Duyun,Fengtian,Fengxiang,Fengyang,Fenzhou,Funing,Fuzhou,Ganzhou,Gaoyao,Gaozhou,Gongchang,Guangnan,Guangning,Guangping,Guangxin,Guangzhou,Guiyang,Hailong,Hangzhou,Hanyang,Hanzhong,Heihe,Hejian,Henan,Hengzhou,Hezhong,Huaian,Huaiqing,Huanglong,Huangzhou,Huining,Hulan,Huzhou,Jiading,Jian,Jianchang,Jiangning,Jiankang,Jiaxing,Jiayang,Jilin,Jinan,Jingjiang,Jingzhao,Jinhua,Jinzhou,Jiujiang,Kaifeng,Kaihua,Kangding,Kuizhou,Laizhou,Lianzhou,Liaoyang,Lijiang,Linan,Linhuang,Lintao,Liping,Liuzhou,Longan,Longjiang,Longxing,Luan,Lubin,Luzhou,Mishan,Nanan,Nanchang,Nandian,Nankang,Nanyang,Nenjiang,Ningbo,Ningguo,Ningwu,Ningxia,Ningyuan,Pingjiang,Pingliang,Pingyang,Puer,Puzhou,Qianzhou,Qingyang,Qingyuan,Qingzhou,Qujing,Quzhou,Raozhou,Rende,Ruian,Ruizhou,Shafeng,Shaoqing,Shaowu,Shaoxing,Shaozhou,Shinan,Shiqian,Shouchun,Shuangcheng,Shulei,Shunde,Shuntian,Shuoping,Sicheng,Sinan,Sizhou,Songjiang,Suiding,Suihua,Suining,Suzhou,Taian,Taibei,Taiping,Taiwan,Taiyuan,Taizhou,Taonan,Tengchong,Tingzhou,Tongchuan,Tongqing,Tongzhou,Weihui,Wensu,Wenzhou,Wuchang,Wuding,Wuzhou,Xian,Xianchun,Xianping,Xijin,Xiliang,Xincheng,Xingan,Xingde,Xinghua,Xingjing,Xingyi,Xingyuan,Xingzhong,Xining,Xinmen,Xiping,Xuanhua,Xunzhou,Xuzhou,Yanan,Yangzhou,Yanji,Yanping,Yanzhou,Yazhou,Yichang,Yidu,Yilan,Yili,Yingchang,Yingde,Yingtian,Yingzhou,Yongchang,Yongping,Yongshun,Yuanzhou,Yuezhou,Yulin,Yunnan,Yunyang,Zezhou,Zhang,Zhangzhou,Zhaoqing,Zhaotong,Zhenan,Zhending,Zhenhai,Zhenjiang,Zhenxi,Zhenyun,Zhongshan,Zunyi"}'

# Parse the JSON and extract names
$data = $chineseEntry | ConvertFrom-Json
$names = $data.b -split ','

Write-Host "=== Chinese (i: 10) Analysis ==="
Write-Host "Total names: $($names.Count)"
Write-Host ""
Write-Host "First 20 names:"
$names | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
Write-Host ""
Write-Host "Last 20 names:"
$names | Select-Object -Last 20 | ForEach-Object { Write-Host "  $_" }
