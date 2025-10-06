// tibashi-js/modal/time.js
import { ENDPOINTS } from '../../utils.js';

export async function renderTimes(ev, tabContent) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;

  function getOrderLabel(tag) {
    return {
      101: "تمدید شد",
      102: "اجرای ویژه",
      103: "روزهای پایانی",
      104: "ساعت متفاوت",
      105: "تخفیف ویژه",
      106: "بلیت تمام شد",
      107: "تخفیف آغازین",
      999: "اجرای پایانی"
    }[tag] || "";
  }

  try {
    // Fetch times
    const res = await fetch(ENDPOINTS.times(ev.id));
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "داده نامعتبر است");
    const times = data.result.times;

    // Fetch capacity
    let capMap = {};
    if (times.some(t => t.tag !== 33 && t.tag !== 66)) {
      const capRes = await fetch(ENDPOINTS.capacity(ev.id));
      const capData = await capRes.json();
      if (capData.result) capData.result.forEach(c => capMap[c.sansId] = c);
    }

    // Render times
    tabContent.innerHTML = `<div class="scroll-x"></div>`;
    const scrollContainer = tabContent.querySelector('.scroll-x');

    times.forEach(s => {
      const cap = capMap[s.id];
      const reserved = cap?.reserved ?? 0;
      const soldOut = s.tag === 106 || cap?.soldout;
      const fullness = cap?.capacity ? Math.round((reserved / cap.capacity) * 100) : 0;

      const div = document.createElement('div');
      div.className = 'tibashi-sans-card';
      div.innerHTML = `
        <div class="tibashi-sans-title">${s.persian}</div>
        <div class="tibashi-sans-sub">${getOrderLabel(s.tag)}</div>
        <div class="tibashi-progress-bar">
          <div class="tibashi-progress-fill" style="width:${fullness}%"></div>
        </div>
        <button class="tibashi-sans-btn" ${soldOut ? "disabled" : ""} data-event-id="${s.events}" data-time-id="${s.id}">خرید</button>
      `;
      scrollContainer.appendChild(div);
    });

    // Add click event for "خرید" buttons
    document.querySelectorAll('.tibashi-sans-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const eventId = btn.getAttribute('data-event-id');
        const timeId = btn.getAttribute('data-time-id');
        const event = { eventId, timeId };
        window.history.pushState({ timeId }, "", `/b/${timeId}`);
        const { renderSeats } = await import('../modal/seat/SeatMap.js');
        await renderSeats(event, eventId);
      });
    });

    // Handle back/forward
   

  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری زمان‌ها</div>`;
    console.error(err);
  }
}
