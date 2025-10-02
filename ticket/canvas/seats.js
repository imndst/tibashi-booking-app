import { buildSeatPlanCanvas, initSeatCanvasControls, getSelectedSeats } from "./seatCanvas.js";
import { buildControls } from "../../tibashi-js/modal/seat/buildControls.js";
import { fetchSeatPlan, fetchSeatStatus, submitTickets } from "../../tibashi-js/modal/seat/api.js";

export async function renderSeats(event, tabContent) {
  if (!tabContent) throw new Error("tabContent element required");
  const { eventId, timeId } = event;

  tabContent.innerHTML = `<div style="padding:20px;">در حال بارگذاری...</div>`;

  try {
    const seatPlanData = await fetchSeatPlan(eventId);
    if (!seatPlanData.result) throw new Error("هیچ صندلی‌ای یافت نشد");

    const seatStatusData = await fetchSeatStatus(timeId);
    const book = (seatStatusData.result?.book || []).map(String);
    const ipg = (seatStatusData.result?.ipg || []).map(String);
    const temp = (seatStatusData.result?.temp || []).map(String);
    const soc = (seatStatusData.result?.soc || []).map(String);

    const programDataId = seatStatusData.result?.hallInfo?.event_id;

    tabContent.innerHTML = "";
    const canvas = document.createElement("canvas");
    tabContent.appendChild(canvas);

    const { seatRects } = buildSeatPlanCanvas(
      canvas,
      seatPlanData.result,
      { book, ipg, temp, soc }
    );

    const controls = buildControls({ ticketCount: 0, totalPrice: 0 });
    tabContent.appendChild(controls);

    // ✅ Get the button
    const btnCombined = controls.querySelector("#btn-combined");

    btnCombined.addEventListener("click", async () => {
      const selected = seatRects.filter((s) => getSelectedSeats().has(s.id));
      const count = selected.length;

      if (!count) {
        alert("لطفا حداقل یک صندلی انتخاب کنید");
        return;
      }

      const phone = prompt("شماره تلفن خود را وارد کنید:");
      const customerName = prompt("نام مشتری را وارد کنید:");
      if (!phone || !customerName) {
        alert("نام و شماره تلفن الزامی است.");
        return;
      }

      const payload = {
        ProgramId: programDataId.toString(),
        ProgramSing: programDataId.toString(),
        pval: timeId.toString(),
        Phone: phone,
        CustomerName: customerName,
        ProgramDate: timeId.toString(),
        ProgramTimeID: timeId.toString(),
        Seats: selected.map((s) => ({
          SeatId: s.id.toString(),
          RowNumber: s.row.toString(),
          Number: s.id.toString(),
          Price: s.price,
        })),
      };

      try {
        const result = await submitTickets(payload);
        if (!result.status) {
          alert(result.message || "خطا در ثبت بلیط");
          return;
        }

        const token = result.result?.mtoken;
        if (!token) {
          alert("توکن دریافت نشد");
          return;
        }

        window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
      } catch (err) {
        console.error(err);
        alert("خطا در ارسال اطلاعات به سرور");
      }
    });

    // Real-time seat selection updates
    initSeatCanvasControls(canvas, (selectedSeats) => {
      const selected = seatRects.filter((s) => selectedSeats.has(s.id));
      const count = selected.length;
      const total = selected.reduce((sum, s) => sum + s.price, 0);
      btnCombined.textContent = `ادامه | سبد خرید (${count} بلیت - ${total})`;
    });

  } catch (err) {
    console.error(err);
    tabContent.innerHTML = `<div style="padding:20px; color:red;">خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}
