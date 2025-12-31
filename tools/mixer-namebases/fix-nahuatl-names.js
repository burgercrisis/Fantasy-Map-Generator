#!/usr/bin/env node

/**
 * Simple Fix for Indigenous Language Names
 * 
 * Fixes only the key inaccurate names:
 * - Nahuatl: Mexico → Mexihco, Oaxaca → Huaxyacac
 */

const fs = require('fs');
const path = require('path');

const namebasePath = path.join(__dirname, '../../modules/namebases-real.js');
const generatorPath = path.join(__dirname, '../../modules/names-generator.js');

console.log('Reading namebase files...');

const namebaseContent = fs.readFileSync(namebasePath, 'utf8');
const generatorContent = fs.readFileSync(generatorPath, 'utf8');

console.log('Applying fixes...\n');

// Fix for namebases-real.js
const fixedNamebase = namebaseContent.replace(
  /\b: "Acapulco,Acatepec,Acatlan,Acaxochitlan,Acolman,Actopan,Acuamanala,Ahuacatlan,Almoloya,Amacuzac,Amanalco,Amaxac,Apaxco,Apetatitlan,Apizaco,Atenco,Atizapan,Atlacomulco,Atlapexco,Atotonilco,Axapusco,Axochiapan,Axocomanitla,Axutla,Azcapotzalco,Aztahuacan,Calimaya,Calnali,Calpulalpan,Camotlan,Capulhuac,Chalco,Chapulhuacan,Chapultepec,Chiapan,Chiautempan,Chiconautla,Chihuahua,Chilcuautla,Chimalhuacan,Cholollan,Cihuatlan,Coahuila,Coatepec,Coatetelco,Coatlan,Coatlinchan,Coatzacoalcos,Cocotitlan,Cohetzala,Colima,Colotlan,Coyoacan,Coyohuacan,Cuapiaxtla,Cuauhnahuac,Cuauhtemoc,Cuauhtitlan,Cuautepec,Cuautla,Cuaxomulco,Culhuacan,Ecatepec,Eloxochitlan,Epatlan,Epazoyucan,Huamantla,Huascazaloya,Huatlatlauca,Huautla,Huehuetlan,Huehuetoca,Huexotla,Hueyapan,Hueyotlipan,Hueypoxtla,Huichapan,Huimilpan,Huitzilac,Ixtapallocan,Iztacalco,Iztaccihuatl,Iztapalapa,Lolotla,Malinalco,Mapachtlan,Mazatepec,Mazatlan,Metepec,Metztitlan,Mexico,Miacatlan,Michoacan,Minatitlan,Mixcoac,Mixtla,Molcaxac,Nanacamilpa,Naucalpan,Naupan,Nextlalpan,Nezahualcoyotl,Nopalucan,Oaxaca,Ocotepec,Ocotitlan,Ocotlan,Ocoyoacac,Ocuilan,Ocuituco,Omitlan,Otompan,Otzoloapan,Pacula,Pahuatlan,Panotla,Papalotla,Patlachican,Piaztla,Popocatepetl,Sultepec,Tecamac,Tecolotlan,Tecozautla,Temamatla,Temascalapa,Temixco,Temoac,Temoaya,Tenayuca,Tenochtitlan,Teocuitlatlan,Teotihuacan,Teotlalco,Tepeacac,Tepeapulco,Tepehuacan,Tepetitlan,Tepeyanco,Tepotzotlan,Tepoztlan,Tetecala,Tetlatlahuca,Texcalyacac,Texcoco,Tezontepec,Tezoyuca,Timilpan,Tizapan,Tizayuca,Tlacopan,Tlacotenco,Tlahuac,Tlahuelilpan,Tlahuiltepa,Tlalmanalco,Tlalnepantla,Tlalpan,Tlanchinol,Tlatelolco,Tlaxcala,Tlaxcoapan,Tlayacapan,Tocatlan,Tolcayuca,Toluca,Tonanitla,Tonantzintla,Tonatico,Totolac,Totolapan,Tototlan,Tuchtlan,Tulantepec,Tultepec,Tzompantepec,Xalatlaco,Xaloztoc,Xaltocan,Xiloxoxtla,Xochiatipan,Xochicoatlan,Xochimilco,Xochitepec,Xolotlan,Xonacatlan,Yahualica,Yautepec,Yecapixtla,Yehaultepec,Zacatecas,Zacazonapan/,
  'b: "Acapulco,Acatepec,Acatlan,Acaxochitlan,Acolman,Actopan,Acuamanala,Ahuacatlan,Almoloya,Amacuzac,Amanalco,Amaxac,Apaxco,Apetatitlan,Apizaco,Atenco,Atizapan,Atlacomulco,Atlapexco,Atotonilco,Axapusco,Axochiapan,Axocomanitla,Axutla,Azcapotzalco,Aztahuacan,Calimaya,Calnali,Calpulalpan,Camotlan,Capulhuac,Chalco,Chapulhuacan,Chapultepec,Chiapan,Chiautempan,Chiconautla,Chihuahua,Chilcuautla,Chimalhuacan,Cholollan,Cihuatlan,Coahuila,Coatepec,Coatetelco,Coatlan,Coatlinchan,Coatzacoalcos,Cocotitlan,Cohetzala,Colima,Colotlan,Coyoacan,Coyohuacan,Cuapiaxtla,Cuauhnahuac,Cuauhtemoc,Cuauhtitlan,Cuautepec,Cuautla,Cuaxomulco,Culhuacan,Ecatepec,Eloxochitlan,Epatlan,Epazoyucan,Huamantla,Huascazaloya,Huatlatlauca,Huautla,Huehuetlan,Huehuetoca,Huexotla,Hueyapan,Hueyotlipan,Hueypoxtla,Huichapan,Huimilpan,Huitzilac,Ixtapallocan,Iztacalco,Iztaccihuatl,Iztapalapa,Lolotla,Malinalco,Mapachtlan,Mazatepec,Mazatlan,Metepec,Metztitlan,Mexihco,Miacatlan,Michoacan,Minatitlan,Mixcoac,Mixtla,Molcaxac,Nanacamilpa,Naucalpan,Naupan,Nextlalpan,Nezahualcoyotl,Nopalucan,Huaxyacac,Ocotepec,Ocotitlan,Ocotlan,Ocoyoacac,Ocuilan,Ocuituco,Omitlan,Otompan,Otzoloapan,Pacula,Pahuatlan,Panotla,Papalotla,Patlachican,Piaztla,Popocatepetl,Sultepec,Tecamac,Tecolotlan,Tecozautla,Temamatla,Temascalapa,Temixco,Temoac,Temoaya,Tenayuca,Tenochtitlan,Teocuitlatlan,Teotihuacan,Teotlalco,Tepeacac,Tepeapulco,Tepehuacan,Tepetitlan,Tepeyanco,Tepotzotlan,Tepoztlan,Tetecala,Tetlatlahuca,Texcalyacac,Texcoco,Tezontepec,Tezoyuca,Timilpan,Tizapan,Tizayuca,Tlacopan,Tlacotenco,Tlahuac,Tlahuelilpan,Tlahuiltepa,Tlalmanalco,Tlalnepantla,Tlalpan,Tlanchinol,Tlatelolco,Tlaxcala,Tlaxcoapan,Tlayacapan,Tocatlan,Tolcayuca,Toluca,Tonanitla,Tonantzintla,Tonatico,Totolac,Totolapan,Tototlan,Tuchtlan,Tulantepec,Tultepec,Tzompantepec,Xalatlaco,Xaloztoc,Xaltocan,Xiloxoxtla,Xochiatipan,Xochicoatlan,Xochimilco,Xochitepec,Xolotlan,Xonacatlan,Yahualica,Yautepec,Yecapixtla,Yehaultepec,Zacatecas,Zacazonapan'
);

// Same fix for names-generator.js
const fixedGenerator = generatorContent.replace(
  /\b: "Acapulco,Acatepec,Acatlan,Acaxochitlan,Acolman,Actopan,Acuamanala,Ahuacatlan,Almoloya,Amacuzac,Amanalco,Amaxac,Apaxco,Apetatitlan,Apizaco,Atenco,Atizapan,Atlacomulco,Atlapexco,Atotonilco,Axapusco,Axochiapan,Axocomanitla,Axutla,Azcapotzalco,Aztahuacan,Calimaya,Calnali,Calpulalpan,Camotlan,Capulhuac,Chalco,Chapulhuacan,Chapultepec,Chiapan,Chiautempan,Chiconautla,Chihuahua,Chilcuautla,Chimalhuacan,Cholollan,Cihuatlan,Coahuila,Coatepec,Coatetelco,Coatlan,Coatlinchan,Coatzacoalcos,Cocotitlan,Cohetzala,Colima,Colotlan,Coyoacan,Coyohuacan,Cuapiaxtla,Cuauhnahuac,Cuauhtemoc,Cuauhtitlan,Cuautepec,Cuautla,Cuaxomulco,Culhuacan,Ecatepec,Eloxochitlan,Epatlan,Epazoyucan,Huamantla,Huascazaloya,Huatlatlauca,Huautla,Huehuetlan,Huehuetoca,Huexotla,Hueyapan,Hueyotlipan,Hueypoxtla,Huichapan,Huimilpan,Huitzilac,Ixtapallocan,Iztacalco,Iztaccihuatl,Iztapalapa,Lolotla,Malinalco,Mapachtlan,Mazatepec,Mazatlan,Metepec,Metztitlan,Mexico,Miacatlan,Michoacan,Minatitlan,Mixcoac,Mixtla,Molcaxac,Nanacamilpa,Naucalpan,Naupan,Nextlalpan,Nezahualcoyotl,Nopalucan,Oaxaca,Ocotepec,Ocotitlan,Ocotlan,Ocoyoacac,Ocuilan,Ocuituco,Omitlan,Otompan,Otzoloapan,Pacula,Pahuatlan,Panotla,Papalotla,Patlachican,Piaztla,Popocatepetl,Sultepec,Tecamac,Tecolotlan,Tecozautla,Temamatla,Temascalapa,Temixco,Temoac,Temoaya,Tenayuca,Tenochtitlan,Teocuitlatlan,Teotihuacan,Teotlalco,Tepeacac,Tepeapulco,Tepehuacan,Tepetitlan,Tepeyanco,Tepotzotlan,Tepoztlan,Tetecala,Tetlatlahuca,Texcalyacac,Texcoco,Tezontepec,Tezoyuca,Timilpan,Tizapan,Tizayuca,Tlacopan,Tlacotenco,Tlahuac,Tlahuelilpan,Tlahuiltepa,Tlalmanalco,Tlalnepantla,Tlalpan,Tlanchinol,Tlatelolco,Tlaxcala,Tlaxcoapan,Tlayacapan,Tocatlan,Tolcayuca,Toluca,Tonanitla,Tonantzintla,Tonatico,Totolac,Totolapan,Tototlan,Tuchtlan,Tulantepec,Tultepec,Tzompantepec,Xalatlaco,Xaloztoc,Xaltocan,Xiloxoxtla,Xochiatipan,Xochicoatlan,Xochimilco,Xochitepec,Xolotlan,Xonacatlan,Yahualica,Yautepec,Yecapixtla,Yehaultepec,Zacatecas,Zacazonapan/,
  'b: "Acapulco,Acatepec,Acatlan,Acaxochitlan,Acolman,Actopan,Acuamanala,Ahuacatlan,Almoloya,Amacuzac,Amanalco,Amaxac,Apaxco,Apetatitlan,Apizaco,Atenco,Atizapan,Atlacomulco,Atlapexco,Atotonilco,Axapusco,Axochiapan,Axocomanitla,Axutla,Azcapotzalco,Aztahuacan,Calimaya,Calnali,Calpulalpan,Camotlan,Capulhuac,Chalco,Chapulhuacan,Chapultepec,Chiapan,Chiautempan,Chiconautla,Chihuahua,Chilcuautla,Chimalhuacan,Cholollan,Cihuatlan,Coahuila,Coatepec,Coatetelco,Coatlan,Coatlinchan,Coatzacoalcos,Cocotitlan,Cohetzala,Colima,Colotlan,Coyoacan,Coyohuacan,Cuapiaxtla,Cuauhnahuac,Cuauhtemoc,Cuauhtitlan,Cuautepec,Cuautla,Cuaxomulco,Culhuacan,Ecatepec,Eloxochitlan,Epatlan,Epazoyucan,Huamantla,Huascazaloya,Huatlatlauca,Huautla,Huehuetlan,Huehuetoca,Huexotla,Hueyapan,Hueyotlipan,Hueypoxtla,Huichapan,Huimilpan,Huitzilac,Ixtapallocan,Iztacalco,Iztaccihuatl,Iztapalapa,Lolotla,Malinalco,Mapachtlan,Mazatepec,Mazatlan,Metepec,Metztitlan,Mexihco,Miacatlan,Michoacan,Minatitlan,Mixcoac,Mixtla,Molcaxac,Nanacamilpa,Naucalpan,Naupan,Nextlalpan,Nezahualcoyotl,Nopalucan,Huaxyacac,Ocotepec,Ocotitlan,Ocotlan,Ocoyoacac,Ocuilan,Ocuituco,Omitlan,Otompan,Otzoloapan,Pacula,Pahuatlan,Panotla,Papalotla,Patlachican,Piaztla,Popocatepetl,Sultepec,Tecamac,Tecolotlan,Tecozautla,Temamatla,Temascalapa,Temixco,Temoac,Temoaya,Tenayuca,Tenochtitlan,Teocuitlatlan,Teotihuacan,Teotlalco,Tepeacac,Tepeapulco,Tepehuacan,Tepetitlan,Tepeyanco,Tepotzotlan,Tepoztlan,Tetecala,Tetlatlahuca,Texcalyacac,Texcoco,Tezontepec,Tezoyuca,Timilpan,Tizapan,Tizayuca,Tlacopan,Tlacotenco,Tlahuac,Tlahuelilpan,Tlahuiltepa,Tlalmanalco,Tlalnepantla,Tlalpan,Tlanchinol,Tlatelolco,Tlaxcala,Tlaxcoapan,Tlayacapan,Tocatlan,Tolcayuca,Toluca,Tonanitla,Tonantzintla,Tonatico,Totolac,Totolapan,Tototlan,Tuchtlan,Tulantepec,Tultepec,Tzompantepec,Xalatlaco,Xaloztoc,Xaltocan,Xiloxoxtla,Xochiatipan,Xochicoatlan,Xochimilco,Xochitepec,Xolotlan,Xonacatlan,Yahualica,Yautepec,Yecapixtla,Yehaultepec,Zacatecas,Zacazonapan'
);

fs.writeFileSync(namebasePath, fixedNamebase, 'utf8');
fs.writeFileSync(generatorPath, fixedGenerator, 'utf8');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║        INDIGENOUS LANGUAGE NAMES FIXED                        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('✅ Fixed Nahuatl names:');
console.log('   "Mexico" → "Mexihco" (authentic Nahuatl spelling)');
console.log('   "Oaxaca" → "Huaxyacac" (Nahuatl name for Oaxaca)\n');

console.log('✅ Files updated:');
console.log('   - modules/namebases-real.js');
console.log('   - modules/names-generator.js\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('Next steps:');
console.log('1. Start HTTP server: python3 -m http.server 8000');
console.log('2. Open http://localhost:8000 in browser');
console.log('3. Generate a new map and verify Nahuatl names use authentic spellings');
console.log('4. Test with the Nahuatl language in Culture settings\n');
