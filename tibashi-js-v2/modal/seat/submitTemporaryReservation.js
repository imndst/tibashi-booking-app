// seat/submitTemporaryReservation.js
import { createReservationPayload } from './createReservationPayload.js';
import { submitTickets } from '../../../utils.js';

export async function submitTemporaryReservation(selectedSeats, programId, timeId) {
  if (!selectedSeats.length) {
    alert("لطفا حداقل یک صندلی انتخاب کنید");
    return;
  }

  const payload = createReservationPayload(selectedSeats, programId, timeId);

  try {
    const result = await submitTickets(payload);

    if (result.Status) {
      alert(`توکن موفق دریافت شد: ${result.Result.mtoken}\nلینک پرداخت: ${result.Result.redirectUrl}`);
    } else {
      alert(`خطا: ${result.Message}`);
      console.error(result.Result);
    }
  } catch (err) {
    console.error(err);
    alert("خطا در ارسال اطلاعات به سرور");
  }
}
