// server.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// مسیر ریشه پروژه
const __root = path.resolve(__dirname);

// برای خواندن داده‌های POST فرم
app.use(express.urlencoded({ extended: true }));

// سرو کردن همه فایل‌های استاتیک
app.use(express.static(__root));

// روت اصلی
app.get("/", (req, res) => {
  res.sendFile(path.join(__root, "index.html"));
});

// GET تیکت با ResNum
app.get("/ticket", (req, res) => {
  res.sendFile(path.join(__root, "ticket/index.html"));
});

// POST تیکت (simulate gateway callback)
app.post("/ticket", (req, res) => {
  const { ResNum, RefNum, Amount, Status } = req.body;

  // Build the redirect URL with multiple query parameters
  const redirectUrl = `/ticket?` + new URLSearchParams({
    ResNum,
    RefNum,
    Amount,
    Status
  }).toString();

  // Redirect the user to the ticket page with all parameters
  res.redirect(redirectUrl);
});


// مسیرهای دیگر SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__root, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
