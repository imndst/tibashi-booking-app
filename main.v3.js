import { renderLayout } from "./shared/layout.js";
import { initEvents } from "./tibashi-js-v2/events/events.js";
import { EventComponent } from "./tibashi-js-v2/events/e.js";
import { renderSeats } from "./tibashi-js-v2/modal/seat/SeatMap.js";
import { initImageCarousel } from "./tibashi-js-v2/events/swiper.js";
import { initBoxOffice } from "./tibashi-js-v2/events/boxOffice.js";
import { initViewPort } from "./tibashi-js-v2/events/viewPort.js";
import { initProfiles } from "./tibashi-js-v2/profile/profiles.js";
const routes = [
  {
    path: /^\/$/,
    view: async () => {
      document.getElementById("app").innerHTML = `
        <section class="main">
          <div id="eventsSection">
            <div id="tibashi-slider-container"></div>
            <nav id="categoriesNav" class="tibashi-categories"></nav>
            <input type="text" id="searchInput" placeholder="جستجو..." class="tibashi-search"/>
            <div id="eventsContainer"></div>
            <div id="view-port"></div>
            <div id="box-office"></div>
            <div id="gishot-in"></div>
          </div>
        </section>
      
      `;

      const container = document.getElementById("tibashi-slider-container");
      initImageCarousel(container);
      await initEvents();
      const viewPort = initViewPort("view-port");
      viewPort.reload();
      initBoxOffice("box-office");
      initProfiles("gishot-in")
      return "";
    },
  },

  {
    path: /^\/e\/(\d+)$/,
    view: async (params) => {
      const eventId = params[1];
      return await EventComponent(eventId);
    },
  },
  {
    path: /^\/b\/(\d+)$/,
    view: async (params) => {
      const timeId = params[1];
      const app = document.getElementById("seat-map-continer");
      app.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;
      await renderSeats({ timeId }, app);
    },
  },
  {
    path: /^\/account\/pay$/,
    view: () => `<h1>💳 صفحه پرداخت</h1>`,
  },
  {
    path: /^\/search$/,
    view: () => {
      const query = Object.fromEntries(
        new URLSearchParams(window.location.search)
      );
      return `<h1>🔎 جستجو برای: ${query.q || "نامشخص"}</h1>`;
    },
  },
  {
    path: /.*/,
    view: () => `<h1>❌ 404 - صفحه پیدا نشد</h1>`,
  },
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
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});
window.addEventListener("load", () => {
  renderLayout(); // Header + Sidebar + Footer
  router();
});
