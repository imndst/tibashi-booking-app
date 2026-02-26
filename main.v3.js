import { renderLayout } from "./shared/layout.js";
import { initEvents } from "./tibashi-js-v5/events/events.js";
import { EventComponent } from "./tibashi-js-v5/events/e.js";
import { renderSeatless } from "./tibashi-js-v5/modal/seat/SeatMap.js";
import { initImageCarousel } from "./tibashi-js-v5/events/swiper.js";
import { initBoxOffice } from "./tibashi-js-v5/events/boxOffice.js";
import { initViewPort } from "./tibashi-js-v5/events/viewPort.js";
import { initProfiles } from "./tibashi-js-v5/profile/profiles.js";
// import "./app.css";

// Get current URL
const currentUrl = window.location.href;
const url = new URL(currentUrl);

// Check if pathname is /e and there is a query param "m"
if (url.pathname === "/e" && url.searchParams.has("m")) {
  const m = url.searchParams.get("m");          // get the value of m
  const newUrl = `${url.origin}/e/${m}`;        // build new URL
  window.location.replace(newUrl);              // redirect to new URL
}

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
      // await renderSeats({ timeId }, app);
      await renderSeatless({timeId},app)
    },
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
