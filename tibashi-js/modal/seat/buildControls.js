export function buildControls({ ticketCount = 0, totalPrice = 0, initialScale = 0.5 } = {}) {
  const container = document.createElement("div");
  container.id = "seat-controls";
  container.style.cssText = `
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    align-items:center;
    gap:12px;
    margin-top:20px;
    padding:10px;
    border-top:1px solid #eee;
    background:#fff;
  `;

  // Total price
  const totalDisplay = document.createElement("span");
  totalDisplay.id = "total-price";
  totalDisplay.style.fontWeight = "600";
  totalDisplay.textContent = `سبد خرید: ${ticketCount} بلیت - ${totalPrice} تومان`;

  // Pay button
  const btnPay = document.createElement("button");
  btnPay.id = "btn-pay";
  btnPay.textContent = "پرداخت";
  btnPay.style.cssText = `
    padding:8px 16px;
    border-radius:6px;
    border:none;
    background:#0ea5a4;
    color:#fff;
    cursor:pointer;
    font-weight:700;
  `;

  // Next button
  const btnNext = document.createElement("button");
  btnNext.id = "btn-next";
  btnNext.textContent = "ادامه";
  btnNext.style.cssText = `
    padding:8px 16px;
    border-radius:6px;
    border:none;
    background:#f59e0b;
    color:#111;
    cursor:pointer;
    font-weight:700;
  `;

  // Zoom controls
  const zoomContainer = document.createElement("div");
  zoomContainer.id = "zoom-controls";
  zoomContainer.style.cssText = "display:flex;gap:6px;align-items:center;";

  const zoomIn = document.createElement("button");
  zoomIn.id = "zoom-in";
  zoomIn.textContent = "Zoom +";
  zoomIn.style.cssText = "padding:6px 10px;border-radius:6px;border:none;background:#3b82f6;color:#fff;cursor:pointer;";

  const zoomOut = document.createElement("button");
  zoomOut.id = "zoom-out";
  zoomOut.textContent = "Zoom -";
  zoomOut.style.cssText = "padding:6px 10px;border-radius:6px;border:none;background:#ef4444;color:#fff;cursor:pointer;";

  const zoomReset = document.createElement("button");
  zoomReset.id = "zoom-reset";
  zoomReset.textContent = "Reset";
  zoomReset.style.cssText = "padding:6px 10px;border-radius:6px;border:none;background:#6b7280;color:#fff;cursor:pointer;";

  zoomContainer.appendChild(zoomIn);
  zoomContainer.appendChild(zoomOut);
  zoomContainer.appendChild(zoomReset);

  // Append controls
  container.appendChild(totalDisplay);
  container.appendChild(btnPay);
  container.appendChild(btnNext);
  container.appendChild(zoomContainer);

  // Event hooks
  container.onPay = (handler) => (btnPay.onclick = () => handler());
  container.onNext = (handler) => (btnNext.onclick = () => handler());
  container.update = (count, price) => (totalDisplay.textContent = `سبد خرید: ${count} بلیت - ${price} تومان`);

  // Zoom functionality
  container.initZoom = (seatMapEl, defaultScale = initialScale) => {
    let currentScale = defaultScale;
    zoomIn.addEventListener("click", () => {
      currentScale += 0.1;
      seatMapEl.style.transform = `scale(${currentScale})`;
    });
    zoomOut.addEventListener("click", () => {
      currentScale = Math.max(0.1, currentScale - 0.1);
      seatMapEl.style.transform = `scale(${currentScale})`;
    });
    zoomReset.addEventListener("click", () => {
      currentScale = defaultScale;
      seatMapEl.style.transform = `scale(${currentScale})`;
    });
  };

  return container;
}
