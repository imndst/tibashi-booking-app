import { renderTimes } from '../../tibashi-js/modal/time.js';
import { renderInfo } from '../../tibashi-js/modal/info.js';
import { renderComments } from '../../tibashi-js/modal/comments.js';
import { renderSeats } from './seat/seats.js';

export async function openEvent(ev) {
  const eventBody = document.getElementById('eventBody');
  const eventModal = document.getElementById('eventModal');

  eventBody.innerHTML = `<div class="tibashi-loader"></div>`;
  eventModal.style.display = 'flex';

  // Fetch times first
  let timesData = null;
  try {
    const res = await fetch(`https://localhost:7032/api/Time/GetTimes/${ev.id}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "داده نامعتبر است");
    timesData = data.result;
  } catch (err) {
    eventBody.innerHTML = `<div class="tibashi-error">خطا در دریافت اطلاعات رویداد</div>`;
    console.error(err);
    return;
  }

  const { title, genre, age, banner, poster, times } = timesData;

  // Render modal structure
  eventBody.innerHTML = `
    <img src="https://gishot.ir/${banner || poster}" class="tibashi-modal-img">
    <div class="tibashi-info-wrapper">
      <div class="tibashi-info-header">
        <h2 class="tibashi-modal-title">
          ${title} ${ev.rate ? `⭐ ${ev.rate}` : ''}
        </h2>
        <p class="tibashi-modal-genre">${genre}</p>
        <p class="tibashi-modal-age">رده سنی: ${age ?? '-'}</p>
        <div class="tibashi-tabs">
          <button class="tibashi-tab-btn active" data-tab="times">خرید بلیت</button>
          <button class="tibashi-tab-btn" data-tab="info">اطلاعات</button>
          <button class="tibashi-tab-btn" data-tab="comments">نظرات</button>
        </div>
      </div>
      <div id="tabContent" class="tibashi-tab-content scrollable"></div>
    </div>
  `;

  const tabContent = document.getElementById('tabContent');

  async function smoothRender(renderFn) {
    tabContent.classList.add('hidden'); 
    setTimeout(async () => {
      await renderFn(ev, tabContent);                 
      tabContent.classList.remove('hidden'); 
    }, 300); 
  }

  // Initial render
  await renderTimes(ev, tabContent);

  // Tab switching
  document.querySelectorAll('.tibashi-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tibashi-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      if (tab === 'times') smoothRender(renderTimes);
      else if (tab === 'info') smoothRender(renderInfo);
      else if (tab === 'comments') smoothRender(renderComments);
    });
  });

  // Close modal
  const closeBtn = document.getElementById('closeEventModal');
  if (closeBtn) {
    const prevURL = window.location.pathname + window.location.search;
    closeBtn.onclick = () => {
      eventModal.style.display = 'none';
      window.history.pushState({}, '', prevURL);
    };
  }

  // Push history
  if (window.location.pathname !== `/e/${ev.id}`) {
    window.history.pushState({ modalOpen: true }, '', `/e/${ev.id}`);
  }
}
