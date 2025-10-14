import { fetchE } from "../../utils.js";
import { renderTimes } from "../modal/time.js";
import { renderComments } from "../modal/comments.js";
import { renderInfo } from "../modal/info.js"; // ✅ your new info module
import { BASE_URL } from "../../utils.js";

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
   // Inside EventComponent, replace part of app.innerHTML with this header
app.innerHTML = `
  <div class="event-container" style="max-width:1080px; margin:auto;">
    <div class="event-header" style="position: relative; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <img src="${BASE_URL}/${event.banner}" alt="${event.name}" style="width: 100%; height: 300px; object-fit: cover;">
      <div style="position: absolute; bottom: 15px; left: 15px; color: white; text-shadow: 1px 1px 5px rgba(0,0,0,0.7);">
        <h1 style="margin:0; font-size: 2rem;">${event.name}</h1>
        <p style="margin:5px 0;">
          ⭐ ${event.rate} &nbsp;&nbsp;
          <span style="background-color:#ff6f61; padding: 2px 8px; border-radius:5px;">${event.rw}</span>
        </p>
        <p style="margin:0; font-size:0.9rem;">📍 ${event.location}</p>
        <p style="margin:0; font-size:0.9rem;">🎭 ${event.gne || "—"}</p>
      </div>
    </div>

    <div class="tabs" style="display:flex; gap:5px; margin-bottom:10px;">
      <button class="tab-btn active" data-tab="buy">خرید</button>
      <button class="tab-btn" data-tab="info">اطلاعات</button>
      <button class="tab-btn" data-tab="reviews">نظرات</button>
    </div>

    <div id="tab-content" class="tab-content" style="border:1px solid #ccc; padding:15px; border-radius:8px;">
      <p>در حال بارگذاری...</p>
    </div>

    <div id="seat-map-continer" class="seat-map-continer"></div>
  </div>
`;






    const tabContent = document.getElementById("tab-content");
    const tabButtons = document.querySelectorAll(".tab-btn");

    // 🔹 Function to render each tab
    async function renderTab(tab) {
      tabContent.innerHTML = `<div class="loader loader-circle"></div>`;

      try {
        if (tab === "buy") {
          const app = document.getElementById("seat-map-continer");
          app.innerHTML = ``;
          const footer = document.querySelector("footer.footer");
          if (footer) {
            footer.style.position = "fixed"; // or "relative"
            footer.style.display= "block"; 
          }

          await renderTimes(event, tabContent);
        } else if (tab === "info") {
          const app = document.getElementById("seat-map-continer");
          app.innerHTML = ``;
          await renderInfo(event, tabContent); // ✅ uses fetchActorDetails internally
        } else if (tab === "reviews") {
          const app = document.getElementById("seat-map-continer");
          app.innerHTML = ``;
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


// ----------- SEO Enhancements -----------

    // Set page <title>
    document.title = event.name + "گیشات "|| "رویداد";

    // Meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute(
      "content",
      `رویداد ${event.name} - در گیشات  ""}`
    );

    // Open Graph image
    if (event.banner) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", event.banner);
    }

    // JSON-LD structured data
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name:event.name,
      image: `${BASE_URL}/${event.banner}: []`,
      startDate:  "",
      endDate: "",
      description: event.name+  "فروش بلیت ",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.location|| "محل برگزاری",
        address:  event.address|| "",
      },
    });
    document.head.appendChild(ldScript);



  } catch (error) {
    console.error("❌ EventComponent Error:", error);
    app.innerHTML = "<p>خطا در بارگذاری اطلاعات رویداد.</p>";
  }
}
