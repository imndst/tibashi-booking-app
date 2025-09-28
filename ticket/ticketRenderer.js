import { getSeatInfo } from './ticketUtils.js';

const API_BASE = "https://bdcast.gishot.ir/api/TempSeat";
const ticketsDiv = document.getElementById("tickets");
const downloadBtn = document.getElementById("downloadPDF");

export async function fetchTicket(id) {
  const res = await fetch(`${API_BASE}/ticket/${id}`);
  return res.json();
}

export async function renderTickets(id) {
  ticketsDiv.innerHTML = "";
  if(!id) return alert("شماره پیگیری را وارد کنید");

  try {
    const data = await fetchTicket(id);
    if(!data.status) { alert(data.message); return; }

    const { customer, seats ,hall_name,address,lat} = data.result;

    for(const seat of seats){
      const seatInfo = await getSeatInfo(customer.programsing, seat.place);
      const ticket = document.createElement("div");
      ticket.className = "ticket";

      ticket.innerHTML = `
        <div class="ticket-header">
          <img src="https://gishot.ir/plan/raoofishoq.jpg" alt="Avatar" class="avatar">
          <div class="sponsor">Sponsor</div>
        </div>
        <h2>${customer.prognName}</h2>
        <p><strong>مشتری:</strong> ${customer.name}</p>
        <p><strong>تاریخ:</strong> ${customer.programDate}</p>
        <p><strong>ردیف:</strong> ${seatInfo ? seatInfo.rowNumber : "-"} | <strong>صندلی:</strong> ${seatInfo ? seatInfo.seatNumber : "-"}</p>
        <p><strong>قیمت:</strong> ${seat.price}</p>
        <div class="section">
          <p><strong>محل رویداد:</strong> ${hall_name}</p>
          <p><strong>آدرس:</strong> ${address}</p>
          <p><a href="https://www.google.com/maps${lat}" target="_blank">نمایش مسیر</a></p>
        </div>
        <div class="amenities">
          <i class="fa-solid fa-wifi" title="WiFi موجود"></i>
          <i class="fa-solid fa-couch" title="صندلی وouchers"></i>
          <i class="fa-solid fa-smoking-ban" title="محل غیرسیگاری"></i>
          <i class="fa-solid fa-person-booth" title="ظرفیت سالن موجود"></i>
        </div>
        <div class="qr-barcode">
          <canvas class="qrcode"></canvas>
          <svg class="barcode"></svg>
        </div>
        <img src="https://gishot.ir/plan/esliderraoofishoq.jpg" alt="Footer Banner" class="banner">
        <div class="footer">gishot.ir</div>
      `;

      ticketsDiv.appendChild(ticket);

      // QR code
      QRCode.toCanvas(ticket.querySelector(".qrcode"), `${customer.rec}-${seat.seatId}`, { width: 100 });
      // Barcode
      JsBarcode(ticket.querySelector(".barcode"), `${seat.barcode || seat.seatId}`, { format:"CODE128", width:2, height:40 });
    }

  } catch(err){ console.error(err); alert("خطا در دریافت اطلاعات بلیط"); }
}

// PDF download
export function downloadTicketsPDF() {
  if(!ticketsDiv.innerHTML) return alert("بلیتی برای دانلود وجود ندارد!");
  html2pdf().from(ticketsDiv).set({ 
    margin:0.5, 
    filename: 'tickets.pdf', 
    html2canvas:{scale:2}, 
    pagebreak:{ mode:'css', after:'.ticket' } 
  }).save();
}
