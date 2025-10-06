// shared/layout.js
export function renderLayout() {
  document.body.innerHTML = `
    <header id="navbar">
      <nav>
        <a href="/" data-link>خانه</a>
        <a href="/product/42" data-link>محصول</a>
        <a href="/account/pay" data-link>پرداخت</a>
        <a href="/search?q=test" data-link>جستجو</a>
      </nav>
    </header>

    <aside id="sidebar" class="sidebar">
      <ul>
        <li><a href="/" data-link>🏠 خانه</a></li>
        <li><a href="/product/1" data-link>📦 محصولات</a></li>
        <li><a href="/account/pay" data-link>💳 پرداخت</a></li>
      </ul>
    </aside>

    <main id="app" class="content">
      <!-- محتوای صفحه اینجا جایگزین میشه -->
    </main>

    <footer class="footer">
      <p>© 2025 Tibashi SPA Router Example</p>
    </footer>
  `;
}
