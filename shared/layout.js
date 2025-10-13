// ===== Apply theme as early as possible =====
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

// Optional: prevent flicker by hiding body until layout loads
document.body.style.visibility = "hidden";

// ===== Exported function to render layout =====
export function renderLayout() {
  document.body.innerHTML = `
    <header id="navbar">
      <div class="nav-container">
        <button id="menuBtn" class="menu-btn" aria-label="منو">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-logo">Tibashi</div>
      </div>

      <nav id="navMenu" class="nav-menu">
        <a href="/" data-link>🏠 خانه</a>
        <a href="/product/42" data-link>📦 محصول</a>
        <a href="/account/pay" data-link>💳 پرداخت</a>
        <a href="/search?q=test" data-link>🔍 جستجو</a>
        <button id="themeToggle" class="theme-toggle">🌓 تغییر تم</button>
      </nav>
    </header>

    <div id="navOverlay" class="nav-overlay"></div>

    <main id="app" class="content"></main>

    <footer class="footer">
      <p>© 2025 GIshot-Tibashi SPA Router</p>
    </footer>
  `;

  // ===== Select DOM elements =====
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");
  const themeToggle = document.getElementById("themeToggle");
  const navOverlay = document.getElementById("navOverlay");

  // Always show hamburger
  menuBtn.style.display = "flex";

  // Toggle menu slide + overlay
  const toggleMenu = () => {
    menuBtn.classList.toggle("open");
    navMenu.classList.toggle("open");
    navOverlay.classList.toggle("active");
  };
  menuBtn.addEventListener("click", toggleMenu);

  // Close menu on overlay click
  navOverlay.addEventListener("click", () => {
    menuBtn.classList.remove("open");
    navMenu.classList.remove("open");
    navOverlay.classList.remove("active");
  });

  // Close menu when any nav link clicked
  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuBtn.classList.remove("open");
      navMenu.classList.remove("open");
      navOverlay.classList.remove("active");
    });
  });

  // ===== Theme management =====
  const setTheme = (mode) => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
    updateThemeButton();
  };

  const updateThemeButton = () => {
    themeToggle.textContent =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "☀️ حالت روشن"
        : "🌙 حالت تاریک";
  };

  // Apply initial theme
  setTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    setTheme(newTheme);
  });

  // Optional: close menu if ESC is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menuBtn.classList.remove("open");
      navMenu.classList.remove("open");
      navOverlay.classList.remove("active");
    }
  });

  // ===== Show body after layout is ready =====
  document.body.style.visibility = "visible";
}
