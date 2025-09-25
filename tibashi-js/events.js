import { openEvent } from './modal/eventModal.js'; // modal logic

let allEvents = [];
let filteredEvents = [];
let activeCategory = 'همه';

export async function initEvents() {
  const eventsContainer = document.getElementById('eventsContainer');
  const searchInput = document.getElementById('searchInput');
  const categoriesNav = document.getElementById('categoriesNav');

  // Show loading state
  eventsContainer.innerHTML = `
    <div class="tibashi-loader-wrapper">
      <div class="tibashi-loader"></div>
      <p class="tibashi-loading-text">در حال بارگذاری...</p>
    </div>
  `;

  try {
    // Fetch all events
    const res = await fetch('https://localhost:7032/api/events/Events');
    const data = await res.json();

    if (!data.status) throw new Error(data.message || "خطا در دریافت رویدادها");

    allEvents = data.result;
    setupCategories();
    filterEvents();

  } catch (err) {
    console.error(err);
    eventsContainer.innerHTML = `<div class="tibashi-error">خطا در دریافت داده‌ها</div>`;
  }

  // Search input listener
  searchInput.addEventListener('input', filterEvents);

  // Handle direct URL to event
  const pathMatch = window.location.pathname.match(/^\/e\/(\d+)$/);
  if (pathMatch) {
    const eventId = parseInt(pathMatch[1]);
    const ev = allEvents.find(e => e.id === eventId);
    if (ev) openEvent(ev);
  }

  // -------------------------
  // Category Buttons
  // -------------------------
  function setupCategories() {
    const gnes = ['همه', ...new Set(allEvents.map(e => e.gne))];
    categoriesNav.innerHTML = '';

    gnes.forEach(g => {
      const btn = document.createElement('button');
      btn.textContent = g;
      btn.className = g === 'همه' ? 'tibashi-cat-btn tibashi-cat-active' : 'tibashi-cat-btn';
      btn.onclick = () => {
        activeCategory = g;
        filterEvents();
        updateCategoryButtons();
      };
      categoriesNav.appendChild(btn);
    });
  }

  function updateCategoryButtons() {
    Array.from(categoriesNav.children).forEach(btn => {
      btn.classList.toggle('tibashi-cat-active', btn.textContent === activeCategory);
    });
  }

  // -------------------------
  // Filtering Logic
  // -------------------------
  function filterEvents() {
    const query = searchInput.value.toLowerCase();

    filteredEvents = allEvents.filter(e =>
      (activeCategory === 'همه' || e.gne === activeCategory) &&
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
    eventsContainer.innerHTML = '';

    if (!events.length) {
      eventsContainer.innerHTML = `<p class="tibashi-no-events">رویدادی یافت نشد.</p>`;
      return;
    }

    events.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'tibashi-event-card tibashi-shine';
      card.innerHTML = `
        <img src="https://gishot.ir/${ev.src}" alt="${ev.name}" class="tibashi-event-img">
        <h3 class="tibashi-event-name">${ev.name}</h3>
        <div class="tibashi-event-location">${ev.location}</div>
        <div class="tibashi-event-rate">${ev.rate && ev.rate !== '0' ? '⭐ ' + ev.rate : ''}</div>
      `;
      card.onclick = () => openEvent(ev);
      eventsContainer.appendChild(card);
    });
  }
}
