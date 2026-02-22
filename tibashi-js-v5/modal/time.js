// tibashi-js/modal/time.js
import { ENDPOINTS } from "../../utils.js";
import { deleteRecentByProgram } from "../../utils.js";
export async function renderTimes(ev, tabContent) {
  // Show loader while fetching
  tabContent.innerHTML = `
    <div class="loader loader-dots">
      <div></div><div></div><div></div>
    </div>
  `;

  // Map tags to labels
  function getOrderLabel(tag) {
    return (
      {
        101: "تمدید شد",
        102: "اجرای ویژه",
        103: "روزهای پایانی",
        104: "ساعت متفاوت",
        105: "تخفیف ویژه",
        106: "بلیت تمام شد",
        107: "تخفیف آغازین",
        999: "اجرای پایانی",
      }[tag] || ""
    );
  }

  try {
    // Fetch times
    const res = await fetch(ENDPOINTS.times(ev.id));
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "داده نامعتبر است");
    const times = data.result.times;

    // Fetch capacity
    let capMap = {};
    if (times.some((t) => t.tag !== 33 && t.tag !== 66)) {
      const capRes = await fetch(ENDPOINTS.capacity(ev.id));
      const capData = await capRes.json();
      if (capData.result) capData.result.forEach((c) => (capMap[c.sansId] = c));
    }

    // Render container
    tabContent.innerHTML = `<div class="scroll-x"></div>`;
    const scrollContainer = tabContent.querySelector(".scroll-x");

    times.forEach((s) => {
      const cap = capMap[s.id];
      const reserved = cap?.reserved ?? 0;
      const soldOut = s.tag === 106 || cap?.soldout;
      const fullness = cap?.capacity
        ? Math.round((reserved / cap.capacity) * 100)
        : 0;

      const div = document.createElement("div");
      div.className = "tibashi-sans-card";

      const buttonText = soldOut ? "بلیت تمام شد" : "خریـد";
      const buttonDisabled = soldOut ? "disabled" : "";

      // Split date/time
      let datePart = s.persian;
      let timePart = "";
      if (s.persian.includes("|")) {
        const parts = s.persian.split("|").map((t) => t.trim());
        datePart = parts[0];
        timePart = parts[1];
      }

      // Title outside button
      const titleDiv = document.createElement("div");
      titleDiv.className = "tibashi-sans-title";
      titleDiv.textContent = datePart;

      // Button with icon + time below
      const btn = document.createElement("button");
      btn.className = "tibashi-sans-btn";
      if (buttonDisabled) btn.disabled = true;
      btn.setAttribute("data-event-id", s.events);
      btn.setAttribute("data-time-id", s.id);
      btn.setAttribute("data-status", s.status);

      btn.innerHTML = `
        <img src="../tibashi-asset/icons/clock-plus-svgrepo-com.svg" alt="icon" class="tibashi-sans-btn-icon">
        ${!soldOut ? buttonText : "soldout"}
        ${timePart ? `<span class="tagtime">${timePart}</span>` : ""}
        
      `;

      // Render card
      div.appendChild(titleDiv);

      const subDiv = document.createElement("div");
      subDiv.className = "tibashi-sans-sub";
      subDiv.textContent = getOrderLabel(s.tag);
      div.appendChild(subDiv);

      const progBar = document.createElement("div");
      progBar.className = "tibashi-progress-bar";
      // progBar.innerHTML = `<div class="tibashi-progress-fill" style="width:${fullness}%"></div>`;
      progBar.innerHTML = ``;
      // div.appendChild(progBar);

      div.appendChild(btn);
      scrollContainer.appendChild(div);

      // Button click behavior
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (btn.disabled) return;

        const prevActiveBtn = scrollContainer.querySelector(
          ".tibashi-sans-btn.active"
        );
        if (prevActiveBtn) {
          prevActiveBtn.classList.remove("active");
          const prevIcon = prevActiveBtn.querySelector(
            ".tibashi-sans-btn-icon"
          );
          if (prevIcon)
            prevIcon.src = "../tibashi-asset/icons/clock-plus-svgrepo-com.svg";
        }

        btn.classList.add("active");
        const icon = btn.querySelector(".tibashi-sans-btn-icon");
        if (icon)
          icon.src = "../tibashi-asset/icons/clock-check-svgrepo-com.svg";

        const footer = document.querySelector("footer.footer");
        if (footer) {
          footer.style.position = "static";
          footer.style.display = "none"; // or "relative"
        }

        const eventId = btn.getAttribute("data-event-id");
        const timeId = btn.getAttribute("data-time-id");
        const event = { eventId, timeId };

        const status = Number(btn.getAttribute("data-status"));

        await deleteRecentByProgram(timeId);

        if (status === 3) {
          // Seatless
          const { renderSeatless } = await import("./seat/SeatMap.js");
          await renderSeatless(event, eventId);

          setTimeout(() => {
            const seatlessItem = document.querySelector(".seatless-item");
            if (seatlessItem) {
              seatlessItem.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 100);
        } else if (status === 2) {
          // With seats
          const { renderSeats } = await import("./seat/SeatMap.js");
          await renderSeats(event, eventId);
        }
      });
    });
  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری زمان‌ها</div>`;
    console.error(err);
  }
}
