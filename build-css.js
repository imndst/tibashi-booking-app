// // build-css.js
// const fs = require('fs');
// const path = require('path');

// const baseDir = './';

// function readFile(filePath) {
//   const fullPath = path.join(baseDir, filePath.replace(/\/\//g, '/'));
//   try {
//     return fs.readFileSync(fullPath, 'utf8');
//   } catch(e) {
//     console.warn(`⚠️ پیدا نشد: ${filePath}`);
//     return '';
//   }
// }

// function bundle(mainFile) {
//   let content = readFile(mainFile);
  
//   // جایگزین کردن هر @import با محتوای واقعی فایل
//   content = content.replace(/@import\s+"(.+?)";/g, (_, importedFile) => {
//     console.log(`📥 merge: ${importedFile}`);
//     return readFile(importedFile);
//   });

//   return content;
// }

// if (!fs.existsSync('dist')) fs.mkdirSync('dist');

// const version = Date.now();
// const result = bundle('app.css');
// const outFile = `dist/app.${version}.css`;

// fs.writeFileSync(outFile, result, 'utf8');
// console.log(`\n✅ ساخته شد: ${outFile}`);
// console.log(`📦 حجم: ${(result.length / 1024).toFixed(1)} KB`);





// build-css.js
const fs = require('fs');
const path = require('path');

const baseDir = './';

function readFile(filePath) {
  const fullPath = path.join(baseDir, filePath.replace(/\/\//g, '/'));
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch(e) {
    console.warn(`⚠️ پیدا نشد: ${filePath}`);
    return '';
  }
}

function bundle(mainFile) {
  let content = readFile(mainFile);
  content = content.replace(/@import\s+"(.+?)";/g, (_, importedFile) => {
    console.log(`📥 merge: ${importedFile}`);
    return readFile(importedFile);
  });
  return content;
}

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')    // حذف کامنت‌ها
    .replace(/\s+/g, ' ')                 // فاصله‌های اضافه
    .replace(/\s*{\s*/g, '{')             // فاصله دور {
    .replace(/\s*}\s*/g, '}')             // فاصله دور }
    .replace(/\s*:\s*/g, ':')             // فاصله دور :
    .replace(/\s*;\s*/g, ';')             // فاصله دور ;
    .replace(/\s*,\s*/g, ',')             // فاصله دور ,
    .replace(/;}/g, '}')                  // حذف ; آخر
    .trim();
}

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

const version = Date.now();
const bundled = bundle('app.css');
const minified = minify(bundled);
const outFile = `dist/app.${version}.min.css`;

fs.writeFileSync(outFile, minified, 'utf8');

const originalKB = (bundled.length / 1024).toFixed(1);
const minifiedKB = (minified.length / 1024).toFixed(1);
const saved = (((bundled.length - minified.length) / bundled.length) * 100).toFixed(0);

console.log(`\n✅ ساخته شد: ${outFile}`);
console.log(`📦 قبل: ${originalKB} KB`);
console.log(`🗜️  بعد: ${minifiedKB} KB`);
console.log(`💾 صرفه‌جویی: ${saved}%`);