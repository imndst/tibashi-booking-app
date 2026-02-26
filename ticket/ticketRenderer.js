const API_BASE = "https://bdcast.gishot.ir/api/TempSeat";
const API_BASE_T = "https://bdcast.gishot.ir/api";


// const API_BASE = "https://localhost:7032/api/TempSeat";
// const API_BASE_T = "https://localhost:7032/api";
const ticketsDiv = document.getElementById("tickets");
const downloadBtn = document.getElementById("downloadPDF");

/* ================================
   Seat Plan Cache (Global)
================================ */

const seatPlanCache = {};

/**
 * Fetch and build seat plan (only once per event)
 */

async function getSeatPlan(eventId) {
  if (!eventId) throw new Error("eventId is required");

  // اگر قبلا کش شده باشد
  if (seatPlanCache[eventId]) {
    return seatPlanCache[eventId];
  }

  const res = await fetch(`${API_BASE_T}/Seat/plan/${eventId}`);
  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to fetch seat plan");
  }

  const rows = data.result || [];
  let globalId = 0;

  // استفاده از Map برای lookup سریع O(1)
  const seatMap = new Map();

  rows.forEach((row, rowIndex) => {
    const seatCount = Number(row.seat_in_rows) || 0;

    const hasCustomStart =
      Number(row.is_incr) === 1 &&
      row.incr_first_seat !== null &&
      row.incr_first_seat !== undefined &&
      !isNaN(Number(row.incr_first_seat));

    const startSeatNumber = hasCustomStart
      ? Number(row.incr_first_seat)
      : 1;

    for (let i = 0; i < seatCount; i++) {
      globalId++;

      seatMap.set(globalId, {
        globalId,
        rowNumber: row.row_title?.trim() || rowIndex + 1,
        seatNumber: startSeatNumber + i, // ✅ اینجا اصلاح شد
      });
    }
  });

  // ذخیره در کش
  seatPlanCache[eventId] = seatMap;

  return seatMap;
}
/* ================================
   Fetch Ticket
================================ */

async function fetchTicket(id) {
  try {
    const res = await fetch(`${API_BASE}/ticket/${id}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    return { status: false, message: "خطا در دریافت اطلاعات از سرور" };
  }
}

/* ================================
   Render Tickets
================================ */

export async function renderTickets(id) {
  ticketsDiv.innerHTML = "";

  if (!id) {
    ticketsDiv.innerHTML =
      "<p style='color:red'>❌ شماره پیگیری وارد نشده است.</p>";
    return;
  }

  const data = await fetchTicket(id);

  if (!data.status) {
    ticketsDiv.innerHTML = `<p style='color:red'>❌ ${data.message}</p>`;
    return;
  }

  try {
    const { customer, seats, hall_name, address, event_time } =
      data.result;

    if (!Array.isArray(seats) || seats.length === 0) {
      ticketsDiv.innerHTML =
        "<p style='color:red'>❌ هیچ صندلی برای این شماره پیگیری یافت نشد.</p>";
      return;
    }

    // 🔥 فقط یک بار Seat Plan گرفته می‌شود
    let seatPlan = new Map();
    try {
      seatPlan = await getSeatPlan(customer.prId);
    } catch (err) {
      console.warn("Seat plan fetch failed", err);
    }

    // تبدیل تاریخ به شمسی
    const persianDate = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(event_time));

    for (const seat of seats) {
  const seatInfo = seatPlan.get(Number(seat.place)) || null;
const DEFAULT_LOCATION_TEXT = `
⚠️ این بلیت غیرقابل استرداد است.<br>
لطفاً حداقل <strong>۱۵ دقیقه قبل از شروع سانس</strong> در سالن حضور داشته باشید.<br>
در صورت تأخیر یا عدم رعایت قوانین ذکرشده در صفحه اطلاعات رویداد، بلیت باطل خواهد شد.
`;
  const ticket = document.createElement("div");
  ticket.className = "ticket";

  ticket.innerHTML = `
<div class="ticket-header">
  <div class="sponsor">Gishot</div>
</div>

<h2>${customer.prognName || "رویداد"}</h2>
<h1>${persianDate}</h1>

<h3><strong>مشتری:</strong> ${customer.name || "-"}</h3>

<!-- کد خریدار -->
<div class="buyer-code-box">
  ${customer.id || "-"}
</div>

<!-- ردیف و صندلی -->
<div class="seat-box">
  ردیف ${seatInfo?.rowNumber || "-"}  |  صندلی ${
    seatInfo?.seatNumber || seat.place
  }
</div>

<p><strong>قیمت:</strong> ${seat.much || "-"}</p>

<div class="section">
  <p><strong>محل رویداد:</strong> ${hall_name || "-"}</p>
  <p><strong>آدرس:</strong> ${address || "-"}</p>
  <p>
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}" target="_blank">نمایش مسیر</a>
  </p>
</div>

<!-- توضیحات / لوکیشن -->
<div class="location-box">
  ${DEFAULT_LOCATION_TEXT}
  ${data.result.location || "توضیحاتی موجود نیست"}
</div>

<div class="qr-barcode">
  <canvas class="qrcode"></canvas>
  <svg class="barcode"></svg>
</div>

<!-- تاریخ تراکنش پایین بلیت -->
<div class="transaction-date">
  تاریخ تراکنش: ${
    customer.timeG
      ? new Date(customer.timeG).toLocaleString("fa-IR")
      : "-"
  }
</div>

<div class="footer">gishot.ir</div>
`;

  ticketsDiv.appendChild(ticket);

  // QR Code
  try {
    QRCode.toCanvas(ticket.querySelector(".qrcode"), `${seat.barcode}`, {
      width: 100,
    });
  } catch (err) {
    console.warn("QR code error:", err);
  }

  // Barcode
  try {
    JsBarcode(ticket.querySelector(".barcode"), `${seat.barcode}`, {
      format: "CODE128",
      width: 2,
      height: 40,
    });
  } catch (err) {
    console.warn("Barcode error:", err);
  }
}
  } catch (err) {
    console.error("Render error:", err);
    ticketsDiv.innerHTML = `<p style='color:red'>❌ خطا در نمایش بلیط‌ها</p>`;
  }
}

/* ================================
   PDF Download
================================ */

export function downloadTicketsPDF() {
  if (!ticketsDiv.innerHTML.trim()) {
    return alert("بلیتی برای دانلود وجود ندارد!");
  }

  try {
    html2pdf()
      .from(ticketsDiv)
      .set({
        margin: 0.3,
        filename: "tickets.pdf",
        html2canvas: { scale: 1.8 },
        pagebreak: { mode: "css"},
      })
      .save();
  } catch (err) {
    console.error("PDF download error:", err);
    alert("خطا در دانلود PDF");
  }
}