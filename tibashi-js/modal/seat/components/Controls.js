export function buildControls() {
  return `
    <div id="seat-controls" style="display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:10px;padding:10px;background:#fff;border-top:1px solid #eee;">
      <div id="total-price" style="font-weight:700;">سبد خرید: 0 بلیت - 0 تومان</div>
      <button id="btn-pay" style="padding:8px 16px;border:none;border-radius:6px;background:#0ea5a4;color:#fff;cursor:pointer;font-weight:700;">پرداخت</button>
      <button id="btn-next" style="padding:8px 16px;border:none;border-radius:6px;background:#f59e0b;color:#111;cursor:pointer;font-weight:700;">ادامه</button>
    </div>
  `;
}
