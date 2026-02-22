import { API_BASE_URL } from "./config.js";

export function initVerifyPhone(containerSelector, redirectQueryParam = "next") {
  const container = document.querySelector(containerSelector);

  const requestOtpUrl = `${API_BASE_URL}/Auth/request-otp`;
  const verifyOtpUrl = `${API_BASE_URL}/Auth/verify-otp`;
  const meUrl = `${API_BASE_URL}/Auth/me`;
  const logoutUrl = `${API_BASE_URL}/Auth/logout`;
  const transactionsUrl = `${API_BASE_URL}/TransactionCheck/GetAllTransactions`;

  // Inject responsive styles (mobile-friendly, smaller dashboard, hamburger top-right)
  (function injectStyles() {
    const css = `
      /* basic container reset */
      .verify-box, .dashboard { box-sizing: border-box; font-family: sans-serif; }

      /* responsive sizes */
      .verify-box { max-width: 420px; margin: 16px auto; padding: 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); background: #fff; }
      .verify-box h2 { margin: 0 0 12px; font-size: 20px; }
      .verify-box input { width: 100%; padding: 10px 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; }
      .btn-primary { width: 100%; padding: 10px; border-radius: 8px; background:#1976d2; color:white; border:none; font-size:16px; cursor:pointer; }

      /* dashboard */
      .dashboard { max-width: 640px; margin: 12px auto; padding: 12px; border-radius: 8px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
      .dashboard .header { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .dashboard .header h2 { font-size:18px; margin:0; }
      .editable-field input { width:100%; padding:8px; border-radius:6px; border:1px solid #eee; }

      /* hamburger top-right */
      .hamburger-menu { position: relative; }
      .hamburger-icon { display:inline-block; cursor:pointer; padding:6px 8px; border-radius:6px; }
      .hamburger-menu .menu-content { display:none; position:absolute; right:0; top:36px; background:#fff; border:1px solid #e6e6e6; box-shadow:0 6px 18px rgba(0,0,0,0.08); border-radius:8px; min-width:160px; z-index:50; }
      .hamburger-menu.open .menu-content { display:block; }
      .menu-content a, .menu-content button { display:block; padding:10px 12px; text-align:right; border:none; background:transparent; width:100%; cursor:pointer; }

      /* mobile adjustments */
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

  // helper: convert Arabic/Persian digits to ASCII (English) digits
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

  // helper: remove non-digit characters
  function stripNonDigits(str) {
    return (str || "").replace(/\D+/g, "");
  }

  // helper: basic sanitize for strings we send to server (trim + remove control chars)
  function sanitizeForSend(str) {
    return (str || "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
  }

  // Start app
  async function checkLogin() {
    const token = localStorage.getItem("jwt_token");
    const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");

    // if logged in AND returnUrl exists → show modal
    if (token && returnUrl) {
      showReturnUrlModal(returnUrl, token);
      return;
    }

    if (!token) {
      renderOtpForm();
      return;
    }

    try {
      const res = await fetch(meUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();

      const user = await res.json();
      if (user?.name && user?.phone) {
        renderDashboard(user, token);
      } else {
        renderOtpForm();
      }
    } catch {
      renderOtpForm();
    }
  }

  // ===== Return URL Modal =====
  function showReturnUrlModal(returnUrl, token) {
    container.innerHTML = `
      <div class="return-modal" style="text-align:center;padding:30px;">
        <p>برای ادامه فرایند ثبت‌نام اینجا کلیک کنید</p>
        <button id="continueBtn" style="padding:10px 20px;background:#4CAF50;color:#fff;border:none;border-radius:6px;cursor:pointer;">
          ادامه
        </button>
      </div>
    `;

    container.querySelector("#continueBtn").addEventListener("click", () => {
      let target;

      // If returnUrl is absolute (http/https)
      if (/^https?:\/\//i.test(returnUrl)) {
        target = returnUrl;
      } else {
        // Relative path → attach to current origin
        target = window.location.origin + returnUrl;
      }

      // Add token as query if needed
      const url = new URL(target);

      window.location.href = url.toString();
    });
  }

  // ===== OTP FORM =====
  function renderOtpForm() {
    container.innerHTML = `
      <div class="verify-box">

                         <p style="
    background-color: #f5093cff; 
    
    color: #fffefdff; 
    border: 1px solid #FFEeba; 
    padding: 12px 16px; 
    border-radius: 8px; 
    font-size: 14px; 
    line-height: 1.5; 
    margin-bottom: 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
">
    برای داشتن تجربه کاربری بهتر و جلوگیری از مشکل در پرداخت، بهتر است فیلترشکن خود را
     در این مرحله خاموش کنید
 
</p>
        <h2>ورود به سیستم</h2>


        <form id="phoneForm">
          <input type="tel" id="phone" placeholder="شماره موبایل" required inputmode="tel" pattern="^09\\d{9}$">

          <div class="form-row" style="">
            <div class="toggle-group" id="genderToggle" style="display:flex;gap:6px;">
              <div class="toggle-option" data-value="male" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">آقا</div>
              <div class="toggle-option" data-value="female" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">خانم</div>
            </div>

            <div class="toggle-group" id="idTypeToggle" style="display:flex;gap:6px;">
              <div class="toggle-option selected" data-value="national" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">کد ملی</div>
              <div class="toggle-option" data-value="foreigner" style="padding:6px 10px;border:1px solid #eee;border-radius:6px;cursor:pointer;">کد اتباع</div>
            </div>
          </div>

          <input type="text" id="fullName" placeholder="نام و نام خانوادگی" required autocomplete="name">
          <input type="text" id="nationalCode" placeholder="کد ملی" required inputmode="numeric" pattern="\\d*">
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
    const nationalCodeInput = container.querySelector("#nationalCode");
    const errorEl = container.querySelector("#error");
    const successEl = container.querySelector("#success");
    const loadingEl = container.querySelector("#loading");

    const genderOptions = container.querySelectorAll("#genderToggle .toggle-option");
    const idTypeOptions = container.querySelectorAll("#idTypeToggle .toggle-option");

    let selectedGender = null;
    let selectedIdType = "national";

    // ----- enforce only digits in nationalCode on input (normalize digits first) -----
    nationalCodeInput.addEventListener("input", () => {
      const normalized = normalizeDigits(nationalCodeInput.value);
      nationalCodeInput.value = stripNonDigits(normalized);
    });

    // phone input: normalize + only digits
    phoneInput.addEventListener("input", () => {
      const normalized = normalizeDigits(phoneInput.value);
      phoneInput.value = stripNonDigits(normalized);
    });

    // otp input: normalize + only digits
    otpInput.addEventListener("input", () => {
      const normalized = normalizeDigits(otpInput.value);
      otpInput.value = stripNonDigits(normalized);
    });

    // ----- name validation: only Farsi/Arabic letters, Latin letters, space, dash, apostrophe -----
    const allowedNameRegex = /[A-Za-z\u0600-\u06FF\s'-]/g;
    const validNameFullRegex = /^[A-Za-z\u0600-\u06FF\s'-]+$/;

    // filter while typing
    fullNameInput.addEventListener("input", () => {
      const before = fullNameInput.value;
      const filtered = (before.match(allowedNameRegex) || []).join("");
      if (filtered !== before) {
        fullNameInput.value = filtered;
      }
    });

    // prevent paste of invalid data
    fullNameInput.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData("text");
      const filtered = (pasted.match(allowedNameRegex) || []).join("");
      const start = fullNameInput.selectionStart;
      const end = fullNameInput.selectionEnd;
      const val = fullNameInput.value;
      fullNameInput.value = val.slice(0, start) + filtered + val.slice(end);
      const newPos = start + filtered.length;
      fullNameInput.setSelectionRange(newPos, newPos);
    });

    // optional: block keypresses of invalid chars
    fullNameInput.addEventListener("keydown", (e) => {
      const controlKeys = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","Tab"];
      if (controlKeys.includes(e.key)) return;
      if (e.key.length === 1) {
        if (!allowedNameRegex.test(e.key)) {
          e.preventDefault();
        }
      }
    });

    genderOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        genderOptions.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        selectedGender = opt.dataset.value;
      });
    });

    idTypeOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        idTypeOptions.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        selectedIdType = opt.dataset.value;
        nationalCodeInput.placeholder = selectedIdType === "national" ? "کد ملی" : "کد اتباع";
        if (selectedIdType === "national") {
          nationalCodeInput.maxLength = 10;
        } else {
          nationalCodeInput.removeAttribute("maxLength");
        }
      });
    });

    phoneForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.textContent = "";
      successEl.textContent = "";

      // normalize digits, then strip non-digits
      const phone = stripNonDigits(normalizeDigits(phoneInput.value.trim()));
      let fullName = fullNameInput.value.trim();
      let nationalCode = stripNonDigits(normalizeDigits(nationalCodeInput.value.trim()));

      // validations
      if (!/^09\d{9}$/.test(phone)) {
        errorEl.textContent = "شماره موبایل معتبر وارد کنید.";
        return;
      }

      if (!selectedGender) {
        errorEl.textContent = "لطفاً جنسیت را انتخاب کنید.";
        return;
      }

      if (!fullName) {
        errorEl.textContent = "نام را وارد کنید.";
        return;
      }

      // name strict check
      if (!validNameFullRegex.test(fullName) || fullName.length < 2) {
        errorEl.textContent = "نام فقط می‌تواند شامل حروف فارسی یا انگلیسی و فاصله باشد (حداقل ۲ حرف).";
        return;
      }

      // national vs foreigner rules:
      if (selectedIdType === "national") {
        if (!/^\d{10}$/.test(nationalCode)) {
          errorEl.textContent = "کد ملی باید ۱۰ رقم باشد.";
          return;
        }
        if (!validateIranianNationalCode(nationalCode)) {
          errorEl.textContent = "کد ملی معتبر نیست.";
          return;
        }
      } else {
        // foreigner: must be digits and length > 5
        if (!/^\d{6,}$/.test(nationalCode)) {
          errorEl.textContent = "کد اتباع باید حداقل ۶ رقم باشد و فقط شامل عدد باشد.";
          return;
        }
      }

      const prefix = selectedGender === "male" ? "آقای" : "خانم";

      try {
        loadingEl.style.display = "block";

        // sanitize values to send
        const payload = {
          phone,
          Name: `${prefix} ${sanitizeForSend(fullName)}`,
          NationalCode: nationalCode
        };

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
        } else {
          errorEl.textContent = data.message || "خطا در ارسال کد";
        }
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

  // ===== DASHBOARD =====
  async function renderDashboard(user, token) {
    // Build DOM instead of interpolating user content into innerHTML to avoid XSS
    container.innerHTML = ""; // clear

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

    // hamburger top-right
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

    // place header content: name on left, hamburger on right (flex: space-between)
    header.appendChild(h2);
    header.appendChild(hamburger);
    dash.appendChild(header);

    const editable = document.createElement("div");
    editable.className = "editable-field";
    const nameInput = document.createElement("input");
    nameInput.id = "nameInput";
    nameInput.disabled = true;
    nameInput.value = user.name || "";
    editable.appendChild(nameInput);
    dash.appendChild(editable);

    const h3 = document.createElement("h3");
    h3.textContent = "تراکنش‌های موفق شما:";
    dash.appendChild(h3);

    const ul = document.createElement("ul");
    ul.id = "transactionList";
    const loadingLi = document.createElement("li");
    loadingLi.textContent = "در حال بارگذاری...";
    ul.appendChild(loadingLi);
    dash.appendChild(ul);

    container.appendChild(dash);

  




// 2) keep your existing logout handler (example)
const logoutBtn = container.querySelector("#logoutBtn");
logoutBtn.addEventListener("click", async () => {
  try { localStorage.removeItem("jwt_token"); } catch(e){}
  try { localStorage.clear(); } catch(e){}
  try { sessionStorage.clear(); } catch(e){}
  // clear cookies (best-effort)
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (!name) return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None`;
  });
  // clear Cache API
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  // unregister SWs
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }

  // then show login / OTP form
  renderOtpForm();
});

// 3) Reinstall logic
const reinstallBtn = container.querySelector("#reinstallBtn");

// We'll capture beforeinstallprompt if the browser fires it
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the browser from showing the default prompt immediately
  e.preventDefault();
  deferredInstallPrompt = e;
  // Optionally show the button if it was hidden
  if (reinstallBtn) reinstallBtn.style.display = "";
});

// Helper: hard-reset caches + SWs (used as fallback)
async function hardResetServiceWorkersAndCaches() {
  // unregister SWs
  if ("serviceWorker" in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister().catch(()=>{})));
    } catch (err) { /* ignore */ }
  }

  // delete Cache API entries
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k).catch(()=>{})));
    } catch (err) { /* ignore */ }
  }

  // best-effort clear IndexedDB names if needed (optional)
  if ("indexedDB" in window && indexedDB.databases) {
    try {
      const dbs = await indexedDB.databases();
      await Promise.all((dbs || []).map(db => db.name ? new Promise((res) => {
        const req = indexedDB.deleteDatabase(db.name);
        req.onsuccess = () => res();
        req.onerror = () => res();
        req.onblocked = () => res();
      }) : Promise.resolve()));
    } catch (err) { /* ignore */ }
  }
}

// Handle click
reinstallBtn.addEventListener("click", async (ev) => {
  ev.preventDefault();

  // 1) If we have a deferred "beforeinstallprompt", show the native install prompt
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      // optional: inspect choice.outcome ('accepted'|'dismissed')
      console.log("PWA install choice:", choice && choice.outcome);
      deferredInstallPrompt = null; // clear so we don't reuse
      return;
    } catch (err) {
      console.warn("Install prompt failed:", err);
      deferredInstallPrompt = null;
      // fallback to hard reset below
    }
  }

  // 2) Fallback: perform a hard reset (unregister SWs + clear caches) and reload
  try {
    // optional: show a quick confirmation to the user
    if (!confirm("برای نصب مجدد برنامه، مرورگر را ریست می‌کنیم و صفحه را مجدداً بارگذاری می‌کنیم. ادامه می‌دهید؟")) {
      return;
    }

    // clear app-specific storage first (optional but recommended)
    try { localStorage.clear(); } catch(e){}
    try { sessionStorage.clear(); } catch(e){}

    // then reset SWs & caches
    await hardResetServiceWorkersAndCaches();

    // reload the page so that the app can be re-fetched and (on supporting browsers)
    // the install prompt may appear again, or the user can use the browser's install action.
    location.reload();
  } catch (err) {
    console.error("Reinstall fallback failed:", err);
    alert("خطا در نصب مجدد. لطفاً صفحه را دستی ریفرش کنید یا مرورگر را ببندید و دوباره باز کنید.");
  }
});








    // hamburger toggle
    hamburger.addEventListener("click", (e) => {
      // toggle open class; clicking inside should not immediately close
      hamburger.classList.toggle("open");
    });

    // close menu when clicking outside
    document.addEventListener("click", (ev) => {
      if (!hamburger.contains(ev.target)) {
        hamburger.classList.remove("open");
      }
    });

    // fetch transactions
    try {
      const res = await fetch(transactionsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      ul.innerHTML = ""; // clear

      if (data?.result?.length) {
        const successTx = data.result.filter(t => t.status === "Success");
        if (successTx.length) {
          successTx.forEach(t => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const tiket = t.tiket || "";
            a.href = `/ticket/?res=${encodeURIComponent(tiket)}`;
            a.target = "_blank";
            a.textContent = `${t.prognName || ""} - ${t.programDate || ""}`;
            li.appendChild(a);
            ul.appendChild(li);
          });
        } else {
          const liEmpty = document.createElement("li");
          liEmpty.textContent = "تراکنشی وجود ندارد";
          ul.appendChild(liEmpty);
        }
      } else {
        const liEmpty = document.createElement("li");
        liEmpty.textContent = "تراکنشی وجود ندارد";
        ul.appendChild(liEmpty);
      }
    } catch {
      ul.innerHTML = "";
      const liErr = document.createElement("li");
      liErr.textContent = "خطا در دریافت دیتا";
      ul.appendChild(liErr);
    }
  }

  // Iranian national code validator (unchanged logic)
  function validateIranianNationalCode(code) {
    if (!/^\d{10}$/.test(code)) return false;
    const check = parseInt(code[9], 10);
    const sum = [...code].slice(0, 9).reduce((acc, digit, i) => acc + parseInt(digit, 10) * (10 - i), 0);
    const r = sum % 11;
    return (r < 2 && check === r) || (r >= 2 && check === 11 - r);
  }

  // ✅ Start app
  checkLogin();
}
