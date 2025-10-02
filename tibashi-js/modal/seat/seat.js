import { buildSeatPlan } from "./seatDesign.js";
import { buildControls } from "./basketControls.js";
import { fetchSeatPlan, fetchSeatStatus, submitTickets } from "./api.js";
import { initSeatControls } from "./seatControls.js";

export async function renderSeats(event, tabContent) {
  if (!tabContent) throw new Error("tabContent element required");

  const { eventId, timeId } = event;

  // Loader
  tabContent.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

  try {
    // Fetch seat plan & status
    const seatPlanData = await fetchSeatPlan(eventId);
    if (!seatPlanData.result) throw new Error(seatPlanData.message || "هیچ صندلی‌ای یافت نشد");

    const seatStatusData = await fetchSeatStatus(timeId);
    const book = (seatStatusData.result?.book || []).map(String);
    const ipg = (seatStatusData.result?.ipg || []).map(String);
    const temp = (seatStatusData.result?.temp || []).map(String);
    const soc = (seatStatusData.result?.soc || []).map(String);

    const hallInfo = seatStatusData.result?.hallInfo || {};
    const programDataId = hallInfo.event_id;
    if (!programDataId) throw new Error("programDataId is required for payment.");

    // Clear tab content
    tabContent.innerHTML = "";

    // Build controls and seat map
    const controls = buildControls({ ticketCount: 0, totalPrice: 0, initialScale: 0.5 });
    const seatMapEl = buildSeatPlan(seatPlanData.result, book, ipg, temp, soc, hallInfo);

    // Append to tab
    tabContent.appendChild(controls);
    tabContent.appendChild(seatMapEl);

    // Initialize zoom buttons
    controls.initZoom(seatMapEl, 0.5);

    // Initialize seat selection logic
    const seatLogic = initSeatControls(seatMapEl, {
      onChange: (selectedSeats, totalPrice) => {
        controls.update(selectedSeats.length, totalPrice);
      },
    });

    // Pay button handler
    controls.onPay(async (selectedSeats) => {
      if (!seatLogic.getSelectedSeats().length) {
        alert("لطفا حداقل یک صندلی انتخاب کنید");
        return;
      }

      const phone = prompt("شماره تلفن خود را وارد کنید:");
      const customerName = prompt("نام مشتری را وارد کنید:");
      if (!phone || !customerName) {
        alert("نام و شماره تلفن الزامی است.");
        return;
      }

      tabContent.innerHTML = `<div class="tibashi-loader">در حال آماده‌سازی...</div>`;

      const payload = {
        ProgramId: programDataId.toString(),
        ProgramSing: programDataId.toString(),
        pval: timeId.toString(),
        Phone: phone,
        CustomerName: customerName,
        ProgramDate: timeId.toString(),
        ProgramTimeID: timeId.toString(),
        Seats: seatLogic.getSelectedSeats().map((s) => ({
          SeatId: s.seatNumber.toString(),
          RowNumber: s.row.toString(),
          Number: s.seatNumber.toString(),
          Price: s.price,
        })),
      };

      try {
        const result = await submitTickets(payload);
        if (!result.status) throw new Error(result.message || "خطا در ثبت بلیط");

        const token = result.result?.mtoken;
        if (!token) throw new Error("توکن دریافت نشد");

        // Payment modal
        const modal = document.createElement("div");
        modal.style.cssText = `
          position:fixed;top:0;left:0;width:100%;height:100%;
          background:rgba(0,0,0,0.6);display:flex;
          justify-content:center;align-items:center;z-index:9999;
          font-family:Vazirmat, sans-serif;
        `;
        modal.innerHTML = `
          <div style="background:#fff; padding:20px; border-radius:10px; text-align:center; max-width:400px; position:relative;">
            <p id="countdownMsg">در حال انتقال به درگاه...</p>
            <p id="vpnMsg" style="display:none; font-size:12px; color:#333; margin-top:10px;">
              ممکن است فیلترشکن روشن باشد، لطفا آن را خاموش کنید.
            </p>
            <button id="manualRedirect" style="padding:8px 16px; margin-top:10px; display:none;">هدایت به درگاه</button>
          </div>
        `;
        document.body.appendChild(modal);

        const countdownMsg = modal.querySelector("#countdownMsg");
        const vpnMsg = modal.querySelector("#vpnMsg");
        const manualBtn = modal.querySelector("#manualRedirect");

        const timeoutId = setTimeout(() => {
          countdownMsg.style.display = "none";
          vpnMsg.style.display = "block";
          manualBtn.style.display = "inline-block";
        }, 4000);

        manualBtn.onclick = () => {
          clearTimeout(timeoutId);
          modal.remove();
          window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
        };

        setTimeout(() => {
          modal.remove();
          window.location.href = `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token}`;
        }, 1000);

        window.onpopstate = () => modal.remove();

      } catch (err) {
        console.error(err);
        alert(err.message || "خطا در ارسال اطلاعات به سرور");

        // Re-render seat map
        tabContent.innerHTML = "";
        tabContent.appendChild(buildControls({ initialScale: 0.5 }));
        tabContent.appendChild(buildSeatPlan(seatPlanData.result, [], [], [], [], hallInfo));
      }
    });

    // Next button handler
    controls.onNext(() => {
      const selectedSeats = seatLogic.getSelectedSeats();
      if (!selectedSeats.length) {
        alert("لطفا حداقل یک صندلی انتخاب کنید");
        return;
      }
      console.log("Selected seats:", selectedSeats);
    });

  } catch (err) {
    console.error(err);
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری نقشه صندلی‌ها</div>`;
  }
}
