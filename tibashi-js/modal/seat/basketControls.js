// basketControls.js
export function buildControls() {
  return `
    <div id="seat-controls" 
         class="seat-controls-container" 
         style="display:flex;gap:12px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">

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

      <!-- zoom controls -->
      <div id="zoom-controls" style="display:flex;gap:6px;align-items:center;">
        <button id="zoom-in" style="padding:6px 10px;border-radius:6px;border:none;background:#3b82f6;color:#fff;cursor:pointer;">
          Zoom +
        </button>
        <button id="zoom-out" style="padding:6px 10px;border-radius:6px;border:none;background:#ef4444;color:#fff;cursor:pointer;">
          Zoom -
        </button>
        <button id="zoom-reset" style="padding:6px 10px;border-radius:6px;border:none;background:#6b7280;color:#fff;cursor:pointer;">
          Reset
        </button>
      </div>

    </div>
  `;
}
