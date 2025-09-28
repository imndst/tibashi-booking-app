export function initModal() {
  const eventModal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('closeEventModal');

  // تابعی برای بستن modal و پاک کردن URL
  function closeModal() {
    eventModal.style.display = 'none';
    // جایگزین کردن URL با روت اصلی بدون اضافه کردن به history
    if (window.location.pathname.startsWith('/e/') || window.location.pathname.startsWith('/b/')) {
      window.history.replaceState({}, "", "/");
    }
  }

  // بستن با کلید close
  closeBtn.onclick = closeModal;

  // بستن modal وقتی URL تغییر کرد (back/forward)
  window.addEventListener('popstate', () => {
    if (!window.location.pathname.startsWith('/e/')) {
      closeModal();
    }
  });
}
