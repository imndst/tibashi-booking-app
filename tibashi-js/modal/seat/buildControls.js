// buildControls.js
export function buildControls({ ticketCount = 0, totalPrice = 0 }) {
  const container = document.createElement("div");
  container.id = "seat-controls";
  container.style.cssText = `
    display:flex;
    justify-content:center;
    align-items:center;
    gap:12px;
    margin-top:20px;
    padding:10px;
    border-top:1px solid #eee;
    background:#fff;
  `;

  const button = document.createElement("button");
  button.id = "btn-combined";
  button.style.cssText = `
    padding:8px 16px;
    border-radius:6px;
    border:none;
    background:#0ea5a4;
    color:#fff;
    cursor:pointer;
    font-weight:700;
  `;
  button.textContent = `ادامه | سبد خرید (${ticketCount} بلیت - ${totalPrice})`;

  container.appendChild(button);
  return container;
}
