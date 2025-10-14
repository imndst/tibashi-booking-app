import { renderLayout } from "./shared/layout.js";

import { initEvents } from './tibashi-js/events/events.js'
import { EventComponent } from "./tibashi-js/events/e.js";
import { renderSeats } from "./tibashi-js/modal/seat/SeatMap.js";
import { initImageCarousel } from "./tibashi-js/events/swiper.js";

const routes = [
  {
    path: /^\/$/,
    view: async () => {
      // Create home content container
      document.getElementById("app").innerHTML = `
        <section class="main">
          <div id="swiperContainer" class="tibashi-slider-container"></div>
          <div id="eventsSection">
            <div id="slider"></div>
            <nav id="categoriesNav" class="tibashi-categories"></nav>
            <input type="text" id="searchInput" placeholder="جستجو..." class="tibashi-search"/>
            <div id="eventsContainer"></div>
          </div>
        </section>
      `;

      // Initialize slider
      const container = document.getElementById("slider");
       initImageCarousel(container);

      // Initialize events
      await initEvents();

      return ""; // content handled inside init functions
    }
  },
  
{
  path: /^\/e\/(\d+)$/,
  view: async (params) => {
    const eventId = params[1];
    return await EventComponent(eventId);
  }
}
,
 {
  path: /^\/b\/(\d+)$/, 
  view: async (params) => {
    const timeId = params[1];        
    const app = document.getElementById("seat-map-continer");
    app.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;
    await renderSeats({ timeId }, app);
  },
}
,

  {
    path: /^\/account\/pay$/,
    view: () => `<h1>💳 صفحه پرداخت</h1>`
  },
  {
    path: /^\/search$/,
    view: () => {
      const query = Object.fromEntries(new URLSearchParams(window.location.search));
      return `<h1>🔎 جستجو برای: ${query.q || "نامشخص"}</h1>`;
    }
  },
  {
    path: /.*/,
    view: () => `<h1>❌ 404 - صفحه پیدا نشد</h1>`
  }
];

async function router() {
  let path = window.location.pathname;

  if (path.endsWith("/index.html")) {
    const newPath = path.replace("/index.html", "/");
    window.history.replaceState({}, "", newPath + window.location.search);
    path = newPath;
  }

  for (let route of routes) {
    const match = path.match(route.path);
    if (match) {
      const result = await route.view(match);
      if (result) document.getElementById("app").innerHTML = result;
      return;
    }
  }
}

function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

window.addEventListener("popstate", router);

document.addEventListener("click", e => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

// On page load
window.addEventListener("load", () => {
  renderLayout(); // Header + Sidebar + Footer
  router();       // Load initial content
});
