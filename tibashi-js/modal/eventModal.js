import { renderTimes } from '../../tibashi-js/modal/time.js';
import { renderInfo } from '../../tibashi-js/modal/info.js';
import { renderComments } from '../../tibashi-js/modal/comments.js';
import { BASE_URL } from '../utils/constants.js';
import { fetchTimes } from '../utils/api.js';

export async function openEvent(ev) {
  const eventBody = document.getElementById('eventBody');
  const eventModal = document.getElementById('eventModal');

  eventBody.innerHTML = `<div class="tibashi-loader"></div>`;
  eventModal.style.display = 'flex';

  // Fetch times data
  let timesData = null;
  try {
    timesData = await fetchTimes(ev.id);
    if (!timesData) throw new Error("داده نامعتبر است");
  } catch (err) {
    eventBody.innerHTML = `<div class="tibashi-error">خطا در دریافت اطلاعات رویداد</div>`;
    console.error(err);
    return;
  }

  const { title, genre, age, banner, poster } = timesData;
  const eventImage = BASE_URL + (banner || poster);

  // --------- SEO: Dynamic Title & Meta Description ---------
  document.title = `${title} - بلیت و اطلاعات رویداد | Gishot`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `خرید بلیت ${title} | ژانر: ${genre} | رده سنی: ${age ?? '-'}`
    );
  }

  // --------- Open Graph / Social Sharing ---------
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDesc) ogDesc.setAttribute('content', `خرید بلیت ${title} | ژانر: ${genre}`);
  if (ogImage) ogImage.setAttribute('content', eventImage);

  // --------- Structured Data JSON-LD ---------
  const existingScript = document.getElementById('event-json-ld');
  if (existingScript) existingScript.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'event-json-ld';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": title,
    "image": [eventImage],
    "description": `خرید بلیت ${title} | ژانر: ${genre} | رده سنی: ${age ?? '-'}`,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": ev.location || "Gishot Event Hall",
      "address": ev.address || ""
    },
    "startDate": timesData.startDate || new Date().toISOString()
  });
  document.head.appendChild(script);

  // --------- Render modal structure ---------
  eventBody.innerHTML = `
    <img src="${eventImage}" class="tibashi-modal-img">
    <div class="tibashi-info-wrapper">
      <div class="tibashi-info-header">
        <h2 class="tibashi-modal-title">${title} ${ev.rate ? `⭐ ${ev.rate}` : ''}</h2>
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
    }, 100); 
  }

  await renderTimes(ev, tabContent);

  // Tab switching
  document.querySelectorAll('.tibashi-tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.tibashi-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;

      if (tab === 'times') await smoothRender(renderTimes);
      else if (tab === 'info') await smoothRender(renderInfo);
      else if (tab === 'comments') await smoothRender(renderComments);
    });
  });

  // Handle browser back/forward
  window.onpopstate = async () => {
    const path = window.location.pathname;
    if (path.startsWith('/e/')) {
      document.querySelectorAll('.tibashi-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-tab="times"]').classList.add('active');
      await renderTimes(ev, tabContent);
    } else if (path === '/') {
      eventModal.style.display = 'none';
    }
  };
}
