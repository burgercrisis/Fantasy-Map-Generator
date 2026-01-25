/**
 * Wave 40 Enhancement Script
 * Korean and Chinese Language Entry Verification
 * Adds missing major cities while preserving all existing entries
 */

const fs = require("fs");
const path = require("path");

// Safety guardrails
const { validateNoTruncation, createBackup } = require("./namebase-safety-guardrails.js");

const NAMENAME_DIR = path.join(__dirname, "..", "modules");
const filePath = path.join(NAMENAME_DIR, "namebases-all.js");

// Read current file
const originalContent = fs.readFileSync(filePath, "utf8");
console.log(`📄 Loaded: ${filePath}`);
console.log(`📊 Current entries: ${originalContent.match(/"name":\s*"/g).length}`);

// === KOREAN ENTRY ENHANCEMENT ===
const koreanPattern = /\{\s*"name":\s*"Korean",\s*"i":\s*9,.*?"b":\s*"([^"]+)"\s*\}/s;
const koreanMatch = originalContent.match(koreanPattern);

if (koreanMatch) {
    const currentKoreanNames = koreanMatch[1];
    console.log(`\n🇰🇷 KOREAN ENTRY ANALYSIS`);
    console.log(`   Current names: ${currentKoreanNames.split(",").length}`);

    // Check for missing cities
    const missingSeoul = !currentKoreanNames.includes("Seoul");
    const missingPyongyang = !currentKoreanNames.includes("Pyongyang");

    console.log(`   ❌ Missing Seoul: ${missingSeoul}`);
    console.log(`   ❌ Missing Pyongyang: ${missingPyongyang}`);

    // Create enhancement additions
    const koreanAdditions = [];

    // Major Korean cities to add
    if (missingSeoul) koreanAdditions.push("Seoul");
    if (missingPyongyang) koreanAdditions.push("Pyongyang");

    // North Korean cities (comprehensive list)
    const northKoreanCities = [
        "Hamhung", "Chongjin", "Wonsan", "Nampo", "Kaesong", "Sinuiju",
        "Hamhŭng", "Chongjin", "Wŏnsan", "Namp'o", "Kaesŏng", "Sinŭiju",
        "Tanchon", "Kaechon", "Sunchon", "Hungnam", "Rason", "Kimchaek",
        "Haeju", "Kanggye", "Hyesan", "Tokchon", "Anju", "Kusong",
        "P'yongsong", "Manp'o", "Pyongsong", "Uiju", "Hoeryong"
    ];

    northKoreanCities.forEach(city => {
        if (!currentKoreanNames.includes(city)) {
            koreanAdditions.push(city);
        }
    });

    // Additional South Korean cities that might be missing
    const additionalSouthKorean = [
        "Ulsan", "Gwangmyeong", "Gwangmyeong-si", "Siheung", "Gwangmyeong",
        "Hanam-si", "Goyang-si", "Seongnam-si", "Suwon-si", "Yongin-si",
        "Bucheon-si", "Ansan-si", "Anyang-si", "Gimpo-si", "Pocheon-si"
    ];

    additionalSouthKorean.forEach(city => {
        if (!currentKoreanNames.includes(city.replace("-si", "")) && !currentKoreanNames.includes(city)) {
            koreanAdditions.push(city.replace("-si", ""));
        }
    });

    console.log(`   ➕ Korean cities to add: ${koreanAdditions.length}`);
    console.log(`   Additions: ${koreanAdditions.join(", ")}`);

    // Create enhanced Korean entry
    const enhancedKoreanNames = currentKoreanNames + "," + koreanAdditions.join(",");
    const newKoreanEntry = koreanMatch[0].replace(
        /"b":\s*"([^"]+)"/,
        `"b": "${enhancedKoreanNames}"`
    );

    // Replace in file
    let newContent = originalContent.replace(koreanMatch[0], newKoreanEntry);
    console.log(`   ✅ Korean entry enhanced`);

    // === CHINESE ENTRY ENHANCEMENT ===
    const chinesePattern = /\{\s*"name":\s*"Chinese",\s*"i":\s*10,.*?"b":\s*"([^"]+)"\s*\}/s;
    const chineseMatch = newContent.match(chinesePattern);

    if (chineseMatch) {
        const currentChineseNames = chineseMatch[1];
        console.log(`\n🇨🇳 CHINESE ENTRY ANALYSIS`);
        console.log(`   Current names: ${currentChineseNames.split(",").length}`);

        // Check for missing Taiwanese cities
        const missingTaipei = !currentChineseNames.includes("Taipei");
        const missingKaohsiung = !currentChineseNames.includes("Kaohsiung");
        const missingTaichung = !currentChineseNames.includes("Taichung");
        const missingTainan = !currentChineseNames.includes("Tainan");

        console.log(`   ❌ Missing Taipei: ${missingTaipei}`);
        console.log(`   ❌ Missing Kaohsiung: ${missingKaohsiung}`);
        console.log(`   ❌ Missing Taichung: ${missingTaichung}`);
        console.log(`   ❌ Missing Tainan: ${missingTainan}`);

        // Create Taiwanese additions
        const taiwaneseCities = [
            "Taipei", "Kaohsiung", "Taichung", "Tainan", "New Taipei",
            "Taoyuan", "Taichung", "Chiayi", "Hsinchu", "Keelung",
            "Miaoli", "Changhua", "Nantou", "Yunlin", "Pingtung",
            "Yilan", "Hualien", "Taitung", "Penghu", "Kinmen",
            "Zhubei", "Fengyuan", "Dali", "Yangmei", "Pingtung",
            "Hualien City", "Taitung City", "Magong", "Keelung"
        ];

        const chineseAdditions = [];
        taiwaneseCities.forEach(city => {
            if (!currentChineseNames.includes(city)) {
                chineseAdditions.push(city);
            }
        });

        console.log(`   ➕ Taiwanese cities to add: ${chineseAdditions.length}`);

        // Create enhanced Chinese entry
        const enhancedChineseNames = currentChineseNames + "," + chineseAdditions.join(",");
        const newChineseEntry = chineseMatch[0].replace(
            /"b":\s*"([^"]+)"/,
            `"b": "${enhancedChineseNames}"`
        );

        newContent = newContent.replace(chineseMatch[0], newChineseEntry);
        console.log(`   ✅ Chinese entry enhanced`);
    }

    // === SAFETY VALIDATION ===
    console.log(`\n🛡️ SAFETY VALIDATION`);
    validateNoTruncation(filePath, newContent, "Wave 40 Enhancement");

    // Create backup
    const backupPath = createBackup(filePath);

    // Write changes
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Successfully updated: ${path.basename(filePath)}`);

    // Summary
    console.log(`\n📊 ENHANCEMENT SUMMARY`);
    console.log(`   Korean additions: ${koreanAdditions.length} cities`);
    console.log(`   Chinese additions: ${chineseAdditions.length} cities`);
    console.log(`   Total additions: ${koreanAdditions.length + (chineseAdditions?.length || 0)} names`);
    console.log(`   ✅ All existing entries preserved - ADDITIONS ONLY`);

} else {
    console.log("❌ Korean entry not found in file");
}
