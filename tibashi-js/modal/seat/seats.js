// seats.js
import { buildSeatPlan } from './seatDesign.js';
import { buildControls } from './basketControls.js';

export async function renderSeats(programDataId, tabContent) {
  if (!tabContent) throw new Error("tabContent element required");

  tabContent.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

  try {
    const res = await fetch(`https://localhost:7032/api/Seat/plan/${programDataId}`);
    const data = await res.json();
    if (!data.result) throw new Error(data.message || "هیچ صندلی‌ای یافت نشد");

    // Render controls + seat plan
    tabContent.innerHTML = buildControls() + buildSeatPlan(data.result);

    const selectedSeats = [];
    const howMuchEl = tabContent.querySelector('#HowMuch');
    const payBtn = tabContent.querySelector('#payx');
    const nextBtn = tabContent.querySelector('#nextstage');

    function updateControls() {
      const total = selectedSeats.reduce((s, it) => s + it.price, 0);
      howMuchEl.textContent = `مبلغ: ${total.toLocaleString('fa-IR')} تومان`;
      payBtn.textContent = `سبد خرید (${selectedSeats.length} بلیت)`;
      payBtn.disabled = selectedSeats.length === 0;
    }

    // Seat click logic
    tabContent.querySelectorAll('.Seat').forEach(seatEl => {
      seatEl.addEventListener('click', () => {
        const seatNumber = seatEl.dataset.seat;
        const row = seatEl.dataset.row;
        const price = parseInt(seatEl.dataset.price, 10);

        const idx = selectedSeats.findIndex(s => s.seatNumber === seatNumber && s.row === row);
        if (idx === -1) {
          seatEl.classList.add('selected');
          selectedSeats.push({ seatNumber, row, price, element: seatEl });
        } else {
          selectedSeats[idx].element.classList.remove('selected');
          selectedSeats.splice(idx, 1);
        }
        updateControls();
      });
    });

    // --- PAY BUTTON CLICK ---
    payBtn.addEventListener('click', async () => {
      if (!selectedSeats.length) return;

      // Transform selectedSeats into API format
      const payload = {
        ProgramId: programDataId.toString(),
        ProgramSing: tabContent.dataset.programSing || "1", // set your program sing if needed
        Phone: prompt("شماره تلفن خود را وارد کنید:"), // or get from input
        CustomerName: prompt("نام مشتری را وارد کنید:"), // or get from input
        ProgramDate: new Date().toISOString(), // or your selected date
        Seats: selectedSeats.map(s => ({
          SeatId: s.seatNumber,       // unique seat id
          RowNumber: s.row,           // row display
          Number: s.seatNumber,       // seat number display
          Price: s.price
        }))
      };

      try {
        const response = await fetch('https://localhost:7032/api/TempSeat/SubmitTickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.Status) {
          alert(`توکن موفق دریافت شد: ${result.Result.mtoken}\nلینک پرداخت: ${result.Result.redirectUrl}`);
          // optionally redirect: window.location.href = result.Result.redirectUrl;
        } else {
          alert(`خطا: ${result.Message}`);
          console.error(result.Result);
        }

      } catch (err) {
        console.error(err);
        alert("خطا در ارسال اطلاعات به سرور");
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!selectedSeats.length) {
        alert("لطفا حداقل یک صندلی انتخاب کنید");
        return;
      }
      console.log("Selected seats:", selectedSeats);
    });

    updateControls();

  } catch (err) {
    console.error(err);
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}
