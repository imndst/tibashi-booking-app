import { fetchEvents, BASE_URL } from '../../utils.js';


let allEvents = [];
let filteredEvents = [];
let activeCategory = "همه";


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
  } catch (err) {
    console.error(err);
    eventsContainer.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
  }

  // Search
  searchInput.addEventListener("input", filterEvents);

 
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
  const card = document.createElement("a");
  card.href = `e/${ev.id}`;
  card.className = "tibashi-event-card tibashi-shine";
  card.innerHTML = `
    <img src="${BASE_URL}${ev.src}" alt="${ev.name}" class="tibashi-event-img">
    <h3 class="tibashi-event-name">${ev.name}</h3>
    <div class="tibashi-event-location">${ev.location}</div>
    <div class="tibashi-event-rate">
      ${ev.rate && ev.rate !== "0" ? "⭐ " + ev.rate : ""}
    </div>
  `;
  eventsContainer.appendChild(card);
});

  }

 

  
}
