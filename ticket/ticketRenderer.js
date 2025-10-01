import { getSeatInfo } from './ticketUtils.js';

const API_BASE = "https://bdcast.gishot.ir/api/TempSeat";
const ticketsDiv = document.getElementById("tickets");
const downloadBtn = document.getElementById("downloadPDF");

// Fetch ticket data from API
export async function fetchTicket(id) {
    try {
        const res = await fetch(`${API_BASE}/ticket/${id}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error("API fetch error:", err);
        return { status: false, message: "خطا در دریافت اطلاعات از سرور" };
    }
}

// Render tickets
export async function renderTickets(id) {
    ticketsDiv.innerHTML = "";
    if (!id) {
        ticketsDiv.innerHTML = "<p style='color:red'>❌ شماره پیگیری وارد نشده است.</p>";
        return;
    }

    const data = await fetchTicket(id);
    if (!data.status) {
        ticketsDiv.innerHTML = `<p style='color:red'>❌ ${data.message}</p>`;
        return;
    }

    try {
        const { customer, seats, hall_name, address, lat } = data.result;

        if (!Array.isArray(seats) || seats.length === 0) {
            ticketsDiv.innerHTML = "<p style='color:red'>❌ هیچ صندلی برای این شماره پیگیری یافت نشد.</p>";
            return;
        }

        for (const seat of seats) {
            let seatInfo = null;
            try {
                seatInfo = await getSeatInfo(customer.programsing, seat.place);
            } catch (err) {
                console.warn("Seat info not found", err);
            }

            const ticket = document.createElement("div");
            ticket.className = "ticket";

            ticket.innerHTML = `
                <div class="ticket-header">
                    <img src="https://gishot.ir/plan/raoofishoq.jpg" alt="Avatar" class="avatar">
                    <div class="sponsor">Sponsor</div>
                </div>
                <h2>${customer.prognName || "رویداد"}</h2>
                <p><strong>مشتری:</strong> ${customer.name || "-"}</p>
                <p><strong>تاریخ:</strong> ${customer.timeG ? new Date(customer.timeG).toLocaleString("fa-IR") : "-"}</p>
                <p><strong>ردیف:</strong> ${seatInfo?.rowNumber || "-"} | <strong>صندلی:</strong> ${seatInfo?.seatNumber || seat.place}</p>
                <p><strong>قیمت:</strong> ${seat.much || "-"}</p>
                <div class="section">
                    <p><strong>محل رویداد:</strong> ${hall_name || "-"}</p>
                    <p><strong>آدرس:</strong> ${address || "-"}</p>
                    <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">نمایش مسیر</a></p>
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
                QRCode.toCanvas(ticket.querySelector(".qrcode"), `${seat.barcode}`, { width: 100 });
            } catch (err) {
                console.warn("QR code error:", err);
            }

            // Generate barcode
            try {
                JsBarcode(ticket.querySelector(".barcode"), `${seat.barcode}`, { format: "CODE128", width: 2, height: 40 });
            } catch (err) {
                console.warn("Barcode error:", err);
            }
        }
    } catch (err) {
        console.error("Render error:", err);
        ticketsDiv.innerHTML = `<p style='color:red'>❌ خطا در نمایش بلیط‌ها</p>`;
    }
}

// PDF download
export function downloadTicketsPDF() {
    if (!ticketsDiv.innerHTML.trim()) {
        return alert("بلیتی برای دانلود وجود ندارد!");
    }

    try {
        html2pdf().from(ticketsDiv).set({
            margin: 0.5,
            filename: 'tickets.pdf',
            html2canvas: { scale: 2 },
            pagebreak: { mode: 'css', after: '.ticket' }
        }).save();
    } catch (err) {
        console.error("PDF download error:", err);
        alert("خطا در دانلود PDF");
    }
}
