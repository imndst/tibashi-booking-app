// seat-plan-canvas-updated.js
// نسخه‌ای بازنویسی‌شده که برای هر ردیف امکان موقعیت‌دهی و چرخش مستقل را اضافه می‌کند.
// پشتیبانی می‌شود: row_possition ('absolute' | 'relative'), top_in_abs, left_in_abs,
// row_top_margin, row_lef_margin, transform_rows (deg), seat_align ('ltr' | 'rtl'),
// blank_after_1..6 و width_space_1..6

let canvasScale = 0.6;
let canvasOffsetX = 150;
let canvasOffsetY = 150;
let isPanning = false;
let startPan = { x: 0, y: 0 };
let seatDirection = "ltr"; // global default direction
let seatDataGlobal = [];
let seatRectsGlobal = [];
let selectedSeatsGlobal = new Set();

function degToRad(d) { return d * Math.PI / 180; }

// ===== Build Seats =====
export function buildSeatPlanCanvas(canvas, seatData, { book = [], ipg = [], temp = [], soc = [], canvasWidth = 1000, canvasHeight } = {}) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  seatDataGlobal = seatData;

  const seatSize = 32;
  const gap = 6;
  const rowGap = 16;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight ?? (seatData.length * (seatSize + rowGap) + 50);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Vazirmat, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const seatRects = [];
  let globalSeatId = 1;

  seatData.forEach((row, rowIndex) => {
    const seatCount = parseInt(row.seat_in_rows || 0, 10);
    const marginTop = parseInt(row.row_top_margin || 0, 10) || 0;
    const rowLeftMargin = parseInt(row.row_lef_margin || 0, 10) || 0;

    // توجه: کلید row_possition در کد ورودی شما آمده بود (با دو s). ما همان نام را پذیرفته‌ایم.
    const positionType = (row.row_possition || "relative").toString().toLowerCase();
    const rowAlign = (row.seat_align || seatDirection || "rtl").toString().toLowerCase();
    const transformDeg = parseFloat(row.transform_rows || 0) || 0;

    // تعیین مبدا (پایه) ردیف
    let baseX;
    let baseY;
    if (positionType === "absolute") {
      baseX = (row.left_in_abs !== undefined && row.left_in_abs !== null && row.left_in_abs !== "")
        ? Number(row.left_in_abs)
        : (rowAlign === "ltr" ? rowLeftMargin : canvas.width - rowLeftMargin);

      baseY = (row.top_in_abs !== undefined && row.top_in_abs !== null && row.top_in_abs !== "")
        ? Number(row.top_in_abs)
        : (rowIndex * (seatSize + rowGap) + marginTop);
    } else {
      // حالت نسبی: قرارگیری افقی بر اساس جهت ردیف
      baseX = rowAlign === "ltr" ? rowLeftMargin : (canvas.width - rowLeftMargin);
      baseY = rowIndex * (seatSize + rowGap) + marginTop;
    }

    // localX, localY برای هر صندلی نسبت به مبنای ردیف
    let localX = rowAlign === "ltr" ? 0 : 0; // در rtl از مقادیر منفی استفاده می‌کنیم
    const localY = 0;

    for (let i = 0; i < seatCount; i++) {
      // بررسی فاصله‌های خالی تعریف‌شده (blank_after_N)
      for (let j = 1; j <= 6; j++) {
        const blankIndex = row[`blank_after_${j}`];
        if (blankIndex != null && Number(blankIndex) === i) {
          const width = Number(row[`width_space_${j}`] ?? 10);
          localX += (rowAlign === "ltr" ? width : -width);
        }
      }

      const seatNumber = i + 1;
      const price = parseInt(row.row_price || 0, 10);
      const currentGlobalSeatId = globalSeatId++;

      let color = "#418f2aff";
      if (book.includes(String(currentGlobalSeatId))) color = "#da0b0bff";
      else if (ipg.includes(String(currentGlobalSeatId))) color = "#f59e0b";
      else if (temp.includes(String(currentGlobalSeatId))) color = "#250404ff";
      else if (soc.includes(String(currentGlobalSeatId))) color = "#3d3108ff";

      const w = seatSize;
      const h = seatSize;

      // ذخیره اطلاعات هر صندلی. drawSeats براساس this داده‌ها ردیف‌ها را به‌صورت مستقل رندر می‌کند.
      seatRects.push({
        id: currentGlobalSeatId,
        row: rowIndex + 1,
        number: seatNumber,
        price,
        // موقعیت محلی نسبت به مبنای ردیف
        localX,
        localY,
        w, h,
        color,
        booked: color === "#999",
        // اطلاعات ردیف برای رندر و محاسبه کلیک
        rowBaseX: baseX,
        rowBaseY: baseY,
        rowAlign,
        rowTransform: transformDeg // درجه
      });

      // حرکت به صندلی بعدی
      localX += (rowAlign === "ltr" ? (w + gap) : -(w + gap));
    }
  });

  seatRectsGlobal = seatRects;
  selectedSeatsGlobal.clear();

  drawSeats(canvas);

  return { seatRects, canvas };
}

// ===== Draw Seats =====
export function drawSeats(canvas) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // ابتدا آفست و زوم کلی اعمال می‌شود
  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasScale, canvasScale);

  // گروه‌بندی صندلی‌ها بر اساس ردیف تا بتوانیم برای هر ردیف یک translate/rotate اعمال کنیم
  const rowsMap = new Map();
  for (const seat of seatRectsGlobal) {
    if (!rowsMap.has(seat.row)) rowsMap.set(seat.row, []);
    rowsMap.get(seat.row).push(seat);
  }

  rowsMap.forEach((seats, rowNumber) => {
    const rowMeta = seats[0];
    const angle = degToRad(rowMeta.rowTransform || 0);

    ctx.save();
    // انتقال مبنای ردیف
    ctx.translate(rowMeta.rowBaseX, rowMeta.rowBaseY);
    if (angle) ctx.rotate(angle);

    // رسم همه صندلی‌های این ردیف در مختصات محلی
    seats.forEach(seat => {
      const drawX = seat.localX;
      const drawY = seat.localY;

      let fillColor = seat.color;
      if (selectedSeatsGlobal.has(seat.id)) fillColor = "#f59e0b"; // انتخاب‌شده

      ctx.fillStyle = fillColor;
      ctx.fillRect(drawX, drawY, seat.w, seat.h);

      ctx.fillStyle = "#fff";
      ctx.fillText(seat.number, drawX + seat.w / 2, drawY + seat.h / 2);
    });

    ctx.restore();
  });

  ctx.restore();
}

// ===== Canvas Interaction =====
export function initSeatCanvasControls(canvas, onChange) {
  if (!canvas || typeof canvas.getContext !== "function") return;

  let isDragging = false;

  canvas.addEventListener("click", (e) => {
    if (isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const xClick = (e.clientX - rect.left - canvasOffsetX) / canvasScale;
    const yClick = (e.clientY - rect.top - canvasOffsetY) / canvasScale;

    for (const seat of seatRectsGlobal) {
      if (seat.booked) continue;

      // ابتدا مختصات کلیک را به مختصات محلیِ ردیف تبدیل می‌کنیم (معکوس چرخش و انتقال)
      const angle = degToRad(seat.rowTransform || 0);
      const dx = xClick - seat.rowBaseX;
      const dy = yClick - seat.rowBaseY;

      // چرخش نقطه به مقدار -angle (معکوس)
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const localXClick = dx * cosA + dy * sinA;      // cos(-θ)=cosθ, sin(-θ)=-sinθ -> x' = x*cosθ + y*sinθ
      const localYClick = -dx * sinA + dy * cosA;     // y' = -x*sinθ + y*cosθ

      if (
        localXClick >= seat.localX &&
        localXClick <= seat.localX + seat.w &&
        localYClick >= seat.localY &&
        localYClick <= seat.localY + seat.h
      ) {
        if (selectedSeatsGlobal.has(seat.id)) selectedSeatsGlobal.delete(seat.id);
        else selectedSeatsGlobal.add(seat.id);

        drawSeats(canvas);

        if (typeof onChange === "function") onChange(selectedSeatsGlobal);
        break;
      }
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    isPanning = true;
    isDragging = false;
    startPan = { x: e.clientX - canvasOffsetX, y: e.clientY - canvasOffsetY };
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    isDragging = true;
    canvasOffsetX = e.clientX - startPan.x;
    canvasOffsetY = e.clientY - startPan.y;
    drawSeats(canvas);
  });

  canvas.addEventListener("mouseup", () => { isPanning = false; });
  canvas.addEventListener("mouseleave", () => { isPanning = false; });

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      isDragging = false;
      startPan = { x: e.touches[0].clientX - canvasOffsetX, y: e.touches[0].clientY - canvasOffsetY };
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isPanning) {
      isDragging = true;
      canvasOffsetX = e.touches[0].clientX - startPan.x;
      canvasOffsetY = e.touches[0].clientY - startPan.y;
      drawSeats(canvas);
    }
  });

  canvas.addEventListener("touchend", () => { isPanning = false; isDragging = false; });
}

// ===== Zoom & Flip =====nexport function zoomIn(canvas) { canvasScale *= 1.2; drawSeats(canvas); }
export function zoomOut(canvas) { canvasScale /= 1.2; drawSeats(canvas); }
export function resetZoom(canvas) { canvasScale = 1; canvasOffsetX = 0; canvasOffsetY = 0; drawSeats(canvas); }
export function flipSeats(canvas) { seatDirection = seatDirection === "ltr" ? "rtl" : "ltr"; buildSeatPlanCanvas(canvas, seatDataGlobal); }

// ===== Getter for selected seats =====nexport function getSelectedSeats() {
export function getSelectedSeats() {
return selectedSeatsGlobal;
}
