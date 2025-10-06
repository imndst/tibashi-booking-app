import { ENDPOINTS ,BASE_URL } from '../../utils.js'
export default class Profiles {
  constructor(containerId, apiEndpoint = ENDPOINTS.profiles) {
    this.container = document.getElementById(containerId);
    this.apiEndpoint = apiEndpoint;
    this.loaded = false; // prevent multiple fetches
    this.initObserver();
  }

  initObserver() {
    if (!this.container) return;
    // Show initial loader
    this.container.innerHTML = `
      <div class="tibashi-loader-wrapper">
        <div class="tibashi-loader"></div>
        <p class="tibashi-loading-text">در حال بارگذاری اعضا...</p>
      </div>
    `;
    // Lazy load when visible
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loaded) {
          this.loaded = true;
          observer.disconnect();
          this.fetchData();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.container);
  }

  async fetchData() {
    try {
      const res = await fetch(this.apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status} دریافت داده‌ها ناموفق بود`);

      const data = await res.json();

      // Expect {status, message, result: []}
      if (!data.status || !Array.isArray(data.result)) {
        throw new Error(data.message || 'داده‌ها معتبر نیستند');
      }

      this.render(data.result);
    } catch (err) {
      console.error(err);
      this.container.innerHTML = `
        <div class="tibashi-error">
          ⚠️ خطا در دریافت داده‌ها: ${err.message}
        </div>
      `;
    }
  }

  render(profiles) {
    if (!this.container || !Array.isArray(profiles) || !profiles.length) {
      this.container.innerHTML = `<p class="tibashi-no-data">هیچ عضوی یافت نشد.</p>`;
      return;
    }

    const gridHtml = profiles.map(p => `
      <div class="tibashi-profile-card" title="${p.name}">
        <img 
          src="${p.name ? `${BASE_URL}${p.avatar}` : ''}" 
          alt="${p.name}" 
          class="tibashi-profile-img"
          onerror="this.onerror=null; this.src='${BASE_URL}${p.src}'"
        >
        <div class="tibashi-profile-name">${p.name}</div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <h2 class="tibashi-profiles-title">👤 Gishot Members</h2>
      <div class="tibashi-profiles-grid">
        ${gridHtml}
      </div>
    `;
  }
}
