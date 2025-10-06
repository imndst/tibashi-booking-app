export function showCustomerModal(selectedSeats, onSubmit) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <style>
      .modal-overlay {position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999;}
      .modal-box {background:#fff;border-radius:12px;padding:20px;width:90%;max-width:400px;box-shadow:0 10px 25px rgba(0,0,0,0.3);}
      .hidden {display:none;}
    </style>
    <div class="modal-overlay">
      <div class="modal-box">
        <h3 style="text-align:center;font-weight:700;margin-bottom:10px;">مشخصات مشتری</h3>
        <form id="customerForm" style="display:flex;flex-direction:column;gap:10px;">
          <input id="name" placeholder="نام و نام خانوادگی" required style="padding:8px;border:1px solid #ccc;border-radius:6px;">
          <input id="phone" type="tel" placeholder="شماره موبایل (09123456789)" required style="padding:8px;border:1px solid #ccc;border-radius:6px;">
          <label style="display:flex;align-items:center;gap:6px;">
            <input type="checkbox" id="hasDiscount"> <span>کد تخفیف دارم 🎁</span>
          </label>
          <input id="discountCode" class="hidden" placeholder="کد تخفیف" style="padding:8px;border:1px solid #ccc;border-radius:6px;">
          <div style="text-align:center;font-weight:600;">مبلغ کل: <span id="totalPrice">${selectedSeats.reduce((s,x)=>s+x.price,0).toLocaleString()} تومان</span></div>
          <div style="display:flex;justify-content:space-between;margin-top:10px;">
            <button type="button" id="cancelBtn" style="padding:8px 16px;background:#ccc;border:none;border-radius:6px;">انصراف</button>
            <button type="submit" style="padding:8px 16px;background:#0ea5a4;color:#fff;border:none;border-radius:6px;">ادامه پرداخت</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const form = modal.querySelector("#customerForm");
  const hasDiscount = form.querySelector("#hasDiscount");
  const discountInput = form.querySelector("#discountCode");
  const cancelBtn = form.querySelector("#cancelBtn");
  const priceDisplay = form.querySelector("#totalPrice");
  const baseTotal = selectedSeats.reduce((s, x) => s + x.price, 0);

  hasDiscount.addEventListener("change", () => discountInput.classList.toggle("hidden", !hasDiscount.checked));
  cancelBtn.addEventListener("click", () => modal.remove());

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#name").value.trim();
    const phone = form.querySelector("#phone").value.trim();
    const discountCode = discountInput.value.trim();

    if (!name) return alert("نام الزامی است");
    if (!/^09\d{9}$/.test(phone)) return alert("شماره موبایل باید 11 رقم و با 09 شروع شود");
    if (discountCode && discountCode !== "88884444") return alert("کد تخفیف معتبر نیست");

    if (discountCode === "88884444") priceDisplay.textContent = `${(baseTotal * 0.8).toLocaleString()} تومان ✅`;
    modal.remove();
    onSubmit({ name, phone, discountCode });
  });
}
