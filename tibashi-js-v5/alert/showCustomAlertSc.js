export default function showCustomAlertSc(message, type = "success") {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "custom-alert-overlay";

  // Create dialog
  const dialog = document.createElement("div");
  dialog.className = "custom-alert-dialog";

  // Set background color based on type
  let bgColor = "#ffffff"; // default white
  if (type === "success") bgColor = "#2acc50ff"; // light green
  else if (type === "error") bgColor = "#f8d7da"; // light red
  else if (type === "warning") bgColor = "#fff3cd"; // light yellow

  dialog.style.backgroundColor = bgColor;
  dialog.style.border = `1px solid ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#ffc107"}`;
  dialog.innerHTML = `
    <span class="custom-alert-close" style="cursor:pointer; float:right;">&times;</span>
    <p>${message}</p>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Close function
  function closeAlert() {
    overlay.remove();
  }

  // Close on clicking overlay or close icon
  overlay.addEventListener("click", closeAlert);
  dialog.querySelector(".custom-alert-close").addEventListener("click", closeAlert);

  // Prevent closing when clicking inside dialog
  dialog.addEventListener("click", (e) => e.stopPropagation());
}
