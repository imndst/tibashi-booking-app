export function initModal() {
  const eventModal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('closeEventModal');
  closeBtn.onclick = ()=> eventModal.style.display='none';
}
