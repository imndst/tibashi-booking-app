const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const htmlFile = "./index.html"; // مسیر فایل اصلی HTML
let html = fs.readFileSync(htmlFile, "utf8");

// پیدا کردن همه لینک‌های CSS و JS
html = html.replace(/(href|src)="([^"]+\.(css|js))"/g, (match, attr, url) => {
  const filePath = path.join("./", url.split("?")[0]);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("md5").update(fileBuffer).digest("hex").slice(0, 8);
    return `${attr}="${url}?v=${hash}"`;
  }
  return match;
});

fs.writeFileSync(htmlFile, html, "utf8");
console.log("✅ Cache-busting done!");
