import {
  fetchSeatPlan,
  fetchSeatStatus,
  submitTickets,
} from "../../../utils.js";
import { buildControls } from "./components/Controls.js";
import { showCustomerModal } from "./components/CustomerModal.js";
import showCustomAlert from "../../alert/showCustomAlert.js";
import { getSeatClass } from "../../../utils.js";
import { createCountdownTimer } from "./components/Timer.js";

// Load CSS
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "../b/custom.css";
document.head.appendChild(css);

// Selected Seats Header Style
const style = document.createElement("style");
style.innerHTML = `
.selected-seats-header {
  background: #f0f0f0;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-weight: bold;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #333;
  font-size: 14px;
}
.selected-seats-header .seat-numbers {
  color: #d9534f;
  font-weight: bold;
}
`;
document.head.appendChild(style);

// Build Seat Plan
export function buildSeatPlan(
  seatData,
  book = [],
  ipg = [],
  temp = [],
  soc = [],
  hallInfo = {}
) {
  const {
    width = 350,
    height = 30,
    pad = 0,
    aligment = 0,
    scale = 1,
    top = 0,
    left = 0,
    lat,
    area,
    time = "نامشخص",
  } = hallInfo;

  let mapWidth = 0,
    mapHeight = 320;
  if (Array.isArray(area) && area.length === 2) {
    [mapWidth, mapHeight] = area;
  }

  const seatMapStyle = `
    width:100%;
    height:${mapHeight}px;
    display:flex;
    flex-direction:column;
    gap:4px;
    direction:${aligment === 1 ? "rtl" : "ltr"};
    transform:scale(${scale});
    transform-origin: top left;
    box-sizing:border-box;
    position:relative;
  `;

  let seatMapHtml = `
    <div class="tibashi-seat-wrapper">
      <div id="selected-seats-header" class="selected-seats-header">
        <span>ساعت: ${time}</span>
        <span class="seat-numbers">-</span>
      </div>
  `;

  // --- Price Filter (descending) ---
  const uniquePrices = [
    ...new Set(
      seatData
        .map((r) => parseInt(r.row_price || 0, 10) / 10)
        .filter((p) => !isNaN(p) && p > 0)
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

  // Stage
  let stageStyle = `
    width:${width}px;
    height:${height}px;
    background:#333;
    color:#fff;
    display:flex;
    justify-content:center;
    align-items:center;
    font-weight:bold;
  `;
  stageStyle +=
    lat === "absolute"
      ? `position:absolute; top:${top}px; left:${left}px;`
      : `margin-top:${top}px; margin-left:${left}px;`;

  seatMapHtml += `<div id="seat-map" class="tibashi-seat-map" style="${seatMapStyle}">`;
  seatMapHtml += `<div class="Stage" style="${stageStyle}">صحنه</div>`;

  let globalSeatId = 0;

  // --- Seats ---
  seatData.forEach((row, rowIndex) => {
    const seatCount = parseInt(row.seat_in_rows || 0, 10);
    const isIncr = Number(row.is_incr || 0) === 1;
    const incrStart = Number.isFinite(parseInt(row.incr_first_seat))
      ? parseInt(row.incr_first_seat)
      : 1;

    const styleParts = [
      `position:${row.row_possition || "relative"}`,
      row.top_in_abs ? `top:${row.top_in_abs}px` : "",
      row.left_in_abs ? `left:${row.left_in_abs}px` : "",
      row.row_top_margin ? `margin-top:${row.row_top_margin}px` : "",
      row.row_lef_margin ? `margin-left:${row.row_lef_margin}px` : "",
      row.transform_rows ? `transform:rotate(${row.transform_rows}deg)` : "",
      `direction:${row.seat_align === "RTL" ? "RTL" : "unset"}`,
    ].filter(Boolean);
    const style = styleParts.join("; ");

    const rowTitle = row.row_title?.trim() || rowIndex + 1;
    seatMapHtml += `
      <div class="RowContainer" 
           data-idrow="${rowIndex}" 
           data-price="${parseInt(row.row_price || 0, 10) / 10}" 
           style="${style};display:flex;align-items:center;gap:4px;flex-wrap:nowrap;">
        <div class="RowHeader">${rowTitle}</div>
    `;

    const startSeatNumber = isIncr && incrStart !== null ? incrStart : 1;

    for (let i = 0; i < seatCount; i++) {
      for (let j = 1; j <= 6; j++) {
        const blankIndex = row[`blank_after_${j}`];
        if (
          blankIndex !== null &&
          blankIndex !== undefined &&
          i === Number(blankIndex) + 1
        ) {
          const width = row[`width_space_${j}`] ?? 10;
          seatMapHtml += `<div class="BlankSpace" style="width:${width}px;min-width:${width}px;"></div>`;
        }
      }

      globalSeatId++;
      const seatNumber = startSeatNumber + i;
      const price = parseInt(row.row_price || 0, 10) / 10;
      const seatClass = getSeatClass(globalSeatId, { book, temp, ipg, soc });

      seatMapHtml += `
        <div class="Seat ${seatClass}" 
             data-seat="${globalSeatId}" 
             data-row="${rowTitle}" 
             data-price="${price}">
             ${seatNumber}
        </div>`;
    }

    seatMapHtml += `<div class="RowEndHeader">${rowTitle}</div></div>`;
  });

  seatMapHtml += `</div></div>`;

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
  }, 0);

  return seatMapHtml;
}
let seatSelectionTimer = null; // در بالای ماژول
// --- Render Seats ---
export async function renderSeats({ timeId }) {
  if (seatSelectionTimer) {
    seatSelectionTimer.stop();
    seatSelectionTimer = null;
  }

  const app = document.getElementById("seat-map-continer");
  app.innerHTML = `
    <div class="loader loader-dots"><div></div><div></div><div></div></div>
  `;

  try {
    const [seatStatusData, seatPlanData] = await Promise.all([
      fetchSeatStatus(timeId),
      fetchSeatPlan(timeId),
    ]);

    const programId = seatStatusData?.result?.hallInfo?.event_id;
    const hallInfo = seatStatusData?.result?.hallInfo;
    if (!seatPlanData?.result || !programId)
      throw new Error("اطلاعات صندلی‌ها یافت نشد");
    const { book = [], ipg = [], temp = [], soc = [] } = seatStatusData.result;
    const allSeats = [...book, ...ipg, ...soc, ...temp];
    console.log("All combined seat IDs:", allSeats);

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

    const seatMapElement = document.getElementById("seat-map");
    if (seatMapElement) {
      seatMapElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const payBtn = document.getElementById("btn-pay");
    const totalEl = document.getElementById("total-price");
    const selectedSeatsHeader = document.querySelector(".seat-numbers");

    let selectedSeats = [];

    // Seat click
    seatMapElement.addEventListener("click", (e) => {
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
      } بلیت - ${total.toLocaleString()} تومان`;
      selectedSeatsHeader.textContent =
        selectedSeats.map((s) => s.seatNumber).join(", ") || "-";
    });

    seatSelectionTimer = createCountdownTimer(
      120,
      (remaining) => console.log("زمان باقی‌مانده:", remaining),
      () => location.reload()
    );
    seatSelectionTimer.start();

    // Pay button
    payBtn.addEventListener("click", () => {
      if (selectedSeats.length === 0)
        return showCustomAlert("لطفا حداقل یک صندلی انتخاب کنید");
      if (selectedSeats.length > 9)
        return showCustomAlert("حداکثر 9 صندلی در هر خرید");
      const remainingTime = seatSelectionTimer.getRemaining();
      showCustomerModal(
        hallInfo,
        selectedSeats,
        async ({ name, phone, discountCode }) => {
          app.innerHTML = `<div class="loader loader-dots"><div></div><div></div><div></div></div>`;

          const payload = {
            ProgramId: programId.toString(),
            ProgramSing: programId.toString(),
            pval: timeId.toString(),
            Phone: phone,
            CustomerName: name,
            ProgramDate: timeId.toString(),
            ProgramTimeID: timeId.toString(),
            discountCode: discountCode,
            Seats: selectedSeats.map(({ seatNumber, row, price }) => ({
              SeatId: seatNumber.toString(),
              RowNumber: row.toString(),
              Number: seatNumber.toString(),
              price: price,
            })),
          };

          try {
            const result = await submitTickets(payload);
            if (!result?.status)
              throw new Error(result?.message || "خطا در ثبت بلیط");
            const token = result?.result?.mtoken;
            if (!token) throw new Error("توکن پرداخت دریافت نشد");

            showCustomAlert(
              "در حال اتصال به درگاه بانکی لطفا فیلتر شکن خود را خاموش کنید"
            );
            window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
          } catch (err) {
            console.error("خطا در ارسال اطلاعات به سرور");
            location.reload();
          }
        },
        remainingTime
      );
    });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="tibashi-error">❌ خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}
