// basketControls.js
export function buildControls() {
  return `
    <div id="seat-controls" 
         class="seat-controls-container" 
         style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">

      <!-- total price -->
      <div id="total-price" 
           class="seat-total-price" 
           style="font-weight:700;">
           مبلغ: 0 تومان
      </div>

      <!-- pay button -->
      <button id="btn-pay" 
              class="seat-btn-pay" 
              disabled 
              style="padding:6px 10px;border-radius:6px;border:none;
                     background:#0ea5a4;color:#fff;cursor:pointer;">
        سبد خرید (0 بلیت)
      </button>

      <!-- next stage button -->
      <button id="btn-next" 
              class="seat-btn-next" 
              style="padding:6px 10px;border-radius:6px;border:none;
                     background:#f59e0b;color:#111;cursor:pointer;">
        ادامه / پرداخت
      </button>
    </div>
  `;
}
