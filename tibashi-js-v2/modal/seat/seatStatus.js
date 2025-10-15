// seat/seatStatus.js

export function getSeatClass(seatId, seatStatus) {
  const idStr = seatId.toString();
  if (seatStatus.PTAReserved.includes(idStr)) return 'PTAReserved';
  if (seatStatus.TempReserved.includes(idStr)) return 'TempReserved';
  if (seatStatus.Paid.includes(idStr)) return 'Paid';
  if (seatStatus.Blocked.includes(idStr)) return 'Blocked';
  return '';
}
