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
import { deleteTempSeats } from "../../../utils.js";
// Load CSS
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "../b/custom.css";
document.head.appendChild(css);

// Selected Seats Header Style
const style = document.createElement("style");

document.head.appendChild(style);

// Build Seat Plan
let globalSeatNumberMap = [];
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

  const seatMapStyle = `
    width:100%;
    direction:${aligment === 1 ? "rtl" : "ltr"};
    transform:scale(${scale});
    min-height:${mapHeight}px
  `;

  let seatMapHtml = `
    <div class="tibashi-seat-wrapper">
      <div id="selected-seats-header" class="selected-seats-header">
        <span>${persianDate}-${persianTime}</span>
       
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
  // Normalize width/height
  let Formatedwidth = parseInt(width, 10);
  let Formatedheight = parseInt(height, 10);

  // Fallback width = 350px if width invalid
  let stageStyle = `
  width:${isNaN(Formatedwidth) ? "300px" : Formatedwidth + "px"};
  height:${isNaN(Formatedheight) ? "unset" : Formatedheight + "px"};
`;

  // Helper to format top/left
  function formatPx(value) {
    const num = parseInt(value, 10);
    return isNaN(num) ? null : `${num}px`; // null if invalid
  }

  // Apply positioning
  const topVal = formatPx(top);
  const leftVal = formatPx(left);

  if (lat === "absolute") {
    stageStyle +=
      topVal && leftVal
        ? `position:absolute; top:${topVal}; left:${leftVal};`
        : `margin: 0 auto;`; // center if invalid
  } else {
    stageStyle +=
      topVal && leftVal
        ? `margin-top:${topVal}; margin-left:${leftVal};`
        : `margin: 18px auto;`; // center if invalid
  }

  // Build HTML
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
      row.row_possition ? `position:${row.row_possition}` : "",
      row.top_in_abs != null ? `top:${row.top_in_abs}px` : "",
      row.left_in_abs != null
        ? aligment === 1
          ? `right:${row.left_in_abs}px`
          : `left:${row.left_in_abs}px`
        : "",
      row.row_top_margin != null ? `margin-top:${row.row_top_margin}px` : "",
      row.row_lef_margin != null ? `margin-left:${row.row_lef_margin}px` : "",
      row.transform_rows != null
        ? `transform:rotate(${row.transform_rows}deg)`
        : "",
      (width || pad) != null
        ? row.row_possition
          ? null
          : `width:${pad || width}px`
        : null,
      row.seat_align === "RTL" ? `direction:RTL` : null,
    ].filter((part) => part && !part.includes("unset")); // remove empty or unset

    const style = styleParts.join("; ");

    const rowTitle = row.row_title?.trim() || rowIndex + 1;
    seatMapHtml += `
      <div class="RowContainer" data-idrow="${rowIndex}"  data-price="${
      parseInt(row.row_price || 0, 10) / 10
    }" 
           style="${style}">
        <span class="RowHeader">${rowTitle}</span>
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
          seatMapHtml += `<span class="BlankSpace" style="width:${width}px;min-width:${width}px;"></span>`;
          globalSeatNumberMap.push(globalSeatId);
        }
      }

      globalSeatId++;
      const seatNumber = startSeatNumber + i;
      const price = parseInt(row.row_price || 0, 10) / 10;
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
      // selectedSeatsHeader.textContent =
      //   selectedSeats.map((s) => s.seatNumber).join(", ") || "-";
    });

    seatSelectionTimer = createCountdownTimer(
      120,
      (remaining) => remaining,
      () => location.reload()
    );
    seatSelectionTimer.start();

    payBtn.addEventListener("click", () => {
      if (selectedSeats.length === 0)
        return showCustomAlert("حداقل یک صندلی انتخاب کنید");

      if (selectedSeats.length > 10)
        return showCustomAlert("سقف خرید بلیت در هر انتخاب 10 بلیت است");

      // Check for problematic seat arrangement
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

      if (hasExactSeat) {
        return showCustomAlert(
          " درانتخاب های خود دقت کنید صندلی تک ایجاد نشود"
        );
      }

      // Proceed if all validations pass
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
            await deleteTempSeats();
            const TiketResult = await submitTickets(payload);
            if (!TiketResult?.status) showCustomAlert("لطفا مجدد امتحان کنید");

            const token = TiketResult?.result?.mtoken;
            if (!token) throw new Error("توکن پرداخت دریافت نشد");
            showCustomAlert(
              "در حال اتصال به درگاه بانکی لطفا فیلتر شکن خود را خاموش کنید"
            );
            window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
          } catch (err) {
            console.error("یکی از صندلی ها انتخابی شما قابل رزرو نیست");
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
