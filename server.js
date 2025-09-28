const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// مسیر ریشه پروژه
const __root = path.resolve(__dirname);



// سرو کردن همه فایل‌های استاتیک
app.use(express.static(__root));

// روت اصلی
app.get("/", (req, res) => {
  res.sendFile(path.join(__root, "index.html"));
});

// مسیر مخصوص رویدادها
app.get("/e/:id", (req, res) => {
  res.sendFile(path.join(__root, "index.html"));
});

// SPA fallback (تمام مسیرهای دیگر) بدون استفاده از /* یا *
app.use((req, res) => {
  res.sendFile(path.join(__root, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
