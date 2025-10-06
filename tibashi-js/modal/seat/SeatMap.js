import { fetchSeatPlan, fetchSeatStatus, submitTickets } from '../../../utils.js'
import { buildControls } from "./components/Controls.js";
import { showCustomerModal } from "./components/CustomerModal.js";
import { getSeatClass } from '../../../utils.js';
// const css = document.createElement("link");
// css.rel = "stylesheet";
// css.href = "./custom.css";
// document.head.appendChild(css);


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
    aligment = "rtl",
    scale = 1,
    top = 0,
    left = 0,
    lat,
    area = [400, 200],
  } = hallInfo;

  const [mapWidth, mapHeight] = area;

  const seatMapStyle = `
    width:${mapWidth}px;
    height:${mapHeight}px;
    padding:${pad}px;
    display:flex;
    flex-direction:column;
    gap:4px;
    direction:${aligment};
    transform:scale(${scale});
    transform-origin: top left;
    box-sizing:border-box;
    position:relative;
  `;

  let seatMapHtml = `<div class="tibashi-seat-wrapper">`;

  // --- 🎫 Build Price Filter Toolbar ---
  const uniquePrices = [
    ...new Set(
      seatData
        .map((r) => parseInt(r.row_price || 0, 10))
        .filter((p) => !isNaN(p) && p > 0)
    ),
  ].sort((a, b) => a - b);

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

  // --- Stage ---
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

  if (lat === "absolute") {
    stageStyle += `position:absolute; top:${top}px; left:${left}px;`;
  } else {
    stageStyle += `margin-top:${top}px; margin-left:${left}px;`;
  }

  seatMapHtml += `<div id="seat-map" class="tibashi-seat-map" style="${seatMapStyle}">`;
  seatMapHtml += `<div class="Stage" style="${stageStyle}">صحنه</div>`;

  let globalSeatId = 0;

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
      `direction:${row.seat_align || "rtl"}`,
    ].filter(Boolean);
    const style = styleParts.join("; ");

    const rowTitle = row.row_title?.trim() || rowIndex + 1;
    seatMapHtml += `
      <div class="RowContainer" 
           data-idrow="${rowIndex}" 
           data-price="${row.row_price}" 
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
          Number(blankIndex) === i
        ) {
          const width = row[`width_space_${j}`] ?? 10;
          seatMapHtml += `<div class="BlankSpace" style="width:${width}px;min-width:${width}px;"></div>`;
        }
      }

      globalSeatId++;
      const seatNumber = startSeatNumber + i;
      const price = parseInt(row.row_price || 0, 10);
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

  // --- 🧩 Add JS Behavior ---
  setTimeout(() => {
    const wrapper = document.querySelector(".tibashi-seat-wrapper");
    const filterButtons = wrapper.querySelectorAll(".price-filter-btn");
    const allSeats = wrapper.querySelectorAll(".Seat");
    const allRows = wrapper.querySelectorAll(".RowContainer");

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("tibashi-filter-active"));
        btn.classList.add("tibashi-filter-active");

        const selectedPrice = btn.dataset.price;
        if (selectedPrice === "all") {
          allSeats.forEach((s) => s.classList.remove("SeatDisabled"));
          return;
        }

        // Disable non-matching seats
        allSeats.forEach((seat) => {
          const price = seat.getAttribute("data-price");
          seat.classList.toggle("SeatDisabled", price !== selectedPrice);
        });

        // Scroll to first matching row
        const targetRow = Array.from(allRows).find(
          (r) => r.dataset.price === selectedPrice
        );
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }, 0);

  return seatMapHtml;
}


export async function renderSeats({ timeId }) {
  const app = document.getElementById("app");
  app.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

  try {
    const [seatStatusData, seatPlanData] = await Promise.all([
      fetchSeatStatus(timeId),
      fetchSeatPlan(timeId)
    ]);

    const programId = seatStatusData?.result?.hallInfo?.event_id;
    if (!seatPlanData?.result || !programId) throw new Error("اطلاعات صندلی‌ها یافت نشد");

    app.innerHTML = `
      ${buildSeatPlan(
        seatPlanData.result,
        seatStatusData.result?.book,
        seatStatusData.result?.ipg,
        seatStatusData.result?.temp,
        seatStatusData.result?.soc
      )}
      ${buildControls()}
    `;

    const seatMap = app.querySelector("#seat-map");
    const payBtn = document.getElementById("btn-pay");
    const nextBtn = document.getElementById("btn-next");
    const totalEl = document.getElementById("total-price");

    let selectedSeats = [];

    seatMap.addEventListener("click", (e) => {
      const seat = e.target.closest(".Seat");
      if (!seat || seat.classList.contains("booked")) return;

      const seatNumber = seat.dataset.seat;
      const price = Number(seat.dataset.price || 100000);
      const row = seat.dataset.row;

      const idx = selectedSeats.findIndex(s => s.seatNumber === seatNumber);
      if (idx >= 0) {
        selectedSeats.splice(idx, 1);
        seat.classList.remove("selected");
      } else {
        selectedSeats.push({ seatNumber, row, price });
        seat.classList.add("selected");
      }

      const total = selectedSeats.reduce((s, x) => s + x.price, 0);
      totalEl.textContent = `سبد خرید: ${selectedSeats.length} بلیت - ${total.toLocaleString()} تومان`;
    });

    payBtn.addEventListener("click", () => {
      if (selectedSeats.length === 0) return alert("لطفا حداقل یک صندلی انتخاب کنید");

      showCustomerModal(selectedSeats, async ({ name, phone, discountCode }) => {
        const validDiscount = discountCode === "88884444";
        let totalPrice = selectedSeats.reduce((s, x) => s + x.price, 0);
        if (validDiscount) totalPrice *= 0.8;

        app.innerHTML = `<div class="tibashi-loader">در حال آماده‌سازی پرداخت...</div>`;

        const payload = {
          ProgramId: programId.toString(),
          ProgramSing: programId.toString(),
          pval: timeId.toString(),
          Phone: phone,
          CustomerName: name,
          ProgramDate: timeId.toString(),
          ProgramTimeID: timeId.toString(),
          Seats: selectedSeats.map(({ seatNumber, row, price }) => ({
            SeatId: seatNumber.toString(),
            RowNumber: row.toString(),
            Number: seatNumber.toString(),
            Price: validDiscount ? price * 0.8 : price
          }))
        };

        try {
          const result = await submitTickets(payload);
          if (!result?.status) throw new Error(result?.message || "خطا در ثبت بلیط");
          const token = result?.result?.mtoken;
          if (!token) throw new Error("توکن پرداخت دریافت نشد");
          window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
        } catch (err) {
          alert(err.message || "خطا در ارسال اطلاعات به سرور");
          location.reload();
        }
      });
    });

    nextBtn.addEventListener("click", () => console.log("Selected seats:", selectedSeats));

  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="tibashi-error">❌ خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}
