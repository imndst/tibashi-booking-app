import { openEvent } from "./modal/eventModal.js"; // modal logic
import { fetchEvents } from './utils/api.js';
import { BASE_URL } from "./utils/constants.js";

let allEvents = [];
let filteredEvents = [];
let activeCategory = "همه";
let currentEventId = null; // ذخیره ID رویدادی که باز شده

export async function initEvents() {
  const eventsContainer = document.getElementById("eventsContainer");
  const searchInput = document.getElementById("searchInput");
  const categoriesNav = document.getElementById("categoriesNav");

  // Loader
  eventsContainer.innerHTML = `
    <div class="tibashi-loader-wrapper">
      <div class="tibashi-loader"></div>
      <p class="tibashi-loading-text">در حال بارگذاری...</p>
    </div>
  `;

  try {
    allEvents = await fetchEvents();
    setupCategories();
    filterEvents();

    // Handle initial URL if /e/:id
    handleUrlEvent(window.location.pathname);
  } catch (err) {
    console.error(err);
    eventsContainer.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
  }

  // Search
  searchInput.addEventListener("input", filterEvents);

  // Listen to popstate for Back/Forward navigation
  window.addEventListener("popstate", () => {
    handleUrlEvent(window.location.pathname, true);
  });

  // -------------------------
  // Categories
  // -------------------------
  function setupCategories() {
    const gnes = ["همه", ...new Set(allEvents.map((e) => e.gne))];
    categoriesNav.innerHTML = "";

    gnes.forEach((g) => {
      const btn = document.createElement("button");
      btn.textContent = g;
      btn.className =
        g === "همه" ? "tibashi-cat-btn tibashi-cat-active" : "tibashi-cat-btn";
      btn.onclick = () => {
        activeCategory = g;
        filterEvents();
        updateCategoryButtons();
      };
      categoriesNav.appendChild(btn);
    });
  }

  function updateCategoryButtons() {
    Array.from(categoriesNav.children).forEach((btn) => {
      btn.classList.toggle(
        "tibashi-cat-active",
        btn.textContent === activeCategory
      );
    });
  }

  // -------------------------
  // Filtering
  // -------------------------
  function filterEvents() {
    const query = searchInput.value.toLowerCase();

    filteredEvents = allEvents.filter(
      (e) =>
        (activeCategory === "همه" || e.gne === activeCategory) &&
        (e.name.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.gne.toLowerCase().includes(query))
    );

    renderEvents(filteredEvents);
    updateCategoryButtons();
  }

  // -------------------------
  // Render Event Cards
  // -------------------------
  function renderEvents(events) {
    eventsContainer.innerHTML = "";

    if (!events.length) {
      eventsContainer.innerHTML = `<p class="tibashi-no-events">رویدادی یافت نشد.</p>`;
      return;
    }

    events.forEach((ev) => {
      const card = document.createElement("div");
      card.className = "tibashi-event-card tibashi-shine";
      card.innerHTML = `
        <img src="${BASE_URL}${ev.src}" alt="${
        ev.name
      }" class="tibashi-event-img">
        <h3 class="tibashi-event-name">${ev.name}</h3>
        <div class="tibashi-event-location">${ev.location}</div>
        <div class="tibashi-event-rate">${
          ev.rate && ev.rate !== "0" ? "⭐ " + ev.rate : ""
        }</div>
      `;
      card.onclick = () => openEventWithHistory(ev);
      eventsContainer.appendChild(card);
    });
  }

  // -------------------------
  // History & Modal Handling
  // -------------------------
  function openEventWithHistory(ev) {
    currentEventId = ev.id;
    openEvent(ev); // باز کردن modal
    // Push state to History
    window.history.pushState({ eventId: ev.id }, "", `/e/${ev.id}`);
  }

  function handleUrlEvent(path, isPop = false) {
    const match = path.match(/^\/e\/(\d+)$/);
    if (match) {
      const eventId = parseInt(match[1]);
      const ev = allEvents.find((e) => e.id === eventId);
      if (ev) {
        if (!isPop || currentEventId !== eventId) {
          currentEventId = eventId;
          openEvent(ev);
        }
      } else {
        // اگر ID پیدا نشد، به صفحه اصلی برگرد
        if (currentEventId) console.log("s");
        currentEventId = null;
        window.history.replaceState({}, "", "/");
      }
    } else {
      // اگر مسیر /e/:id نبود، modal بسته شود
      if (currentEventId) console.log("s");
      currentEventId = null;
      if (!isPop) window.history.replaceState({}, "", "/");
    }
  }
}
