// 📁 src/modules/profiles.js
import { getProfiles, BASE_URL } from "../../utils.js";

export function initProfiles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let loaded = false;

  // 🔹 Initial loader
  container.innerHTML = `
    <div class="tibashi-loader-wrapper">
      <div class="tibashi-loader"></div>
      <p class="tibashi-loading-text">در حال بارگذاری اعضا...</p>
    </div>
  `;

  // 🔹 Lazy load with IntersectionObserver
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
    { threshold: 0.1 }
  );

  observer.observe(container);

  // 🔹 Fetch data
  async function loadData() {
    try {
      const profiles = await getProfiles();

      if (!profiles || profiles.length === 0) {
        container.innerHTML = `<div class="tibashi-no-data">هیچ عضوی یافت نشد.</div>`;
        return;
      }

      render(profiles);
    } catch (err) {
      console.error("Error loading profiles:", err);
      container.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
    }
  }

  // 🔹 Render HTML
  function render(profiles) {
    const gridHtml = profiles
      .map(
        (p) => `
        <div class="tibashi-profile-card" title="${p.name}">
          <img 
            src="${BASE_URL}${p.src}" 
            alt="${p.name}" 
            class="tibashi-profile-img"
            onerror="this.onerror=null; this.src='/tibashi-asset/default-avatar.png'"
          >
          <div class="tibashi-profile-name">${p.name}</div>
        </div>
      `
      )
      .join("");

    container.innerHTML = `
      <h2 class="tibashi-profiles-title">👤 اعضای گیشات</h2>
      <div class="tibashi-profiles-grid">
        ${gridHtml}
      </div>
    `;
  }

  // Optionally expose reload API
  return { reload: loadData };
}
