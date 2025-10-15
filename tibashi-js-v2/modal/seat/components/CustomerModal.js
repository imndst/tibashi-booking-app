import { checkDiscountCode } from "../../../../utils.js";

export function showCustomerModal(hallInfo = {}, selectedSeats, onSubmit,seatSelectionTimer) {
  let taxPercent = 0;
  let feePercent = 0;
  try {
    const feeArr = hallInfo?.fee ? JSON.parse(hallInfo.fee) : [0, 0];
    [taxPercent, feePercent] = feeArr.map(Number);
  } catch {
    taxPercent = 0;
    feePercent = 0;
  }

  const baseTotal = selectedSeats.reduce((s, x) => s + x.price, 0);
  let discountApplied = false;
  let discountAmount = 0;

  const calcFinalPrice = () => {
    const subtotal = baseTotal;
    const tax = taxPercent ? (subtotal * taxPercent) / 100 : 0;
    const fee = feePercent ? (subtotal * feePercent) / 100 : 0;
    const discount = discountApplied ? discountAmount : 0;
    const final = subtotal + tax + fee - discount;
    return { subtotal, tax, fee, discount, final };
  };

console.log(seatSelectionTimer)

  const modal = document.createElement("div");
  modal.innerHTML = `
<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: #161616;;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .modal-box {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 22px;
    width: 90%; max-width: 440px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    font-family: var(--font-family);
    transition: all 0.3s ease;
    position: relative;
    color: var(--color-text);
  }
  .hidden { display: none; }
  .price-summary {
    margin-top: 12px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-bg);
    padding: 14px 16px;
    font-weight: 500;
    font-size: 14px;
    line-height: 1.8;
    color: var(--color-text);
  }
  .price-row {display:flex;justify-content:space-between;align-items:center;}
  .price-row.total {
    border-top: 1px dashed var(--color-border);
    margin-top: 6px;
    padding-top: 8px;
    font-weight: 700;
  }
  .discount-row {
    color: var(--color-primary);
    font-weight: 600;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from {opacity: 0; transform: translateY(-4px);}
    to {opacity: 1; transform: translateY(0);}
  }
  .loader {
    width: 16px; height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 6px;
  }
  @keyframes spin {to {transform: rotate(360deg);}}

  /* Inputs */
  #customerForm input {
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-family);
  }

  /* Buttons */
  #cancelBtn {
    padding: 8px 16px;
    background: var(--color-border);
    border: none;
    border-radius: 6px;
    color: var(--color-text);
    cursor: pointer;
  }
  #btn-pay {
    padding: 8px 16px;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  #btn-pay:hover {
    background: var(--color-primary);
  }

  .icon {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin-left: 4px;
    fill: currentColor;
  }
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

      <div class="price-summary">
        <div class="price-row">
          مبلغ بلیت‌ها
          <span id="subtotal">0 تومان</span>
        </div>
        <div class="price-row">
          کارمزد (${feePercent}%)
          <span id="fee">0 تومان</span>
        </div>
        <div class="price-row">
          مالیات (${taxPercent}%)
          <span id="tax">0 تومان</span>
        </div>
        <div class="price-row discount-row hidden">
          مبلغ تخفیف
          <span id="discount">0 تومان</span>
        </div>
        <div class="price-row total">
          مبلغ نهایی
          <svg class="icon" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5L5 14l4 4 8-8-1.4-1.4z"/></svg>
          <span id="final">0 تومان</span>
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


  const modalTimerEl = modal.querySelector("#modal-timer");
if (seatSelectionTimer) {
  let remaining = seatSelectionTimer; // عدد اولیه‌ای که از قبل پاس دادی
  modalTimerEl.textContent = remaining;

  const timerInterval = setInterval(() => {
    remaining -= 1;
    modalTimerEl.textContent = remaining;

  }, 1000);
}


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

  const updatePriceDisplay = () => {
    const { subtotal, tax, fee, discount, final } = calcFinalPrice();
    subtotalEl.textContent = `${subtotal.toLocaleString()} تومان`;
    taxEl.textContent = `${tax.toLocaleString()} تومان`;
    feeEl.textContent = `${fee.toLocaleString()} تومان`;
    discountEl.textContent = `-${discount.toLocaleString()} تومان`;
    finalEl.textContent = `${final.toLocaleString()} تومان`;
    discountRow.classList.toggle("hidden", !discountApplied);
  };

  updatePriceDisplay();

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
        const programId = hallInfo?.event_id || 0;
        const result = await checkDiscountCode(programId, val);
        if (result?.status && result?.result?.DiscountPercent) {
          discountApplied = true;
          discountAmount = baseTotal * (result.result.DiscountPercent / 100);
        }
      } catch (err) {
        console.error(err);
      }
    }

    discountLoader.classList.add("hidden");
    updatePriceDisplay();
  });

  cancelBtn.addEventListener("click", () => {
    modal.remove();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.querySelector("#name").value.trim();
    const phone = form.querySelector("#phone").value.trim();
    const discountCode = form.querySelector("#discountCode").value.trim();

    if (!name) return alert("نام الزامی است");
    if (!/^09\d{9}$/.test(phone))
      return alert("شماره موبایل باید 11 رقم و با 09 شروع شود");
    if (discountCode && !/^\d{8}$/.test(discountCode))
      return alert("کد تخفیف معتبر نیست (باید ۸ رقمی باشد)");

    modal.remove();
    onSubmit({ name, phone, discountCode });
  });
}
