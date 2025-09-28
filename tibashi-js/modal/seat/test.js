import { buildSeatPlan } from './seatDesign.js';
import { buildControls } from './basketControls.js';
import { fetchSeatPlan, fetchSeatStatus } from './api.js';

export async function renderSeats(event, tabContent) {
  if (!tabContent) throw new Error("tabContent element required");
  const { eventId, timeId } = event;

  tabContent.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

  try {
    // Fetch seat plan
      const seatPlanData = await fetchSeatPlan(eventId);
     if (!seatPlanData.result) throw new Error(seatPlanData.message || "هیچ صندلی‌ای یافت نشد");
     const seatStatusData = await fetchSeatStatus(timeId);
   

    const book = (seatStatusData.result?.book || []).map(String);
    const ipg = (seatStatusData.result?.ipg || []).map(String);
    const temp = (seatStatusData.result?.temp || []).map(String);
    const soc = (seatStatusData.result?.soc || []).map(String);

    const programDataId = seatStatusData.result?.hallInfo?.event_id;
    if (!programDataId) throw new Error("programDataId is required for payment.");

    // Render controls + seat plan
    tabContent.innerHTML =
      buildControls() +
      buildSeatPlan(seatPlanData.result, book, ipg, temp, soc);

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
      // Skip non-free seats
      if (
        seatEl.classList.contains('Book') ||
        seatEl.classList.contains('Temp') ||
        seatEl.classList.contains('Ipg') ||
        seatEl.classList.contains('Soc')
      ) return;

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

      const payload = {
        ProgramId: programDataId.toString(),
        ProgramSing: programDataId.toString(),
        pval:timeId.toString(),
        Phone: prompt("شماره تلفن خود را وارد کنید:"),
        CustomerName: prompt("نام مشتری را وارد کنید:"),
        ProgramDate: new Date().toISOString(),
        ProgramTimeID:timeId.toString(),
        Seats: selectedSeats.map(s => ({
          SeatId: s.seatNumber,
          RowNumber: s.row,
          Number: s.seatNumber,
          Price: s.price
        }))
      };

      try {
        const response = await fetch('https://bdcast.gishot.ir/api/TempSeat/SubmitTickets', {
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

    // --- NEXT BUTTON CLICK ---
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
