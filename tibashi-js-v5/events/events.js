import { fetchEvents, BASE_URL } from '../../utils.js';
import { showLoader, hideLoader } from '../loader-spin/loaders.js';
import { EventComponent } from './e.js';

let allEvents     = [];
let filteredEvents = [];
let activeCategory = "همه";

// ── Skeleton ─────────────────────────────────────────────────────
const SKELETON_CARD = `
  <div class="tibashi-event-card" aria-hidden="true">
    <div class="tibashi-event-img-wrap tibashi-skeleton"></div>
    <div class="tibashi-event-body">
      <div class="tibashi-skeleton-line tibashi-skeleton"></div>
      <div class="tibashi-skeleton-line short tibashi-skeleton"></div>
    </div>
  </div>`;

// ── Stars ─────────────────────────────────────────────────────────
function renderStars(rate) {
  const n = Math.min(5, Math.max(0, Math.round(parseFloat(rate) || 0)));
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < n ? 'var(--color-primary)' : 'var(--color-border)'};font-size:0.8rem">★</span>`
  ).join('');
}

// ── Init ──────────────────────────────────────────────────────────
export async function initEvents() {
  const searchInput     = document.getElementById("searchInput");
  const categoriesNav   = document.getElementById("categoriesNav");
  const eventsContainer = document.getElementById("eventsContainer");

  // ✅ reserve space immediately — prevents CLS
  categoriesNav.innerHTML = `<button class="tibashi-cat-btn tibashi-cat-active">همه</button>`;
  eventsContainer.innerHTML = Array(12).fill(SKELETON_CARD).join('');

  const loaderId = showLoader({ type: 'circle', target: eventsContainer, theme: 'primary' });

  try {
    allEvents = await fetchEvents();
    hideLoader(loaderId);
    setupCategories();
    filterEvents();
  } catch (err) {
    hideLoader(loaderId);
    eventsContainer.innerHTML = `<p class="tibashi-error">خطا در دریافت داده‌ها. لطفاً دوباره تلاش کنید.</p>`;
  }

  searchInput.addEventListener("input", filterEvents);

  const footer = document.querySelector("footer.footer");
  if (footer) {
    footer.style.position = "fixed";
    footer.style.display  = "block";
  }
}

// ── Categories ────────────────────────────────────────────────────
function setupCategories() {
  const categoriesNav = document.getElementById("categoriesNav");

  const genres = [
    "همه",
    ...new Set(allEvents.map(e => e.gne?.trim() || "سایر"))
  ];

  categoriesNav.innerHTML = "";

  genres.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.className   = g === "همه"
      ? "tibashi-cat-btn tibashi-cat-active"
      : "tibashi-cat-btn";

    btn.addEventListener("click", () => {
      activeCategory = g;
      filterEvents();
      updateCategoryButtons();
    });

    categoriesNav.appendChild(btn);
  });
}

function updateCategoryButtons() {
  const categoriesNav = document.getElementById("categoriesNav");
  Array.from(categoriesNav.children).forEach(btn => {
    btn.classList.toggle("tibashi-cat-active", btn.textContent === activeCategory);
  });
}

// ── Filter ────────────────────────────────────────────────────────
function filterEvents() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value.toLowerCase().trim();

  filteredEvents = allEvents.filter(e => {
    const gne = e.gne?.trim() || "سایر";
    const matchCat    = activeCategory === "همه" || gne === activeCategory;
    const matchSearch = !query ||
      e.name?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query) ||
      gne.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  renderEvents(filteredEvents);
  updateCategoryButtons();
}

// ── Render ────────────────────────────────────────────────────────
function renderEvents(events) {
  const eventsContainer = document.getElementById("eventsContainer");

  // ✅ پاک کردن skeleton ها قبل از هر چیز
  eventsContainer.innerHTML = "";

  if (!events.length) {
    eventsContainer.innerHTML = `<p class="tibashi-no-events">رویدادی یافت نشد.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  events.forEach(ev => {
    const gne  = ev.gne?.trim() || "سایر";
    const card = document.createElement("a");
    card.href            = `/e/${ev.id}`;
    card.className       = "tibashi-event-card";
    card.dataset.eventId = ev.id;
    card.setAttribute("aria-label", ev.name);

    const imgWrap = document.createElement("div");
    imgWrap.className = "tibashi-event-img-wrap";

    const img = document.createElement("img");
    img.alt       = ev.name;
    img.className = "tibashi-event-img";
    img.loading   = "lazy";
    img.decoding  = "async";
    img.width     = 300;
    img.height    = 450;
    img.addEventListener("load",  () => img.classList.add("loaded"));
    img.addEventListener("error", () => { imgWrap.style.background = "var(--color-bg)"; });
    img.src = `${BASE_URL}${ev.src}`;

    const badge       = document.createElement("span");
    badge.className   = "tibashi-event-badge";
    badge.textContent = gne;

    imgWrap.appendChild(img);
    imgWrap.appendChild(badge);

    const body = document.createElement("div");
    body.className = "tibashi-event-body";
    body.innerHTML = `
      <h3 class="tibashi-event-name">${ev.name}</h3>
      <div class="tibashi-event-location">${ev.location ?? ""}</div>
      ${ev.rate ? `<div class="tibashi-event-rate">${renderStars(ev.rate)}</div>` : ""}
    `;

    card.appendChild(imgWrap);
    card.appendChild(body);
    card.addEventListener("click", e => { e.preventDefault(); navigateTo(ev.id); });
    fragment.appendChild(card);
  });

  eventsContainer.appendChild(fragment);
}
// ── SPA Navigation ────────────────────────────────────────────────
function navigateTo(eventId) {
  const app    = document.getElementById("app");
  const newUrl = `/e/${eventId}`;

  app.classList.add("page-slide-out");
  setTimeout(() => {
    history.pushState({ eventId }, "", newUrl);
    EventComponent(eventId);
    app.classList.remove("page-slide-out");
    app.classList.add("page-slide-in");
    setTimeout(() => app.classList.remove("page-slide-in"), 400);
  }, 220);
}