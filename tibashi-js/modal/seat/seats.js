import { buildSeatPlan } from "./seatDesign.js";
import { buildControls } from "./basketControls.js";
import { fetchSeatPlan, fetchSeatStatus, submitTickets } from "./api.js";
import { initSeatControls } from "./seatControls.js";
export async function renderSeats(event, tabContent) {
  if (!tabContent) throw new Error("tabContent element required");
  const { eventId, timeId } = event;

  tabContent.innerHTML = `<div class="tibashi-loader">در حال بارگذاری...</div>`;

  try {
    const seatPlanData = await fetchSeatPlan(eventId);
    if (!seatPlanData.result)
      throw new Error(seatPlanData.message || "هیچ صندلی‌ای یافت نشد");

    const seatStatusData = await fetchSeatStatus(timeId);
    const book = (seatStatusData.result?.book || []).map(String);
    const ipg = (seatStatusData.result?.ipg || []).map(String);
    const temp = (seatStatusData.result?.temp || []).map(String);
    const soc = (seatStatusData.result?.soc || []).map(String);

    const programDataId = seatStatusData.result?.hallInfo?.event_id;
    if (!programDataId)
      throw new Error("programDataId is required for payment.");

    tabContent.innerHTML =
      buildControls() +
      buildSeatPlan(seatPlanData.result, book, ipg, temp, soc);

    const controls = initSeatControls(tabContent);

    controls.onPay(async (selectedSeats) => {
      if (!selectedSeats.length) return;

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
        Seats: selectedSeats.map((s) => ({
          SeatId: s.seatNumber.toString(),
          RowNumber: s.row.toString(),
          Number: s.seatNumber.toString(),
          Price: s.price,
        })),
      };

      try {
        const result = await submitTickets(payload);
        if (!result.status) {
          alert(result.message || "خطا در ثبت بلیط");
          tabContent.innerHTML =
            buildControls() +
            buildSeatPlan(seatPlanData.result, [], [], [], []);
          return;
        }

        const token = result.result?.mtoken;
        if (!token) {
          alert("توکن دریافت نشد");
          tabContent.innerHTML =
            buildControls() +
            buildSeatPlan(seatPlanData.result, [], [], [], []);
          return;
        }

        tabContent.innerHTML = "";

        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0,0,0,0.6)";
        modal.style.display = "flex";
        modal.style.flexDirection = "column";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "9999";
        modal.style.fontFamily = "Vazirmat, sans-serif";

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
        }, 4000);

        window.onpopstate = () => {
          modal.remove();
        };
      } catch (err) {
        console.error(err);
        alert("خطا در ارسال اطلاعات به سرور");

        tabContent.innerHTML =
          buildControls() + buildSeatPlan(seatPlanData.result, [], [], [], []);
      }
    });

    controls.onNext((selectedSeats) => {
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

//tibashi build 9/28/2025 a-imndst