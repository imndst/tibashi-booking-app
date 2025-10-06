import { fetchE } from "../../utils.js";
import { renderTimes } from "../modal/time.js";
import { renderComments } from "../modal/comments.js";
import { renderInfo } from "../modal/info.js"; // ✅ your new info module

export async function EventComponent(eventId) {
  const app = document.getElementById("app");
  app.innerHTML = "<p>در حال بارگذاری رویداد...</p>";

  try {
    // 🔹 Fetch main event data
    const eventData = await fetchE(eventId);
    if (!eventData || eventData.length === 0) {
      app.innerHTML = "<p>رویدادی یافت نشد.</p>";
      return;
    }

    const event = eventData[0];

    // 🔹 Main structure
    app.innerHTML = `
      <div class="event-container" style="max-width:600px; margin:auto;">
        <h2>${event.name}</h2>

        <div class="tabs" style="display:flex; gap:5px; margin-bottom:10px;">
          <button class="tab-btn active" data-tab="buy">خرید</button>
          <button class="tab-btn" data-tab="info">اطلاعات</button>
          <button class="tab-btn" data-tab="reviews">نظرات</button>
        </div>

        <div id="tab-content" class="tab-content" style="border:1px solid #ccc; padding:15px; border-radius:8px;">
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    `;

    const tabContent = document.getElementById("tab-content");
    const tabButtons = document.querySelectorAll(".tab-btn");

    // 🔹 Function to render each tab
    async function renderTab(tab) {
      tabContent.innerHTML = `<div class="tibashi-loader"></div>`;

      try {
        if (tab === "buy") {
          await renderTimes(event, tabContent);
        } else if (tab === "info") {
          await renderInfo(event, tabContent); // ✅ uses fetchActorDetails internally
        } else if (tab === "reviews") {
          await renderComments(event, tabContent, 1);
        }
      } catch (err) {
        console.error(`❌ Error rendering ${tab} tab:`, err);
        tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری تب ${tab}</div>`;
      }
    }

    // 🔹 Handle tab switching
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".tab-btn.active")?.classList.remove("active");
        btn.classList.add("active");
        renderTab(btn.dataset.tab);
      });
    });

    // 🔹 Default tab (خرید)
    await renderTab("buy");

  } catch (error) {
    console.error("❌ EventComponent Error:", error);
    app.innerHTML = "<p>خطا در بارگذاری اطلاعات رویداد.</p>";
  }
}
