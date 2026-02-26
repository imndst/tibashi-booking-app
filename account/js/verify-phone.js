import { API_BASE_URL } from "./config.js";

export function initVerifyPhone(containerSelector, redirectQueryParam = "next") {
  const container = document.querySelector(containerSelector);

  const requestOtpUrl = `${API_BASE_URL}/Auth/request-otp`;
  const verifyOtpUrl = `${API_BASE_URL}/Auth/verify-otp`;
  const meUrl = `${API_BASE_URL}/Auth/me`;
  const transactionsUrl = `${API_BASE_URL}/TransactionCheck/GetAllTransactions`;

  // ----- استایل‌ها -----
  (function injectStyles() {
    const css = `
      .verify-box, .dashboard { box-sizing: border-box; font-family: sans-serif; }
      .verify-box { max-width: 420px; margin: 16px auto; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); background: #fff; }
      .verify-box h2 { margin: 0 0 12px; font-size: 20px; }
      .verify-box input { width: 100%; padding: 10px 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; }
      .btn-primary { width: 100%; padding: 10px; border-radius: 8px; background:#1976d2; color:white; border:none; font-size:16px; cursor:pointer; }

      .dashboard { max-width: 640px; margin: 12px auto; padding: 12px; border-radius: 8px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
      .dashboard .header { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .dashboard .header h2 { font-size:18px; margin:0; }
      .editable-field input { width:100%; padding:8px; border-radius:6px; border:1px solid #eee; }

      .hamburger-menu { position: relative; }
      .hamburger-icon { display:inline-block; cursor:pointer; padding:6px 8px; border-radius:6px; }
      .hamburger-menu .menu-content { display:none; position:absolute; right:0; top:36px; background:#fff; border:1px solid #e6e6e6; box-shadow:0 6px 18px rgba(0,0,0,0.08); border-radius:8px; min-width:160px; z-index:50; }
      .hamburger-menu.open .menu-content { display:block; }
      .menu-content a, .menu-content button { display:block; padding:10px 12px; text-align:right; border:none; background:transparent; width:100%; cursor:pointer; }

      @media (max-width:600px) {
        .verify-box { margin: 10px; padding: 14px; }
        .dashboard { margin: 8px; padding: 10px; }
        .verify-box h2, .dashboard .header h2 { font-size:16px; }
        .btn-primary { font-size:15px; padding:10px; }
        .hamburger-menu .menu-content { top:40px; right:6px; }
      }
    `;
    const style = document.createElement('style');
    style.setAttribute('data-from', 'verify-dashboard');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  })();

  // ----- کمک‌توابع -----
  function normalizeDigits(str) {
    if (!str) return "";
    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic  = "٠١٢٣٤٥٦٧٨٩";
    let out = "";
    for (let ch of String(str)) {
      const pIdx = persian.indexOf(ch);
      if (pIdx !== -1) { out += pIdx; continue; }
      const aIdx = arabic.indexOf(ch);
      if (aIdx !== -1) { out += aIdx; continue; }
      out += ch;
    }
    return out;
  }
  function stripNonDigits(str) { return (str || "").replace(/\D+/g, ""); }
  function sanitizeForSend(str) { return (str || "").replace(/[\u0000-\u001F\u007F]/g, "").trim(); }

  // ----- ورود اولیه -----
  async function checkLogin() {
    const token = localStorage.getItem("jwt_token");
    if (!token) { renderOtpForm(); return; }

    try {
      const res = await fetch(meUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const user = await res.json();
      if (user?.name && user?.phone) renderDashboard(user, token);
      else renderOtpForm();
    } catch { renderOtpForm(); }
  }

  // ===== فرم OTP =====
  function renderOtpForm() {
    container.innerHTML = `
      <div class="verify-box">
        <p style="background-color:#f5093c;color:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:16px;">
          برای تجربه بهتر، فیلترشکن را خاموش کنید
        </p>
        <h2>ورود به سیستم</h2>

        <form id="phoneForm">
          <input type="tel" id="phone" placeholder="شماره موبایل" required inputmode="tel" pattern="^09\\d{9}$">
          <div class="toggle-group" id="genderToggle" style="display:flex;gap:6px;margin:8px 0;">
            <div class="toggle-option" data-value="male" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">آقا</div>
            <div class="toggle-option" data-value="female" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">خانم</div>
          </div>
          <input type="text" id="fullName" placeholder="نام و نام خانوادگی" required autocomplete="name">
        <div style="margin:8px 0; display:flex; flex-direction:column; gap:4px;">
  <img id="captchaImg" src="" alt="CAPTCHA" style="cursor:pointer; border:1px solid #ddd; border-radius:6px;" />
  <input type="text" id="captchaInput" placeholder="اعداد تصویر را وارد کنید" required />
  <small style="font-size:12px; color:#555;">برای تغییر تصویر روی آن کلیک کنید</small>
</div>
          <button type="submit" class="btn-primary">دریافت کد پیامکی</button>
        </form>

        <form id="otpForm" style="display:none;">
          <input type="text" id="otp" placeholder="کد پیامکی" required inputmode="numeric">
          <button type="submit" class="btn-primary">تأیید کد</button>
        </form>

        <p class="loading" id="loading" style="display:none;">⏳ در حال دریافت...</p>
        <p class="error" id="error" style="color:#b00020"></p>
        <p class="success" id="success" style="color:green"></p>
      </div>
    `;

    const phoneForm = container.querySelector("#phoneForm");
    const otpForm = container.querySelector("#otpForm");
    const phoneInput = container.querySelector("#phone");
    const otpInput = container.querySelector("#otp");
    const fullNameInput = container.querySelector("#fullName");
    const captchaInput = container.querySelector("#captchaInput");
    const captchaText = container.querySelector("#captchaText");
    const errorEl = container.querySelector("#error");
    const successEl = container.querySelector("#success");
    const loadingEl = container.querySelector("#loading");

const captchaImg = container.querySelector("#captchaImg");
const captchaKey = Math.random().toString(36).substring(2, 10); // یک key یکتا برای هر بار بارگذاری

function loadCaptcha() {
  captchaImg.src = `${API_BASE_URL}/Auth/captcha-image?key=${captchaKey}&t=${Date.now()}`;
}

// بارگذاری اولیه تصویر
loadCaptcha();

// رفرش تصویر هنگام کلیک روی آن
captchaImg.addEventListener("click", loadCaptcha);


    const genderOptions = container.querySelectorAll("#genderToggle .toggle-option");
    let selectedGender = null;

    // generate CAPTCHA
    

    genderOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        genderOptions.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        selectedGender = opt.dataset.value;
      });
    });

    phoneInput.addEventListener("input", () => { phoneInput.value = stripNonDigits(normalizeDigits(phoneInput.value)); });
    otpInput.addEventListener("input", () => { otpInput.value = stripNonDigits(normalizeDigits(otpInput.value)); });

    const allowedNameRegex = /[A-Za-z\u0600-\u06FF\s'-]/g;
    const validNameFullRegex = /^[A-Za-z\u0600-\u06FF\s'-]+$/;
    fullNameInput.addEventListener("input", () => {
      const before = fullNameInput.value;
      fullNameInput.value = (before.match(allowedNameRegex) || []).join("");
    });

    phoneForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.textContent = ""; successEl.textContent = "";

      const phone = stripNonDigits(normalizeDigits(phoneInput.value.trim()));
      const fullName = fullNameInput.value.trim();
      const captchaEntered = captchaInput.value.trim();

      if (!/^09\d{9}$/.test(phone)) { errorEl.textContent = "شماره موبایل معتبر وارد کنید."; return; }
      if (!selectedGender) { errorEl.textContent = "لطفاً جنسیت را انتخاب کنید."; return; }
      if (!fullName || fullName.length < 2 || !validNameFullRegex.test(fullName)) { errorEl.textContent = "نام فقط شامل حروف فارسی یا انگلیسی و فاصله باشد (حداقل ۲ حرف)."; return; }


try {
    const captchaRes = await fetch(`${API_BASE_URL}/Auth/verify-captcha?key=${captchaKey}&input=${encodeURIComponent(captchaEntered)}`);
    const captchaData = await captchaRes.json();
    if (!captchaData.status) {
        errorEl.textContent = "CAPTCHA اشتباه است.";
        loadCaptcha(); // بارگذاری تصویر جدید
        return;
    }
} catch {
    errorEl.textContent = "خطا در ارتباط با CAPTCHA";
    return;
}












      const prefix = selectedGender === "male" ? "آقای" : "خانم";

      try {
        loadingEl.style.display = "block";
        const payload = { phone, Name: `${prefix} ${sanitizeForSend(fullName)}` };
        const res = await fetch(requestOtpUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        loadingEl.style.display = "none";

        if (data.status) {
          phoneForm.style.display = "none";
          otpForm.style.display = "block";
          successEl.textContent = "کد ارسال شد — لطفاً آن را وارد کنید.";
        } else errorEl.textContent = data.message || "خطا در ارسال کد";
      } catch {
        loadingEl.style.display = "none";
        errorEl.textContent = "خطا در ارتباط";
      }
    });

    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const phone = stripNonDigits(normalizeDigits(phoneInput.value.trim()));
      const otp = stripNonDigits(normalizeDigits(otpInput.value.trim()));
      if (!otp) return;
      try {
        const res = await fetch(verifyOtpUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });
        const data = await res.json();
        if (!data.status || !data.token) throw new Error();
        localStorage.setItem("jwt_token", data.token);
        location.reload();
      } catch {
        errorEl.textContent = "کد اشتباه است.";
      }
    });
  }

  // ===== داشبورد کامل =====
  async function renderDashboard(user, token) {
    container.innerHTML = "";

    const dash = document.createElement("div");
    dash.className = "dashboard";

    const header = document.createElement("div");
    header.className = "header";

    const h2 = document.createElement("h2");
    h2.textContent = "خوش آمدید، ";
    const nameSpan = document.createElement("span");
    nameSpan.id = "displayName";
    nameSpan.textContent = user.name || "";
    h2.appendChild(nameSpan);
    header.appendChild(h2);

    // منوی همبرگر
    const hamburger = document.createElement("div");
    hamburger.className = "hamburger-menu";
    hamburger.innerHTML = `
      <span class="hamburger-icon" aria-label="menu" role="button">☰</span>
      <div class="menu-content" role="menu">
        <a href="/" class="menu-link" role="menuitem">🏠 خانه</a>
        <button id="logoutBtn" class="menu-btn" role="menuitem">🚪 خروج</button>
        <button id="reinstallBtn" class="menu-btn" role="menuitem">🔁 نصب مجدد برنامه</button>
      </div>
    `;
    header.appendChild(hamburger);
    dash.appendChild(header);

    // ویرایش نام
    const editable = document.createElement("div");
    editable.className = "editable-field";
    const nameInput = document.createElement("input");
    nameInput.id = "nameInput";
    nameInput.disabled = true;
    nameInput.value = user.name || "";
    editable.appendChild(nameInput);
    dash.appendChild(editable);

    // لیست تراکنش‌ها
    const h3 = document.createElement("h3");
    h3.textContent = "تراکنش‌های موفق شما:";
    dash.appendChild(h3);
    const ul = document.createElement("ul");
    ul.id = "transactionList";
    ul.innerHTML = "<li>در حال بارگذاری...</li>";
    dash.appendChild(ul);

    container.appendChild(dash);

    // همبرگر باز/بسته
    hamburger.addEventListener("click", () => { hamburger.classList.toggle("open"); });
    document.addEventListener("click", (ev) => { if (!hamburger.contains(ev.target)) hamburger.classList.remove("open"); });

    // خروج
    const logoutBtn = container.querySelector("#logoutBtn");
    logoutBtn.addEventListener("click", async () => {
      localStorage.clear(); sessionStorage.clear();
      document.cookie.split(";").forEach(c => { document.cookie = c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"; });
      renderOtpForm();
    });

    // نصب مجدد
    const reinstallBtn = container.querySelector("#reinstallBtn");
    let deferredInstallPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstallPrompt = e; if (reinstallBtn) reinstallBtn.style.display = ""; });
    reinstallBtn.addEventListener("click", async () => {
      if (deferredInstallPrompt) { deferredInstallPrompt.prompt(); deferredInstallPrompt = null; return; }
      if (!confirm("برای نصب مجدد، مرورگر را ریست می‌کنیم و صفحه را مجدداً بارگذاری می‌کنیم. ادامه می‌دهید؟")) return;
      localStorage.clear(); sessionStorage.clear();
      if ("caches" in window) { (await caches.keys()).forEach(k => caches.delete(k)); }
      if ("serviceWorker" in navigator) { (await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister()); }
      location.reload();
    });

    // تراکنش‌ها
    try {
      const res = await fetch(transactionsUrl, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      ul.innerHTML = "";
      if (data?.result?.length) {
        const successTx = data.result.filter(t => t.status === "Success");
        if (successTx.length) successTx.forEach(t => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = `/ticket/?res=${encodeURIComponent(t.tiket || "")}`;
          a.target = "_blank";
          a.textContent = `${t.prognName || ""} - ${t.programDate || ""}`;
          li.appendChild(a); ul.appendChild(li);
        });
        else ul.innerHTML = "<li>تراکنشی وجود ندارد</li>";
      } else ul.innerHTML = "<li>تراکنشی وجود ندارد</li>";
    } catch { ul.innerHTML = "<li>خطا در دریافت دیتا</li>"; }
  }

  checkLogin();
}