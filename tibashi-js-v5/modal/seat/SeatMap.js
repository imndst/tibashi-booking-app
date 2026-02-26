import {
  fetchSeatPlan,
  fetchSeatStatus,
  submitTickets,
  buildSeatless,
  submitTicketsSeatLess,
} from "../../../utils.js";
import { buildControls } from "./components/Controls.js";
import { showCustomerModal } from "./components/CustomerModal.js";
import { showCustomerModalLess } from "./components/CustomerModaLess.js";

import showCustomAlert from "../../alert/showCustomAlert.js";
import { getSeatClass, updateSeatClasses } from "../../../utils.js";
import { createCountdownTimer } from "./components/Timer.js";
import { deleteTempSeats } from "../../../utils.js";
import "../../../tibashi-asset/panzoom.min.js";

let globalSeatNumberMap = [];
let seatSelectionTimer = null;

export function buildSeatPlan(
  seatData,
  book = [],
  ipg = [],
  temp = [],
  soc = [],
  hallInfo = {}
) {
  // Destructure hallInfo with defaults
  const {
    width = 350,
    height = 30,
    pad = 0,
    aligment = 0,
    top = 0,
    left = 0,
    lat,
    area,
    time = "نامشخص",
  } = hallInfo;

  // --- Parse hall area safely ---
  let marea = area ?? {};
  if (typeof marea === "string") {
    try {
      marea = JSON.parse(marea);
    } catch (err) {
      console.error("Invalid area format:", area);
      marea = {};
    }
  }

  // --- Extract map and stage info with defaults ---
  const mapWidth = Number(marea?.["plan-width"] ?? 650);
  const mapHeight = Number(marea?.["plan-height"] ?? 450);
  const scale = Number(marea?.["plan-scale"] ?? 1);
  const rowWidth = Number(marea?.["row-width"] ?? mapWidth);
  const stageWidth = Number(marea?.["stage-width"] ?? "auto");
  const stageHeight = Number(marea?.["stage-height"] ?? 32);
  const stageTop = marea?.["stage-top"] ?? 0;
  const stageLeft = marea?.["stage-left"] ?? "unset";
  const stageRight = marea?.["stage-right"] ?? "unset";
  let stagePosition = marea?.["stage-position"];
  if (typeof stagePosition === "string") {
    stagePosition = { type: stagePosition };
  }
  stagePosition = stagePosition ?? { type: "relative" };

  // --- Format date/time ---
  const dateObj = new Date(time);
  const persianDate = dateObj.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const persianTime = dateObj.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // --- Seat map container style ---
  const seatMapStyle = `
    direction:${aligment === 1 ? "rtl" : "ltr"};
    min-height:${mapHeight}px;
    width:${mapWidth}px;

   
    overflow:hidden;
    position:relative;
    touch-action:none;
   
  `;

  let seatMapHtml = `
    <div class="tibashi-seat-wrapper">
      <div id="selected-seats-header" class="selected-seats-header">
        <span>${persianDate}-${persianTime}</span>
      </div>
  `;

  // --- Price Filter ---
  const uniquePrices = [
    ...new Set(
      seatData
        .map((r) => Math.floor(parseInt(r.row_price || 0, 10) / 10))
        .filter((p) => p > 0)
    ),
  ].sort((a, b) => b - a);

  if (uniquePrices.length > 0) {
    seatMapHtml += `
      <div class="tibashi-price-filter" style="display:flex;gap:6px;justify-content:center;margin-bottom:10px;">
        <button class="price-filter-btn tibashi-filter-active" data-price="all">همه</button>
        ${uniquePrices
          .map(
            (price) =>
              `<button class="price-filter-btn" data-price="${price}">${price.toLocaleString()} تومان</button>`
          )
          .join("")}
      </div>
    `;
  }

  function formatPx(value) {
    const num = parseInt(value, 10);
    return isNaN(num) ? null : `${num}px`;
  }

  const topVal = formatPx(top);
  const leftVal = formatPx(left);
  const containerWidth = mapWidth ?? 600;

  // --- Stage setup ---
  let stageStyle = "";
  const effectiveStageWidth = stageWidth ?? 600;
  const effectiveStageHeight = stageHeight ?? 18;

  if (stagePosition?.type === "absolute") {
    let topPos = stageTop ?? 0;
    let leftPos = aligment === 1 ? stageLeft : "unset";
    let rightPos = aligment !== 1 ? stageRight : "unset";

    // Ensure px suffix for numeric values
    const topCss = typeof topPos === "number" ? `${topPos}px` : topPos;
    const leftCss = typeof leftPos === "number" ? `${leftPos}px` : leftPos;
    const rightCss = typeof rightPos === "number" ? `${rightPos}px` : rightPos;

    stageStyle = `
  position: absolute;
  top: ${topCss};
  left: ${leftCss};
  right: ${rightCss};
  width: ${effectiveStageWidth}px;
  height: ${effectiveStageHeight}px;
 
`;
  } else {
    stageStyle = `
      position: relative;
      width: ${effectiveStageWidth}px;
      height: ${effectiveStageHeight}px;
      margin-left:22px;
    `;
  }

  // --- Seat Map HTML with Stage ---
  seatMapHtml += `
    <div id="seat-map" class="tibashi-seat-map" style="${seatMapStyle}">
      <div id="seat-map-inner">
        <div class="StageContainer" style="${stageStyle}">
          <div class="Stage" style="margin-left:18px; width: ${
            effectiveStageWidth - 300
          }, height: ${effectiveStageHeight}px;">صحنه</div>
        </div>
  `;

  let globalSeatId = 0;

  // --- Seats ---
  seatData.forEach((row, rowIndex) => {
    const seatCount = parseInt(row.seat_in_rows || 0, 10);
    const isIncr = Number(row.is_incr || 0) === 1;
    const incrStart = Number.isFinite(parseInt(row.incr_first_seat))
      ? parseInt(row.incr_first_seat)
      : 1;

    const styleParts = [
      row.row_possition ? `position:${row.row_possition}` : "unset",
      row.top_in_abs != null ? `top:${row.top_in_abs}px` : "unset",
      row.left_in_abs != null
        ? aligment === 1
          ? `right:${row.left_in_abs}px`
          : `left:${row.left_in_abs}px`
        : "",
      row.row_top_margin != null ? `margin-top:${row.row_top_margin}px` : "",
      row.row_lef_margin != null ? `margin-left:${row.row_lef_margin}px` : "",
      row.row_right_matgin != null
        ? `margin-right:${row.row_right_matgin}px`
        : "",
      row.transform_rows != null
        ? `transform:rotate(${row.transform_rows}deg)`
        : "",
      row.row_possition
        ? "width:unset"
        : rowWidth
        ? `width:${rowWidth}px`
        : `width:${mapWidth}px`,

      row.row_height ? `height:${row.row_height}px` : `height:unset`,
      row.seat_align === "RTL" ? `direction:RTL` : null,
    ].filter((part) => part && !part.includes("unset"));

    const style = styleParts.join("; ");
    const rowTitle = row.row_title?.trim() || rowIndex + 1;

    seatMapHtml += `
      <div class="RowContainer" 
           data-idrow="${rowIndex}" 
           data-price="${Math.floor(parseInt(row.row_price || 0, 10) / 10)}" 
           style="${style}">
        <span class="RowHeader">${rowTitle}</span>
    `;

    const startSeatNumber = isIncr && incrStart !== null ? incrStart : 1;

    for (let i = 0; i < seatCount; i++) {
      for (let j = 1; j <= 6; j++) {
        const blankIndex = row[`blank_after_${j}`];
        if (blankIndex != null && i === Number(blankIndex) + 1) {
          const width = row[`width_space_${j}`] ?? 10;
          seatMapHtml += `<span class="BlankSpace" style="width:${width}px;min-width:${width}px;"></span>`;
        }
      }

      globalSeatId++;
      const seatNumber = startSeatNumber + i;
      const price = Math.floor(parseInt(row.row_price || 0, 10) / 10);
      const seatClass = getSeatClass(globalSeatId, { book, temp, ipg, soc });

      seatMapHtml += `
        <span class="Seat ${seatClass}" 
              data-seat="${globalSeatId}" 
              data-row="${rowTitle}" 
              data-price="${price}">
              ${seatNumber}
        </span>`;
    }

    seatMapHtml += `<span class="RowEndHeader">${rowTitle}</span></div>`;
  });

  seatMapHtml += `</div></div></div>`;

  // --- Price filter & panzoom setup ---
  setTimeout(() => {
    const filterButtons = document.querySelectorAll(".price-filter-btn");
    const allRows = document.querySelectorAll(".RowContainer");

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) =>
          b.classList.remove("tibashi-filter-active")
        );
        btn.classList.add("tibashi-filter-active");

        const selectedPrice = btn.dataset.price;
        allRows.forEach((row) => {
          const rowPrice = row.dataset.price;
          row.classList.toggle(
            "SeatDisabled",
            selectedPrice !== "all" && rowPrice != selectedPrice
          );
        });

        if (selectedPrice !== "all") {
          const targetRow = Array.from(allRows).find(
            (r) => r.dataset.price == selectedPrice
          );
          if (targetRow) {
            targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    });

    const seatContainer = document.querySelector("#seat-map-inner");
    if (!seatContainer) return;

    const panZoomInstance = window.panzoom(seatContainer, {
      maxZoom: 3,
      minZoom: 0.3,
      zoomSpeed: 0.085,
      smoothScroll: true,
      bounds: false,
      boundsPadding: 0.2,
    });

    panZoomInstance.moveTo(0, 0);
    panZoomInstance.zoomAbs(0, 0, scale || 1);

    const zoomControls = document.createElement("div");
    zoomControls.className = "zoom-controls";
    zoomControls.innerHTML = `
      <button class="zoom-btn zoom-in">+</button>
      <button class="zoom-btn zoom-out">−</button>
      <button class="zoom-btn zoom-reset">↺</button>
    `;
    zoomControls.addEventListener("mousedown", (e) => e.stopPropagation());
    zoomControls.addEventListener("wheel", (e) => e.stopPropagation());
    zoomControls.addEventListener("dblclick", (e) => e.stopPropagation());
    zoomControls.addEventListener("touchstart", (e) => e.stopPropagation());

    const seatMap = document.querySelector("#seat-map");
    seatMap.appendChild(zoomControls);

    const zoomStep = 0.2;
    zoomControls.querySelector(".zoom-in").addEventListener("click", () => {
      panZoomInstance.smoothZoom(
        seatContainer.clientWidth / 2,
        seatContainer.clientHeight / 2,
        1 + zoomStep
      );
    });
    zoomControls.querySelector(".zoom-out").addEventListener("click", () => {
      panZoomInstance.smoothZoom(
        seatContainer.clientWidth / 2,
        seatContainer.clientHeight / 2,
        1 - zoomStep
      );
    });
    zoomControls.querySelector(".zoom-reset").addEventListener("click", () => {
      panZoomInstance.moveTo(0, 0);
      panZoomInstance.zoomAbs(0, 0, scale || 1);
    });
  }, 200);

  return seatMapHtml;
}

// --- Render Seats ---
export async function renderSeats({ timeId }) {
  if (seatSelectionTimer) {
    seatSelectionTimer.stop();
    seatSelectionTimer = null;
  }

  const app = document.getElementById("seat-map-continer");
  app.innerHTML = `<div class="loader loader-dots"><div></div><div></div><div></div></div>`;
  await deleteTempSeats();

  try {
    const [seatStatusData, seatPlanData] = await Promise.all([
      fetchSeatStatus(timeId),
      fetchSeatPlan(timeId),
    ]);

    const programId = seatStatusData?.result?.hallInfo?.event_id;
    const hallInfo = seatStatusData?.result?.hallInfo;
    if (!seatPlanData?.result || !programId)
      throw new Error("اطلاعات صندلی‌ها یافت نشد");

    app.innerHTML = `
      ${buildSeatPlan(
        seatPlanData.result,
        seatStatusData.result?.book,
        seatStatusData.result?.ipg,
        seatStatusData.result?.temp,
        seatStatusData.result?.soc,
        hallInfo
      )}
      ${buildControls()}
    `;

    const seatMapElementSc = document.getElementById("tab-content");
    const seatMapElement = document.getElementById("seat-map");
    if (seatMapElement)
      seatMapElementSc.scrollIntoView({ behavior: "smooth", block: "start" });

    const payBtn = document.getElementById("btn-pay");
    const totalEl = document.getElementById("total-price");
    let selectedSeats = [];

    // --- MOBILE + DESKTOP FRIENDLY SEAT SELECTION ---
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    const dragThreshold = 5;

    seatMapElement.addEventListener("pointerdown", (e) => {
      startX = e.clientX || e.touches?.[0]?.clientX;
      startY = e.clientY || e.touches?.[0]?.clientY;
      isDragging = false;
    });

    seatMapElement.addEventListener("pointermove", (e) => {
      const x = e.clientX || e.touches?.[0]?.clientX;
      const y = e.clientY || e.touches?.[0]?.clientY;
      if (!x || !y) return;

      const dx = Math.abs(x - startX);
      const dy = Math.abs(y - startY);
      if (dx > dragThreshold || dy > dragThreshold) isDragging = true;
    });

    seatMapElement.addEventListener("pointerup", (e) => {
      if (isDragging) return;

      const seat = e.target.closest(".Seat");
      if (!seat || seat.classList.contains("booked")) return;

      const seatNumber = seat.dataset.seat;
      const price = Number(seat.dataset.price || 10000);
      const row = seat.dataset.row;

      const idx = selectedSeats.findIndex((s) => s.seatNumber === seatNumber);
      if (idx >= 0) {
        selectedSeats.splice(idx, 1);
        seat.classList.remove("selected");
      } else {
        selectedSeats.push({ seatNumber, row, price });
        seat.classList.add("selected");
      }

      const total = selectedSeats.reduce((s, x) => s + x.price, 0);
      totalEl.textContent = `${
        selectedSeats.length
      } بلیت - ${total.toLocaleString()}`;
    });

    seatSelectionTimer = createCountdownTimer(
      120,
      (remaining) => remaining,
      () => location.reload()
    );
    seatSelectionTimer.start();

    // ---- LIVE STATUS REFRESH ----
    // setInterval(async () => {
    //   try {
    //     const freshStatus = await fetchSeatStatus(timeId);
    //     updateSeatClasses(freshStatus);
    //   } catch (e) {
    //     console.warn("Seat status refresh failed:", e);
    //   }
    // }, 4000); // refresh every 4 seconds

    payBtn.addEventListener("click", () => {
      if (selectedSeats.length === 0)
        return showCustomAlert("حداقل یک صندلی انتخاب کنید");
      if (selectedSeats.length > 10)
        return showCustomAlert("سقف خرید 10 بلیت است");

      // جلوگیری از صندلی تکی
      const seatNumbers = selectedSeats.map((seat) => String(seat.seatNumber));
      const hasExactSeat = seatNumbers.some((seatNum) => {
        const seatEl = document.querySelector(`[data-seat="${seatNum}"]`);
        if (!seatEl) return false;

        const next = seatEl.nextElementSibling;
        const prev = seatEl.previousElementSibling;
        const nextNext = next?.nextElementSibling;
        const prevPrev = prev?.previousElementSibling;

        const isNextSeat = next?.className?.trim() === "Seat";
        const isPrevSeat = prev?.className?.trim() === "Seat";
        const isNextNextNotSeat = nextNext?.className?.trim() !== "Seat";
        const isPrevPrevNotSeat = prevPrev?.className?.trim() !== "Seat";

        return (
          (isNextSeat && isNextNextNotSeat) || (isPrevSeat && isPrevPrevNotSeat)
        );
      });

      if (hasExactSeat)
        return showCustomAlert(
          "در انتخاب های خود دقت کنید صندلی تک ایجاد نشود"
        );

      const remainingTime = seatSelectionTimer.getRemaining();

      showCustomerModal(
        hallInfo,
        selectedSeats,
        async (submitPayload) => {
          if (submitPayload.paymentMethod === "online") {
            let TiketResult;

            try {
              // 1) Call submitTickets
              TiketResult = await submitTickets(submitPayload);
            } catch (err) {
              // submitTickets crashed
              const freshStatus = await fetchSeatStatus(timeId);
              updateSeatClasses(freshStatus);
              return showCustomAlert(
                "خطای ارتباط با سرور. لطفاً دوباره امتحان کنید"
              );
            }

            // 2) If submitTickets returns status = false
            if (!TiketResult?.status) {
              deleteTempSeats();
              const freshStatus = await fetchSeatStatus(timeId);
              updateSeatClasses(freshStatus);
              return showCustomAlert(
                TiketResult?.message || "لطفاً دوباره امتحان کنید"
              );
            }

            // 3) Check for missing token
            const token = TiketResult?.result?.mtoken;
            if (!token) {
              const freshStatus = await fetchSeatStatus(timeId);
              updateSeatClasses(freshStatus);
              return showCustomAlert("توکن پرداخت دریافت نشد");
            }

            // 4) Success → redirect
            showCustomAlert("در حال اتصال به درگاه...");
            window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
          }
        },
        remainingTime,
        timeId,
        updateSeatClasses
      );
    });



  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="tibashi-error">❌ خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}

export async function renderSeatless({ timeId }) {
  const app = document.getElementById("seat-map-continer");
  app.innerHTML = `<div class="loader loader-dots"><div></div><div></div><div></div></div>`;

  const token = localStorage.getItem("jwt_token");

  // 🚫 Not authorized → show modal and stop
  if (!token) {
    const currentPath = window.location.pathname + window.location.search;
    const baseUrl = `${window.location.origin}/account`;
    const redirectUrl = `${baseUrl}?returnUrl=${encodeURIComponent(
      currentPath
    )}`;

    showCustomAlert(
      `
    <div class="tibashi-error" style="text-align:center;">
      برای ادامه خرید ابتدا باید وارد سیستم شوید<br/>
      <a href="${redirectUrl}" 
         style="
           display: inline-block;
           background-color: #007BFF;
           color: white !important;
           text-decoration: none;
           font-weight: bold;
           padding: 8px 16px;
           border-radius: 8px;
           margin-top: 10px;
         "
         class="tibashi-login-link">
        ورود / ثبت‌نام
      </a>
    </div>
    `,
      { showCloseIcon: false }
    );

    return; // ⛔ stop execution
  }

  try {
    const token = localStorage.getItem("jwt_token");
    const seatlessData = await buildSeatless(timeId, token);

    if (!seatlessData || seatlessData.length === 0) {
     if (true) {
      const currentPath = window.location.pathname + window.location.search; // e.g., /e/161004
      const baseUrl = `${window.location.origin}/account`;
      const redirectUrl = `${baseUrl}?returnUrl=${encodeURIComponent(
        currentPath
      )}`;

      showCustomAlert(
        `
  <div class="tibashi-error" style="text-align:center;">
    برای ادامه خرید ابتدا باید وارد سیستم شوید<br/>
    <a href="${redirectUrl}" 
       style="
         display: inline-block;
         background-color: #007BFF; /* blue background */
         color: white !important; 
         text-decoration: none; 
         font-weight: bold;
         padding: 8px 16px; /* some padding */
         border-radius: 8px; /* rounded corners */
         margin-top: 10px;
       "
       class="tibashi-login-link">
      ورود / ثبت‌نام
    </a>
  </div>
`,
        {
          showCloseIcon: false,
        }
      );
      return;
    }
    }

    // ✅ Secure max total limit
    const MAX_TOTAL =
     9;

    const selectedCounts = new Array(seatlessData.length).fill(0);

    // --- Build HTML (capacity UI REMOVED) ---
   const html = seatlessData
  .map((item, index) => {

    console.log(item)
    const bg = item.bgColor || item.bgcolor || item.bg_color || "#f5f5f5";
    const status = (item.status || "normal").toLowerCase();

    const isFinished = status === "finish";
    const isFree = status === "free";

    return `
      <div class="seatless-item ${isFinished ? "disabled" : ""}" 
           data-mid="${item.mid}" 
           data-sns="${item.sansId}"
           data-plc="${item.id}"
           data-status="${status}"
           style="background-color:${bg}; opacity:${isFinished ? 0.6 : 1};font-family:'var(--font-family);'">

        

        <div class="seatless-name">${item.name}</div>

        ${
          isFinished
            ? `<div style="color:red;font-weight:bold;"><br/>ظرفیت تکمیل</div>`
            : `<div class="seatless-price">${Number(item.price).toLocaleString()}تومان</div>`
        }

        <div class="seatless-quantity">
          <button class="decrease" data-index="${index}" ${
      isFinished ? "disabled" : ""
    }>−</button>
          <span class="seat-quantity" data-index="${index}">0</span>
          <button class="increase" data-index="${index}" ${
      isFinished ? "disabled" : ""
    }>+</button>
        </div>

      </div>
    `;
  })
  .join("");


    app.innerHTML = `
      <div class="seatless-wrapper" style="display:flex; flex-wrap:wrap; justify-content:center;">
        ${html}
      </div>
      ${buildControls()}
    `;

    const totalEl = document.getElementById("total-price");
    const payBtn = document.getElementById("btn-pay");

    function getTotalSelected() {
      return selectedCounts.reduce((a, b) => a + b, 0);
    }

    function updateTotal() {
      let totalTickets = 0;
      let totalPrice = 0;

      selectedCounts.forEach((count, i) => {
        const span = app.querySelector(`.seat-quantity[data-index="${i}"]`);
        if (span) span.textContent = count;

        totalTickets += count;
        totalPrice += count * Number(seatlessData[i].price || 0);
      });

      if (totalEl) {
        totalEl.textContent = `${totalTickets} بلیت - ${totalPrice.toLocaleString()}تومان`;
      }
    }

    // ➕ Increase (capacity check REMOVED)
  app.querySelectorAll(".increase").forEach((btn) => {
  btn.addEventListener("click", () => {
    const index = +btn.dataset.index;
    const item = seatlessData[index];

    if ((item.status || "").toLowerCase() === "finish") {
      return;
    }

    const total = getTotalSelected();
    if (total >= MAX_TOTAL) {
      return showCustomAlert(`حداکثر ${MAX_TOTAL} بلیت مجاز است`);
    }

    selectedCounts[index]++;
    updateTotal();
  });
});


    // ➖ Decrease
    app.querySelectorAll(".decrease").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = +btn.dataset.index;
        if (selectedCounts[index] <= 0) return;

        selectedCounts[index]--;
        updateTotal();
      });
    });

    // ✅ Payment
    payBtn.addEventListener("click", async () => {
      const ticketsToSubmit = [];
      let hasFreeStatus = false;
      selectedCounts.forEach((count, index) => {
        const item = seatlessData[index];
        if ((item.status || "").toLowerCase() === "free" && count > 0) {
          hasFreeStatus = true;
        }
        for (let i = 0; i < count; i++) {
          ticketsToSubmit.push({
            ticketId: item.id,
            mid: item.mid,
            sansId: item.sansId,
            price: item.price,
          });
        }
      });

      if (ticketsToSubmit.length === 0)
        return showCustomAlert("حداقل یک بلیت انتخاب کنید");

      

      showCustomerModalLess(
         {
      eventId: timeId,
      free: hasFreeStatus, // ✅ NEW
    },
        ticketsToSubmit,
        async (submitPayload) => {
          if (submitPayload.paymentMethod === "online") {
            let result;
            try {
              result = await submitTicketsSeatLess(submitPayload);
            } catch {
              return showCustomAlert("خطای ارتباط با سرور");
            }

            if (!result?.status)
              return showCustomAlert(result?.message || "خطا در ثبت");

            const token = result?.result?.mtoken;
            if (!token) return showCustomAlert("توکن پرداخت دریافت نشد");

            showCustomAlert("در حال انتقال به درگاه...");
            window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
          }
        },
        120
      );
    });
  } catch (err) {
    // Check if it's Unauthorized
    if (err.message) {
      const currentPath = window.location.pathname + window.location.search; // e.g., /e/161004
      const baseUrl = `${window.location.origin}/account`;
      const redirectUrl = `${baseUrl}?returnUrl=${encodeURIComponent(
        currentPath
      )}`;

      showCustomAlert(
        `
  <div class="tibashi-error" style="text-align:center;">
    برای ادامه خرید ابتدا باید وارد سیستم شوید<br/>
    <a href="${redirectUrl}" 
       style="
         display: inline-block;
         background-color: #007BFF; /* blue background */
         color: white !important; 
         text-decoration: none; 
         font-weight: bold;
         padding: 8px 16px; /* some padding */
         border-radius: 8px; /* rounded corners */
         margin-top: 10px;
       "
       class="tibashi-login-link">
      ورود / ثبت‌نام
    </a>
  </div>
`,
        {
          showCloseIcon: false,
        }
      );
      return;
    }
  }
}
