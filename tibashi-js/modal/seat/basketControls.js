// basketControls.js
export function buildControls() {
  return `
    <div id="seatControls" 
         class="tibashi-seat-controls" 
         style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">

      <!-- total price -->
      <div id="HowMuch" 
           class="tibashi-total-price" 
           style="font-weight:700;">
           مبلغ: 0 تومان
      </div>

      <!-- pay button -->
      <button id="payx" 
              class="tibashi-pay-btn" 
              disabled 
              style="padding:6px 10px;border-radius:6px;border:none;
                     background:#0ea5a4;color:#fff;cursor:pointer;">
        سبد خرید (0 بلیت)
      </button>

      <!-- next stage button -->
      <button id="nextstage" 
              class="tibashi-next-btn" 
              style="padding:6px 10px;border-radius:6px;border:none;
                     background:#f59e0b;color:#111;cursor:pointer;">
        ادامه / پرداخت
      </button>
    </div>
  `;
}
