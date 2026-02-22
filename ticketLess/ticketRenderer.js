const API_BASE = "https://localhost:7032/api/TempSeat";

const ticketsDiv = document.getElementById("tickets");
const downloadBtn = document.getElementById("downloadPDF");

// --- Fetch ticket data ---
async function fetchTicket(ticketId) {
  try {
    const res = await fetch(`${API_BASE}/ticket/${ticketId}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    return { status: false, message: "خطا در دریافت اطلاعات از سرور" };
  }
}

// --- Fetch seatless plan for event ---
async function buildSeatless(eventId, token) {
  if (!eventId) throw new Error("EventId is required");
  if (!token) throw new Error("JWT token is required");

  const res = await fetch(`${API_BASE}/Seatless/plan/${eventId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized: please login");
  }

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to fetch seatless data");
  }

  let globalId = 0;
  return (data.result || []).map((item) => ({
    globalId: ++globalId,
    id: item.id,
    mid: item.mid,
    name: item.name,
    price: item.price,
    pic: item.picPath,
    bgcolor: item.bgColor,
    capacity: item.capacity,
    remaining: item.remaining,
    sansId: item.sansId,
  }));
}

// --- Render tickets ---
export async function renderTickets(ticketId, token) {
  ticketsDiv.innerHTML = "";

  if (!ticketId) {
    ticketsDiv.innerHTML =
      "<p style='color:red'>❌ شماره پیگیری وارد نشده است.</p>";
    return;
  }

  const data = await fetchTicket(ticketId);
  if (!data.status) {
    ticketsDiv.innerHTML = `<p style='color:red'>❌ ${data.message}</p>`;
    return;
  }

  try {
    const { customer, seats, hall_name, address, event_time, programsing } =
      data.result;

    const persianDate = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(event_time));

    if (!Array.isArray(seats) || seats.length === 0) {
      ticketsDiv.innerHTML =
        "<p style='color:red'>❌ هیچ صندلی برای این شماره پیگیری یافت نشد.</p>";
      return;
    }
 const token = localStorage.getItem("jwt_token");
    // Fetch seatless plan for this event once
    const seatlessPlan = await buildSeatless(2717324, token);

    for (const seat of seats) {
      // Find seat info from seatless plan by place or id
      const seatInfo =
        seatlessPlan.find((s) => s.id == seat.pid || s.id == seat.SeatId) ||
        {};

      const ticket = document.createElement("div");
      ticket.className = "ticket";

      ticket.innerHTML = `
                <div class="ticket-header">
                    <div class="sponsor">Sponsor Tibashi-Gishot</div>
                </div>
                <h2>${customer.prognName || "رویداد"}</h2>
                <h1>${persianDate}</h1>
                <h3><strong>مشتری:</strong> ${customer.name || "-"}</h3>
                <p><strong>کد خریدار:</strong> ${customer.id || "-"}</p>
                <p><strong>تاریخ خرید:</strong> ${
                  customer.timeG
                    ? new Date(customer.timeG).toLocaleString("fa-IR")
                    : "-"
                }</p>
                <p><strong>صندلی:</strong> ${seatInfo.name || seat.note || "-"}</p>
                <p><strong>قیمت:</strong> ${seat.much || seatInfo.price || "-"}</p>
                <div class="section">
                    <p><strong>محل رویداد:</strong> ${hall_name || "-"}</p>
                    <p><strong>آدرس:</strong> ${address || "-"}</p>
                    <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      address
                    )}" target="_blank">نمایش مسیر</a></p>
                </div>
                <div class="qr-barcode">
                    <canvas class="qrcode"></canvas>
                    <svg class="barcode"></svg>
                </div>
                <div class="footer">gishot.ir</div>
            `;

      ticketsDiv.appendChild(ticket);

      // Generate QR code
      try {
        QRCode.toCanvas(ticket.querySelector(".qrcode"), `${seat.barcode}`, {
          width: 100,
        });
      } catch (err) {
        console.warn("QR code error:", err);
      }

      // Generate barcode
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

// --- PDF download ---
export function downloadTicketsPDF() {
  if (!ticketsDiv.innerHTML.trim()) {
    return alert("بلیتی برای دانلود وجود ندارد!");
  }

  try {
    html2pdf()
      .from(ticketsDiv)
      .set({
        margin: 0.5,
        filename: "tickets.pdf",
        html2canvas: { scale: 2 },
        pagebreak: { mode: "css", after: ".ticket" },
      })
      .save();
  } catch (err) {
    console.error("PDF download error:", err);
    alert("خطا در دانلود PDF");
  }
}
