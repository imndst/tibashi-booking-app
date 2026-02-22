import {
  checkDiscountCode,
  updateSeatClasses,
  fetchSeatStatus,
  getWalletBalance,
  BASE_URL,
  submitTicketsUseWallet,
  BASE_URL_ACC
} from "../../../../utils.js";
import showCustomAlert from "../../../alert/showCustomAlert.js";
import showCustomAlertSc from "../../../alert/showCustomAlertSc.js";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}

export function showCustomerModalLess(
  hallInfo = {},
  selectedSeats,
  onSubmit,
  seatSelectionTimer,
  timeId,
  
  updateSeatClassesFromParent
) {
  // --- Tax & Fee Setup ---
  let taxPercent = 0;
  let feePercent = 0;
  try {
    const feeArr = hallInfo?.fee ? JSON.parse(hallInfo.fee) : [0, 0];
    [taxPercent, feePercent] = feeArr.map(Number);
  } catch {
    taxPercent = 0;
    feePercent = 0;
  }

  const free = hallInfo?.free === true;
  console.log("FREE MODE:", free);

  const baseTotal = selectedSeats.reduce((s, x) => s + x.price, 0);
  let discountApplied = false;
  let discountAmount = 0;
  let walletBalance = null;

  const calcFinalPrice = () => {
    const subtotal = selectedSeats.reduce((s, x) => s + x.price, 0);
    const tax = taxPercent ? (subtotal * taxPercent) / 100 : 0;
    const fee = feePercent ? (subtotal * feePercent) / 100 : 0;
    const discount = discountApplied ? discountAmount : 0;
    const final = subtotal + tax + fee - discount;
    return { subtotal, tax, fee, discount, final };
  };

  // --- Modal HTML ---
  const modal = document.createElement("div");
  modal.innerHTML = `
<style>
.modal-overlay {position:fixed;inset:0;background:#161616;display:flex;align-items:center;justify-content:center;z-index:999;}
.modal-box {background:var(--color-surface);border-radius:16px;padding:22px;width:90%;max-width:440px;box-shadow:0 10px 25px rgba(0,0,0,0.25);font-family:var(--font-family);position:relative;color:var(--color-text);}
.hidden {display:none;}
.price-summary {margin-top:12px;border:1px solid var(--color-border);border-radius:12px;background: var(--color-bg);padding:14px 16px;font-weight:500;font-size:14px;line-height:1.8;color:var(--color-text);}
.price-row {display:flex;justify-content:space-between;align-items:center;}
.price-row.total {border-top:1px dashed var(--color-border);margin-top:6px;padding-top:8px;font-weight:700;}
.discount-row {color:var(--color-primary);font-weight:600;animation:fadeIn 0.3s ease;}
@keyframes fadeIn {from {opacity:0;transform:translateY(-4px);} to {opacity:1;transform:translateY(0);}}
.loader {width:16px;height:16px;border:2px solid var(--color-border);border-top-color:var(--color-accent);border-radius:50%;animation:spin 1s linear infinite;margin-left:6px;}
@keyframes spin {to {transform:rotate(360deg);}}
#customerForm input {padding:8px;border:1px solid var(--color-border);border-radius:6px;background: var(--color-surface);color:var(--color-text);font-family: var(--font-family);}
#cancelBtn {padding:8px 16px;background:var(--color-border);border:none;border-radius:6px;color:var(--color-text);cursor:pointer;}
#btn-pay {padding:8px 16px;background:var(--color-accent);color:#fff;border:none;border-radius:6px;cursor:pointer;}
#btn-pay:hover {background:var(--color-primary);}
.icon {width:16px;height:16px;vertical-align:middle;margin-left:4px;fill:currentColor;}
</style>

<div class="modal-overlay">
  <div class="modal-box">
    <div style="text-align:center;margin-bottom:12px;">
      زمان باقی‌مانده: <span id="modal-timer">--</span> ثانیه
    </div>
    <h3 style="text-align:center;font-weight:700;margin-bottom:10px;">مشخصات مشتری</h3>
    <form id="customerForm" style="display:flex;flex-direction:column;gap:10px;">
      <input id="name" placeholder="نام و نام خانوادگی" required>
      <input id="phone" type="tel" placeholder="شماره موبایل (09123456789)" required>

      <label style="display:flex;align-items:center;gap:6px;">
        <input type="checkbox" id="hasDiscount"> <span>کد تخفیف دارم</span>
      </label>
      <div id="discountWrapper" class="hidden" style="position:relative;">
        <input id="discountCode" placeholder="کد تخفیف ۸ رقمی" style="direction:ltr;text-align:center;width:100%;">
        <div id="discountLoader" class="loader hidden" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);"></div>
      </div>

      <label style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <input type="checkbox" id="useWallet"> <span>پرداخت با کیف پول</span>
        <span id="walletBalanceText" style="margin-left:4px">---</span>
        <span id="walletLoader" class="loader hidden"></span>
      </label>

      <div class="price-summary">
        <div class="price-row">مبلغ بلیت‌ها <span id="subtotal">0 ریال</span></div>
        <div class="price-row">کارمزد (${feePercent}%) <span id="fee">0 ریال</span></div>
        <div class="price-row">مالیات (${taxPercent}%) <span id="tax">0 ریال</span></div>
        <div class="price-row discount-row hidden">مبلغ تخفیف <span id="discount">0ریال</span></div>
        <div class="price-row total">
          مبلغ نهایی
          <svg class="icon" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L5 14l4 4 8-8-1.4-1.4z"/></svg>
          <span id="final">0 ریال</span>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:10px;">
        <button type="button" id="cancelBtn">انصراف</button>
        <button type="submit" id="btn-pay">ادامه پرداخت</button>
      </div>
    </form>
  </div>
</div>
`;


  document.body.appendChild(modal);


  
  // --- Elements ---
  const modalTimerEl = modal.querySelector("#modal-timer");
  const form = modal.querySelector("#customerForm");
  const hasDiscount = form.querySelector("#hasDiscount");
  const discountWrapper = form.querySelector("#discountWrapper");
  const discountInput = form.querySelector("#discountCode");
  const discountLoader = form.querySelector("#discountLoader");
  const cancelBtn = form.querySelector("#cancelBtn");
  const subtotalEl = form.querySelector("#subtotal");
  const taxEl = form.querySelector("#tax");
  const feeEl = form.querySelector("#fee");
  const discountEl = form.querySelector("#discount");
  const discountRow = form.querySelector(".discount-row");
  const finalEl = form.querySelector("#final");
  const useWallet = form.querySelector("#useWallet");
  const walletBalanceText = form.querySelector("#walletBalanceText");
  const walletLoader = form.querySelector("#walletLoader");
  const nameInput = form.querySelector("#name");
  const phoneInput = form.querySelector("#phone");
  // --- Auto fill from JWT ---
  const jwt = localStorage.getItem("jwt_token");

  if (jwt) {
    const userInfo = parseJwt(jwt);

    if (userInfo?.name) {
      nameInput.value = userInfo.name;
      nameInput.readOnly = true; // ✅ غیرقابل ویرایش
    }

    if (userInfo?.phone) {
      phoneInput.value = userInfo.phone;
      phoneInput.readOnly = true; // ✅ غیرقابل ویرایش
    }
  }

  // --- Timer ---
  if (seatSelectionTimer) {
    let remaining = Number(seatSelectionTimer) || 0;
    modalTimerEl.textContent = remaining;
    const timerInterval = setInterval(() => {
      remaining -= 1;
      modalTimerEl.textContent = remaining;
      if (remaining <= 0) clearInterval(timerInterval);
    }, 1000);
  }

  // --- Price Display ---
  const updatePriceDisplay = () => {
    const { subtotal, tax, fee, discount, final } = calcFinalPrice();
    subtotalEl.textContent = `${subtotal.toLocaleString()} ریال `;
    taxEl.textContent = `${tax.toLocaleString()} ریال`;
    feeEl.textContent = `${fee.toLocaleString()} ریال`;
    discountEl.textContent = `-${discount.toLocaleString()}ریال`;
    finalEl.textContent = `${final.toLocaleString()}ریال`;
    discountRow.classList.toggle("hidden", !discountApplied);
  };
  updatePriceDisplay();

  // --- Discount Logic ---
  hasDiscount.addEventListener("change", () => {
    discountWrapper.classList.toggle("hidden", !hasDiscount.checked);
    if (!hasDiscount.checked) {
      discountApplied = false;
      discountAmount = 0;
      updatePriceDisplay();
    }
  });

  discountInput.addEventListener("input", async () => {
    const val = discountInput.value.trim();
    discountLoader.classList.remove("hidden");

    discountApplied = false;
    discountAmount = 0;
    updatePriceDisplay();

    if (/^\d{8}$/.test(val)) {
      try {
        const programId = selectedSeats[0]?.mid.toString();
        const result = await checkDiscountCode(programId, val);

        if (result?.status && result?.result?.discountPercent) {
          discountApplied = true;
          discountAmount =
            selectedSeats.reduce((s, x) => s + x.price, 0) *
            (result.result.discountPercent / 100);
        } else {
          showCustomAlert(result?.message || "کد تخفیف نامعتبر است");
        }
      } catch (err) {
        console.error(err);
        showCustomAlert(err?.message || "خطا در بررسی کد تخفیف");
      }
    }

    discountLoader.classList.add("hidden");
    updatePriceDisplay();
  });

  // --- Wallet Logic ---
  useWallet.addEventListener("change", async () => {
    if (useWallet.checked) {
      hasDiscount.checked = false;
      discountWrapper.classList.add("hidden");
      discountApplied = false;
      discountAmount = 0;
      updatePriceDisplay();

      walletLoader.classList.remove("hidden");
      walletBalanceText.textContent = "---";

      try {
        const programId = selectedSeats[0]?.mid?.toString();

        if (!programId) {
          showCustomAlert("برنامه انتخاب نشده است");
          walletBalanceText.textContent = "خطا";
          return;
        }

        // ✅ use new util API
        const result = await getWalletBalance(programId);

        if (!result?.status) {
          showCustomAlert(result?.message || "خطا در دریافت موجودی کیف پول");
          walletBalanceText.textContent = "خطا";
          return;
        }

        // adjust if your API returns different shape
        walletBalance = parseFloat(result?.balance || 0);

        walletBalanceText.textContent = `${(
          walletBalance 
        ).toLocaleString()} ریال موجودی`;
      } catch (err) {
        console.error(err);
        walletBalanceText.textContent = "خطا";
      } finally {
        walletLoader.classList.add("hidden");
      }
    } else {
      walletBalanceText.textContent = "---";
    }
  });


// ✅ Auto wallet for FREE status
if (hallInfo?.free === true) {
  useWallet.checked = true;
  useWallet.disabled = true;

  hasDiscount.checked = false;
  hasDiscount.disabled = true;
  discountWrapper.classList.add("hidden");
  const payBtn = form.querySelector("#btn-pay")
payBtn.textContent = free ? "دریافت" : "ادامه پرداخت";
  // Trigger wallet balance fetch automatically
  setTimeout(() => {
    useWallet.dispatchEvent(new Event("change"));
  }, 200);
}




  // --- Cancel / Back ---
  const closeModal = () => {
    modal.remove();
    window.removeEventListener("popstate", handleBackButton);
    history.replaceState(null, "");
  };
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener(
    "click",
    (e) => e.target.classList.contains("modal-overlay") && closeModal()
  );
  history.pushState({ modalOpen: true }, "");
  const handleBackButton = (event) => {
    event.preventDefault();
    closeModal();
  };
  window.addEventListener("popstate", handleBackButton);

  // --- Submit ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("#name").value.trim();
    const phone = form.querySelector("#phone").value.trim();
    const discountCode = discountInput.value.trim();

    if (!name) return showCustomAlert("نام الزامی است");
    if (!/^09\d{9}$/.test(phone))
      return showCustomAlert("شماره موبایل باید 11 رقم و با 09 شروع شود");
    if (discountCode && !/^\d{8}$/.test(discountCode))
      return showCustomAlert("کد تخفیف معتبر نیست (باید ۸ رقمی باشد)");

    const paymentMethod = useWallet.checked ? "wallet" : "online";

    const payload = {
      ProgramId: selectedSeats[0]?.mid.toString() || "", // mid from first seat
      ProgramSing: selectedSeats[0]?.sansId.toString() || "", // sansId from first seat
      pval: timeId,
      Phone: phone,
      CustomerName: name,
      ProgramDate: selectedSeats[0]?.sansId.toString(),
      ProgramTimeID: selectedSeats[0]?.sansId.toString(),
      discountCode: hasDiscount.checked ? discountCode : "",
      Seats: selectedSeats.map(({ ticketId, mid, sansId, price }) => ({
        SeatId: ticketId.toString(),
        RowNumber: mid.toString(),
        SansId: sansId.toString(),
        Number: ticketId.toString(),
        price: price,
      })),
    };

    // --- Wallet Payment ---
    if (paymentMethod === "wallet") {
      try {
        const programId = selectedSeats[0]?.mid?.toString();
        if (!programId) return showCustomAlert("برنامه نامعتبر است.");

        // ✅ use util instead of raw fetch
        const balanceResult = await getWalletBalance(programId);

        if (!balanceResult.status) {
          return showCustomAlert(balanceResult.message);
        }

        const balance = parseFloat(balanceResult?.balance || 0);
        const { final } = calcFinalPrice();

        if (balance < final) {
          return showCustomAlert(
            `موجودی کیف پول شما ${balance.toLocaleString()+"0"}ریال کافی نیست`
          );
        }

        // ✅ use util instead of raw fetch
        const payResult = await submitTicketsUseWallet(payload, 1);

        if (!payResult.status) {
          updateSeatClasses(programId);
          return showCustomAlert(
            payResult.message || "خطا در پرداخت از کیف پول"
          );
        }

        modal.remove();

        showCustomAlertSc(`
${payResult.message}<br>
<a href="${BASE_URL_ACC}ticket/?res=${payResult.result.ticketId}" 
   target="_blank" 
   style="color:#007bff; font-weight:600; text-decoration:underline;">
   مشاهده بلیت
</a>
`);

        return onSubmit({
          ...payload,
          paymentMethod: "wallet",
          walletResult: payResult,
        });
      } catch (err) {
        console.error(err);
        return showCustomAlert("خطا در ارتباط با سرور کیف پول");
      }
    }

    // --- Online Payment ---
    modal.remove();
    return onSubmit({ ...payload, paymentMethod: "online" });
  });
}
