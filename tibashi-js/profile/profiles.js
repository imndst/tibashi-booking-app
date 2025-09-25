export default class Profiles {
  constructor(containerId, apiEndpoint) {
    this.container = document.getElementById(containerId);
    this.apiEndpoint = apiEndpoint;
    this.loaded = false; // prevent multiple fetches
    this.initObserver();
  }

  initObserver() {
    if (!this.container) return;

    // Initially show loader
    this.container.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

    // Observe when the top of the container enters viewport
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loaded) {
          this.loaded = true; // mark as loaded
          observer.disconnect(); // stop observing
          this.fetchData();
        }
      });
    }, { threshold: 0 });

    observer.observe(this.container);
  }

  async fetchData() {
    try {
      const res = await fetch(this.apiEndpoint);
      if (!res.ok) throw new Error("خطا در دریافت داده‌ها");
      const data = await res.json();

      // Check API response standard {status, message, result}
      if (!data.status || !Array.isArray(data.result)) {
        throw new Error("داده‌ها معتبر نیستند");
      }

      this.render(data.result);
    } catch (err) {
      console.error(err);
      this.container.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
    }
  }

  render(profiles) {
    if (!this.container || !Array.isArray(profiles)) return;

    this.container.innerHTML = `
      <h2 class="tibashi-profiles-title">👤 Gishot Members</h2>
      <div class="tibashi-profiles-grid">
        ${profiles.map(p => `
          <div class="tibashi-profile-card" title="${p.name}">
            <img src="${p.avatar || 'https://via.placeholder.com/150'}" alt="${p.name}" class="tibashi-profile-img">
            <div class="tibashi-profile-name">${p.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
