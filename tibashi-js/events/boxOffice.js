export default class BoxOffice {
  constructor(containerId, apiEndpoint) {
    this.container = document.getElementById(containerId);
    this.apiEndpoint = apiEndpoint;
    this.loaded = false; // prevent multiple API calls
    this.initObserver();
  }

  initObserver() {
    if (!this.container) return;

    // Initially show loader
    this.container.innerHTML = `<div class="tibashi-loader"></div>`;

    // Observe when top of container enters viewport
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loaded) {
          this.loaded = true; // mark as loaded
          observer.disconnect(); // stop observing
          this.fetchData();
        }
      });
    }, { threshold: 0 }); // trigger when top enters viewport

    observer.observe(this.container);
  }

  async fetchData() {
    try {
      const res = await fetch(this.apiEndpoint);
      if (!res.ok) throw new Error("خطا در دریافت داده‌ها");

      const data = await res.json();
      // API returns { status, message, result }
      if (!data.status || !data.result) throw new Error("داده‌ها معتبر نیستند");

      this.render(data.result);
    } catch (err) {
      console.error(err);
      this.container.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
    }
  }

  render(items) {
    if (!this.container || !Array.isArray(items)) return;

    this.container.innerHTML = `
      <h2 class="tibashi-box-title">🎬 Box Office</h2>
      <div class="tibashi-box-grid">
        ${items.map(item => `
          <div class="tibashi-box-card">
            <h3 class="tibashi-box-name">${item.name}</h3>
            <p class="tibashi-box-count">Count: <span>${item.count}</span></p>
            <p class="tibashi-box-time">Time Count: <span>${item.timeCount}</span> sessions</p>
            <p class="tibashi-box-price">Price: <span>${item.price || '—'}</span></p>
          </div>
        `).join('')}
      </div>
    `;
  }
}
