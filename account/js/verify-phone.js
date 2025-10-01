// verify-phone.js
import { API_BASE_URL } from "./config.js";

export function initVerifyPhone(containerSelector, redirectQueryParam = "next") {
  const container = document.querySelector(containerSelector);

  container.innerHTML = `
    <div class="verify-box">
      <h2>تأیید شماره تماس</h2>
      <p id="welcome"></p>

      <form id="phoneForm">
        <input type="tel" id="phone" placeholder="شماره موبایل" required>
        <button type="submit">دریافت کد OTP</button>
      </form>

      <form id="otpForm" style="display:none;">
        <input type="text" id="otp" placeholder="کد OTP" required>
        <button type="submit">تأیید کد</button>
      </form>

      <button id="logoutBtn" style="display:none;">خروج</button>

      <p class="error" id="error"></p>
      <p class="success" id="success"></p>
    </div>
  `;

  const phoneForm = container.querySelector("#phoneForm");
  const otpForm = container.querySelector("#otpForm");
  const phoneInput = container.querySelector("#phone");
  const otpInput = container.querySelector("#otp");
  const errorEl = container.querySelector("#error");
  const successEl = container.querySelector("#success");
  const welcomeEl = container.querySelector("#welcome");
  const logoutBtn = container.querySelector("#logoutBtn");

  const requestOtpUrl = `${API_BASE_URL}/Auth/request-otp`;
  const verifyOtpUrl = `${API_BASE_URL}/Auth/verify-otp`;
  const meUrl = `${API_BASE_URL}/Auth/me`;
  const logoutUrl = `${API_BASE_URL}/Auth/logout`;

  // ✅ بررسی لاگین و نمایش پروفایل یا فرم OTP
  async function checkLogin() {
    const token = localStorage.getItem("jwt_token");
    console.log("tibashi....v2")
    if (!token) {
      renderOtpForm();
      return;
    }

    try {
      const res = await fetch(meUrl, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const user = await res.json();
        if (user?.name && user?.phone) {
          renderProfile(user);
        } else {
          renderOtpForm();
        }
      } else renderOtpForm();
    } catch {
      renderOtpForm();
    }
  }

  function renderProfile(user) {
    phoneForm.style.display = "none";
    otpForm.style.display = "none";
    logoutBtn.style.display = "block";
    welcomeEl.textContent = `خوش آمدید ${user.name}`;
  }

  function renderOtpForm() {
    phoneForm.style.display = "block";
    otpForm.style.display = "none";
    logoutBtn.style.display = "none";
    welcomeEl.textContent = "";
  }

  // 🚀 ارسال شماره موبایل برای دریافت OTP
  phoneForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

    const phone = phoneInput.value.trim();
    if (!/^09\d{9}$/.test(phone)) {
      errorEl.textContent = "شماره موبایل معتبر وارد کنید.";
      return;
    }

    try {
      const res = await fetch(requestOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.status) {
        successEl.textContent = "✅ کد OTP ارسال شد!";
        phoneForm.style.display = "none";
        otpForm.style.display = "block";
      } else {
        errorEl.textContent = "❌ " + (data.message || "خطا در ارسال کد OTP");
      }
    } catch (err) {
      errorEl.textContent = "خطا در ارتباط با سرور.";
      console.error(err);
    }
  });

  // ✅ وریفای OTP و دریافت JWT
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();
    if (!otp) {
      errorEl.textContent = "کد OTP را وارد کنید.";
      return;
    }

    try {
      const res = await fetch(verifyOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      console.log(data.token)
      if (data.status  && data.token) {
        localStorage.setItem("jwt_token", data.token);
        successEl.textContent = "✅ تأیید شد! در حال انتقال...";
        const redirectUrl = new URLSearchParams(window.location.search).get(redirectQueryParam) || "/profile";
      
      } else {
        errorEl.textContent = "❌ " + (data.message || "کد OTP اشتباه است.");
      }
    } catch (err) {
      errorEl.textContent = "خطا در ارتباط با سرور.";
      console.error(err);
    }
  });

  // 🚪 خروج از حساب
  logoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("jwt_token");
    try {
      await fetch(logoutUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch { /* ignore */ }
    localStorage.removeItem("jwt_token");
    renderOtpForm();
  });

  // اجرا در ابتدا
  checkLogin();
}