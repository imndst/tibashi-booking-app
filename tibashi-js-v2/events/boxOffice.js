import { getBoxOffice } from "../../utils.js";

export function initBoxOffice(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let loaded = false;

  // 🔹 Show initial loader
  container.innerHTML = `<div class="tibashi-loader"></div>`;

  // 🔹 Lazy-load when visible
  const observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          observer.disconnect();
          await loadData();
        }
      }
    },
    { threshold: .1 }
  );

  observer.observe(container);

  // 🔹 Fetch data
  async function loadData() {
    try {
      const data = await getBoxOffice();

      if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<div class="tibashi-error">هیچ داده‌ای برای باکس آفیس یافت نشد</div>`;
        return;
      }

      render(data);
    } catch (err) {
      console.error("Error loading BoxOffice:", err);
      container.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
    }
  }

  // 🔹 Render function
  function render(items) {
    container.innerHTML = `
      <h2 class="tibashi-box-title">🎬 باکس آفیس</h2>
      <div class="tibashi-box-grid">
        ${items
          .map(
            (item) => `
          <div class="tibashi-box-card">
            <h3 class="tibashi-box-name">${item.name}</h3>
            <p class="tibashi-box-count">تعداد بلیط‌ها: <span>${item.count}</span></p>
            <p class="tibashi-box-time">تعداد سانس‌ها: <span>${item.timeCount}</span></p>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // Return public API (optional)
  return { reload: loadData };

}
