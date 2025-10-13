export default function showCustomAlert(message) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "custom-alert-overlay";

  // Create dialog
  const dialog = document.createElement("div");
  dialog.className = "custom-alert-dialog";
  dialog.innerHTML = `
    <span class="custom-alert-close">&times;</span>
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
  dialog.querySelector(".custom-alert-close")
        .addEventListener("click", closeAlert);

  // Prevent closing when clicking inside dialog
  dialog.addEventListener("click", (e) => e.stopPropagation());
}
