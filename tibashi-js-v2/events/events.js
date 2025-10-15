import { fetchEvents, BASE_URL } from '../../utils.js';
import { showLoader, hideLoader } from '../loader-spin/loaders.js';
import { EventComponent } from './e.js'; // SPA route component

let allEvents = [];
let filteredEvents = [];
let activeCategory = "همه";

export async function initEvents() {
 
  const searchInput = document.getElementById("searchInput");
  const categoriesNav = document.getElementById("categoriesNav");
   const eventsContainer = document.getElementById("eventsContainer");
  const loaderId = showLoader({ type: 'circle', target: eventsContainer, theme: 'primary' });

  try {
    allEvents = await fetchEvents();
    hideLoader(loaderId);

    setupCategories();
    filterEvents();
  } catch (err) {
    hideLoader(loaderId);
    eventsContainer.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
  }

  searchInput.addEventListener("input", filterEvents);
const footer = document.querySelector("footer.footer");
          if (footer) {
            footer.style.position = "fixed"; // or "relative"
            footer.style.display= "block"; 
          }
  // -------------------------
  // Categories
  // -------------------------
function setupCategories() {
  // Normalize gne values, replace null/empty with "سایر"
  const gnes = [
    "همه",
    ...new Set(
      allEvents.map((e) => (e.gne && e.gne.trim() ? e.gne : "سایر"))
    ),
  ];

  categoriesNav.innerHTML = "";

  gnes.forEach((g) => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.className = g === "همه" ? "tibashi-cat-btn tibashi-cat-active" : "tibashi-cat-btn";
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
      btn.classList.toggle("tibashi-cat-active", btn.textContent === activeCategory);
    });
  }

  // -------------------------
  // Filter
  // -------------------------
 function filterEvents() {
  const query = searchInput.value.toLowerCase();

  filteredEvents = allEvents.filter((e) => {
    // ✅ Normalize gne (if null, undefined, or empty → "سایر")
    const gne = e.gne && e.gne.trim() ? e.gne : "سایر";

    return (
      (activeCategory === "همه" || gne === activeCategory) &&
      (
        (e.name && e.name.toLowerCase().includes(query)) ||
        (e.location && e.location.toLowerCase().includes(query)) ||
        (gne.toLowerCase().includes(query))
      )
    );
  });

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
      const card = document.createElement("a");
      card.href = `/e/${ev.id}`;
      card.className = "tibashi-event-card tibashi-shine once";
      setTimeout(() => card.classList.remove('once'), 1200);

      const img = document.createElement("img");
      img.src = `${BASE_URL}${ev.src}`;
      img.alt = ev.name;
      img.className = "tibashi-event-img loading";
      img.onload = () => img.classList.remove("loading");
      card.appendChild(img);

      card.innerHTML += `
        <h3 class="tibashi-event-name">${ev.name}</h3>
        <div class="tibashi-event-location">${ev.location}</div>
        <div class="tibashi-event-rate">
          ${ev.rate && ev.rate !== "0" ? "⭐ " + ev.rate : ""}
        </div>
      `;

      // -------------------------
      // SPA navigation
      // -------------------------
      card.addEventListener("click", (e) => {
  e.preventDefault();
  const newUrl = `/e/${ev.id}`;

  const app = document.getElementById("app");
  
  // Slide out current content to left
  app.classList.add("page-slide-out");
  
  setTimeout(() => {
    // Update URL & history
    history.pushState({ eventId: ev.id }, "", newUrl);

    // Load event component
    EventComponent(ev.id);

    // Slide in new content from right
    app.classList.remove("page-slide-out");
    app.classList.add("page-slide-in");

    // Remove slide-in class after animation ends
    setTimeout(() => app.classList.remove("page-slide-in"), 400);
  }, 200);
});


      eventsContainer.appendChild(card);
    });
  }
}
