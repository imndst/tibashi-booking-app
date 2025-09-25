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
    // Fetch times from API
    const res = await fetch(`https://localhost:7032/api/Time/GetTimes/${ev.id}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "داده نامعتبر است");
    const times = data.result.times; // extract times array from API

    // Fetch capacity if needed
    let capMap = {};
    if (times.some(t => t.tag !== 33 && t.tag !== 66)) {
      const capRes = await fetch(`https://localhost:7032/api/Capacity/GetCapacity/${ev.id}`);
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
        <button class="tibashi-sans-btn" ${soldOut ? "disabled" : ""}  data-event-id="${s.events}" data-time-id="${s.id}">خرید</button>
      `;
      scrollContainer.appendChild(div);
    });

    // Add click event for each "خرید" button
    document.querySelectorAll('.tibashi-sans-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        const selectedId = btn.getAttribute('data-event-id');
        const { renderSeats } = await import('./seat/seats.js');
        await renderSeats(selectedId, tabContent);
      });
    });

  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری زمان‌ها</div>`;
    console.error(err);
  }
}
